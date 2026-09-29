import { fixtures } from "./data.mjs";
import {
  normalise,
  buildIndex,
  search,
  tokens,
  resolveCitation,
} from "./search.mjs";
const records = normalise(fixtures),
  index = buildIndex(records, fixtures.documents);
const $ = (id) => document.getElementById(id);
const el = (tag, text, cls) => {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
};
function highlight(text, query) {
  const frag = document.createDocumentFragment(),
    wanted = new Set(tokens(query));
  for (const bit of text.split(/([\p{L}\p{N}]+)/gu))
    frag.append(
      wanted.has(bit.normalize("NFKC").toLowerCase())
        ? el("mark", bit)
        : document.createTextNode(bit),
    );
  return frag;
}
function openReader(record, page) {
  const source = resolveCitation(index, record.digitalId, page);
  if (!source) return;
  $("reader-title").textContent = record.title;
  $("reader-location").textContent =
    `${record.key} → ${source.digitalId} · Demo page ${source.page} (excerpt pagination)`;
  $("reader-text").textContent = source.text;
  $("reader-credit").textContent = source.sourceLabel;
  $("reader-source").hidden = !source.sourceUrl;
  if (source.sourceUrl) $("reader-source").href = source.sourceUrl;
  else $("reader-source").removeAttribute("href");
  $("reader").showModal();
}
function render() {
  const query = $("search").value.trim();
  const hits = search(index, records, query, {
    kind: $("kind").value,
    availableOnly: $("available").checked,
  });
  $("results").replaceChildren();
  $("result-count").textContent =
    `${hits.length} ${hits.length === 1 ? "record" : "records"} found`;
  if (!hits.length) {
    const n = el("div", undefined, "empty");
    n.append(
      el(
        "h3",
        query
          ? "No matching evidence in this sample."
          : "Start with a title, author or phrase.",
      ),
      el(
        "p",
        query
          ? "Try different keywords or clear the material and availability filters. This small collection cannot answer questions beyond its indexed records and excerpts."
          : "Search the catalogue and digitised excerpts together.",
      ),
    );
    $("results").append(n);
    return;
  }
  for (const hit of hits) {
    const r = hit.record,
      card = el("article", undefined, "result"),
      top = el("div", undefined, "result-top"),
      identity = el("div");
    identity.append(
      el("span", `${r.kind} / ${r.source}`, "badge"),
      el("h3", r.title),
      el("p", `${r.author} · ${r.year}`, "meta"),
    );
    top.append(
      identity,
      el(
        "span",
        r.available
          ? `${r.available} of ${r.copies} ${r.copies === 1 ? "copy" : "copies"} available`
          : `On loan · ${r.copies} ${r.copies === 1 ? "copy" : "copies"}`,
        "availability" + (r.available ? "" : " unavailable"),
      ),
    );
    const holding = el("div", undefined, "holding");
    holding.append(
      el("span", `Location: ${r.shelf}`),
      el("span", `Record: ${r.key}`),
    );
    card.append(top, holding);
    if (hit.metadataMatch)
      card.append(el("p", "Matched catalogue metadata.", "notice"));
    for (const evidence of hit.evidence) {
      const block = el("div", undefined, "evidence");
      block.append(
        el(
          "div",
          `EXACT EXCERPT · ${evidence.digitalId} · DEMO PAGE ${evidence.page}`,
          "citation",
        ),
      );
      const p = el("p");
      p.append(highlight(evidence.text, query));
      const b = el("button", `Open source · demo page ${evidence.page}`);
      b.type = "button";
      b.onclick = () => openReader(r, evidence.page);
      block.append(p, b);
      card.append(block);
    }
    if (!hit.evidence.length && hit.digitalStatus === "linked") {
      card.append(
        el(
          "p",
          "A digital excerpt is linked; this query did not match its text.",
          "notice",
        ),
      );
      const b = el("button", "Browse linked excerpt", "text-button");
      b.onclick = () =>
        openReader(r, index.documents.get(r.digitalId).pages[0].number);
      card.append(b);
    }
    if (hit.digitalStatus === "none")
      card.append(
        el("p", "Catalogue record only — no digital copy is linked.", "notice"),
      );
    if (hit.digitalStatus === "broken")
      card.append(
        el(
          "p",
          `Digital link unresolved (${r.digitalId}). The catalogue record is retained; no passage is invented.`,
          "notice warning",
        ),
      );
    $("results").append(card);
  }
}
$("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  render();
});
for (const b of document.querySelectorAll("[data-query]"))
  b.onclick = () => {
    $("search").value = b.dataset.query;
    $("kind").value = "All";
    $("available").checked = false;
    render();
  };
$("kind").onchange = render;
$("available").onchange = render;
$("close-reader").onclick = () => $("reader").close();
$("loan").onclick = () => {
  const alice = records.find((r) => r.key === "books:001");
  alice.available = alice.available ? 0 : 2;
  $("loan").textContent = alice.available
    ? "Simulate Alice copies on loan"
    : "Restore Alice availability";
  $("loan-status").textContent =
    `Alice: ${alice.available} of 3 copies available. Text index unchanged.`;
  render();
};
render();
