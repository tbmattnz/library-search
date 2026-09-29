// Pure, dependency-free retrieval. No AI or external service calls.
const stop = new Set(
  "a an and are as at be by do does for from had has have how i in is it its may of on or that the their these this to was were what when where which who with".split(
    " ",
  ),
);
export function tokens(text) {
  return (
    String(text)
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((t) => !stop.has(t)) ?? []
  );
}
export function normalise({ books, newspapers }) {
  const rows = [
    ...books.map((b) => ({
      ...b,
      key: `books:${b.id}`,
      source: "Books & journals",
    })),
    ...newspapers.map((n) => ({
      key: `newspapers:${n.recordNumber}`,
      source: "Newspapers",
      id: n.recordNumber,
      title: n.name,
      author: n.editor,
      year: n.publicationYear,
      kind: "Newspaper",
      subjects: n.topics,
      digitalId: n.fileRef,
      shelf: n.location,
      copies: n.totalCopies,
      available: n.availableCopies,
    })),
  ];
  if (new Set(rows.map((r) => r.key)).size !== rows.length)
    throw new Error("Duplicate source record identifier");
  return rows;
}
function corpus(entries) {
  const df = new Map();
  const docs = entries.map((e) => {
    const ts = tokens(e.text),
      counts = new Map();
    for (const t of ts) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const t of counts.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    return { ...e, counts, length: ts.length };
  });
  return {
    docs,
    df,
    avg: docs.reduce((n, d) => n + d.length, 0) / (docs.length || 1) || 1,
  };
}
function rank(index, terms) {
  return index.docs
    .map((d) => {
      let score = 0;
      const matched = [];
      for (const term of terms) {
        const tf = d.counts.get(term) ?? 0;
        if (!tf) continue;
        matched.push(term);
        const freq = index.df.get(term),
          n = index.docs.length;
        const idf = Math.log(1 + (n - freq + 0.5) / (freq + 0.5));
        score +=
          (idf * tf * 2.2) /
          (tf + 1.2 * (0.25 + (0.75 * d.length) / index.avg));
      }
      return { ...d, score, matched };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
export function buildIndex(records, documents) {
  const map = new Map();
  for (const doc of documents) {
    if (map.has(doc.id)) throw new Error("Duplicate digital identifier");
    const seen = new Set();
    for (const p of doc.pages) {
      if (
        !Number.isInteger(p.number) ||
        p.number < 1 ||
        seen.has(p.number) ||
        typeof p.text !== "string"
      )
        throw new Error("Invalid document page");
      seen.add(p.number);
    }
    map.set(doc.id, structuredClone(doc));
  }
  return {
    documents: map,
    metadata: corpus(
      records.map((r) => ({
        id: r.key,
        text: [r.title, r.author, r.year, r.kind, ...r.subjects].join(" "),
      })),
    ),
    pages: corpus(
      documents.flatMap((d) =>
        d.pages.map((p) => ({
          id: `${d.id}:${p.number}`,
          digitalId: d.id,
          page: p.number,
          text: p.text,
        })),
      ),
    ),
  };
}
export function resolveCitation(index, digitalId, page) {
  const doc = index.documents.get(digitalId),
    unit = doc?.pages.find((p) => p.number === page);
  return unit
    ? {
        digitalId,
        page,
        text: unit.text,
        sourceLabel: doc.sourceLabel,
        sourceUrl: doc.sourceUrl,
      }
    : null;
}
export function search(
  index,
  records,
  query,
  { kind = "All", availableOnly = false } = {},
) {
  if (typeof query !== "string" || query.length > 300)
    throw new Error("Use a query of 300 characters or fewer.");
  const terms = [...new Set(tokens(query))];
  if (!terms.length) return [];
  const meta = new Map(rank(index.metadata, terms).map((m) => [m.id, m]));
  const pages = rank(index.pages, terms);
  return records
    .filter(
      (r) =>
        (kind === "All" || r.kind === kind) &&
        (!availableOnly || r.available > 0),
    )
    .map((record) => {
      const document = index.documents.get(record.digitalId);
      const evidence = pages
        .filter((p) => p.digitalId === record.digitalId)
        .slice(0, 3)
        .map((p) => ({
          ...resolveCitation(index, p.digitalId, p.page),
          score: p.score,
          matched: p.matched,
        }));
      const m = meta.get(record.key);
      return {
        record,
        score: (m?.score ?? 0) * 2 + (evidence[0]?.score ?? 0),
        metadataMatch: Boolean(m),
        matched: [
          ...new Set([
            ...(m?.matched ?? []),
            ...evidence.flatMap((p) => p.matched),
          ]),
        ],
        evidence,
        digitalStatus: document
          ? "linked"
          : record.digitalId
            ? "broken"
            : "none",
      };
    })
    .filter((r) => r.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.record.key.localeCompare(b.record.key),
    );
}
