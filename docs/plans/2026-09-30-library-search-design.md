# Library search portfolio sample

Approved direction: a dedicated commercial library case study plus an original runnable search sample, using public-domain excerpts and fictional holdings. No commercial source is copied.

## Design

Three read-only fixture inputs represent a book/journal catalogue, a newspaper catalogue and a digital repository. Adapters preserve source namespaces and explicit digital identifiers. A pure JavaScript search module ranks catalogue metadata and document pages with BM25. The browser displays structured holdings and exact excerpts with citations; it never synthesises an answer. A document reader resolves citations back to the indexed page. The static demo and local Node server use identical modules.

A compact page-based excerpt fixture stands in for already extracted text; OCR, embeddings, multilingual search, proprietary library connectors and model inference are outside scope. Alternatives considered: a heavyweight vector/LLM stack would complicate verification; a screenshot-only case study would not provide executable evidence. A dependency-free runnable retrieval sample gives the clearest inspectable demonstration.

## Implementation and verification plan

1. Write fixtures and normalisation, then BM25 ranking and citation resolution.
2. Build responsive search, filters, document reader and availability simulation.
3. Test identifier collisions, dangling links, page references, metadata-only hits, unknown queries and availability changes without reindexing.
4. Verify desktop/mobile UI and publish source, demo and case study.

The existing approval covers this scope. No extra packages are required. The referenced writing-plans skill is unavailable locally; this document contains the implementation plan.
