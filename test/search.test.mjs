import test from "node:test";
import assert from "node:assert/strict";
import { fixtures } from "../docs/data.mjs";
import {
  normalise,
  buildIndex,
  search,
  resolveCitation,
} from "../docs/search.mjs";
import { makeServer } from "../server.mjs";
function setup() {
  const records = normalise(fixtures);
  return { records, index: buildIndex(records, fixtures.documents) };
}
test("catalogue adapters retain independent records with colliding source IDs", () => {
  const { records } = setup();
  assert.equal(records.length, 6);
  assert.equal(new Set(records.map((r) => r.key)).size, 6);
  assert.ok(records.some((r) => r.key === "books:001"));
  assert.ok(records.some((r) => r.key === "newspapers:001"));
});
test("source inputs remain unchanged through normalisation and indexing", () => {
  const before = JSON.stringify(fixtures);
  const { records, index } = setup();
  search(index, records, "reading room");
  records[0].available = 0;
  assert.equal(JSON.stringify(fixtures), before);
});
test("full-text-only query resolves the exact page and original document", () => {
  const { records, index } = setup();
  const hits = search(index, records, "orange marmalade");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].record.key, "books:001");
  assert.equal(hits[0].metadataMatch, false);
  assert.equal(hits[0].evidence[0].page, 3);
  assert.equal(hits[0].evidence[0].text, fixtures.documents[0].pages[2].text);
  assert.deepEqual(
    resolveCitation(index, "alice", 3).text,
    hits[0].evidence[0].text,
  );
});
test("author metadata match never manufactures a full-text citation", () => {
  const { records, index } = setup();
  const hit = search(index, records, "Jane Austen")[0];
  assert.equal(hit.record.key, "books:002");
  assert.equal(hit.metadataMatch, true);
  assert.deepEqual(hit.evidence, []);
});
test("newspaper adapter joins explicit digital identifier", () => {
  const { records, index } = setup();
  const hit = search(index, records, "reading room")[0];
  assert.equal(hit.record.key, "newspapers:001");
  assert.equal(hit.evidence[0].digitalId, "gazette");
  assert.equal(hit.evidence[0].page, 1);
});
test("missing and broken digital links preserve searchable records without citations", () => {
  const { records, index } = setup();
  const coastal = search(index, records, "coastal botany")[0];
  assert.equal(coastal.digitalStatus, "none");
  assert.deepEqual(coastal.evidence, []);
  const broken = search(index, records, "harbour engineering").find(
    (r) => r.record.key === "books:004",
  );
  assert.equal(broken.digitalStatus, "broken");
  assert.deepEqual(broken.evidence, []);
  assert.equal(resolveCitation(index, "missing-scan", 1), null);
  assert.equal(resolveCitation(index, "alice", 999), null);
});
test("holdings are read from current catalogue without rebuilding text index", () => {
  const { records, index } = setup();
  assert.equal(
    search(index, records, "marmalade", { availableOnly: true }).length,
    1,
  );
  records.find((r) => r.key === "books:001").available = 0;
  assert.equal(
    search(index, records, "marmalade", { availableOnly: true }).length,
    0,
  );
  assert.equal(search(index, records, "marmalade")[0].record.available, 0);
});
test("material filters constrain results even when text matches", () => {
  const { records, index } = setup();
  assert.equal(
    search(index, records, "marmalade", { kind: "Newspaper" }).length,
    0,
  );
  assert.equal(
    search(index, records, "reading room", { kind: "Newspaper" }).length,
    1,
  );
});
test("unknown, empty and stopword-only queries return no evidence", () => {
  const { records, index } = setup();
  for (const q of ["", "the and of", "quantum entanglement"])
    assert.deepEqual(search(index, records, q), []);
  assert.throws(() => search(index, records, "a".repeat(301)));
});
test("ranking is deterministic and duplicate query terms do not inflate scores", () => {
  const { records, index } = setup();
  assert.deepEqual(
    search(index, records, "harbour"),
    search(index, records, "harbour harbour"),
  );
  assert.deepEqual(
    search(index, records, "harbour"),
    search(index, records, "harbour"),
  );
});
test("invalid duplicate page and record identifiers are rejected", () => {
  const { records } = setup();
  const docs = structuredClone(fixtures.documents);
  docs[0].pages.push({ ...docs[0].pages[0] });
  assert.throws(() => buildIndex(records, docs));
  const raw = structuredClone(fixtures);
  raw.books.push({ ...raw.books[0] });
  assert.throws(() => normalise(raw));
});
test("server exposes only demo assets, serves modules and rejects writes", async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  try {
    const url = `http://127.0.0.1:${server.address().port}`;
    const home = await fetch(url);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Follow the evidence/);
    assert.equal((await fetch(url + "/search.mjs")).status, 200);
    assert.equal((await fetch(url + "/package.json")).status, 404);
    assert.equal((await fetch(url + "/test/search.test.mjs")).status, 404);
    assert.equal((await fetch(url, { method: "POST" })).status, 405);
  } finally {
    await new Promise((r) => server.close(r));
  }
});
