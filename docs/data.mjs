// Original fictional catalogue fixtures. Excerpt attribution: SOURCES.md.
export const fixtures = {
  books: [
    {
      id: "001",
      title: "Alice’s Adventures in Wonderland",
      author: "Lewis Carroll",
      year: 1865,
      kind: "Book",
      subjects: ["fiction", "fantasy"],
      digitalId: "alice",
      shelf: "Fiction · C-12",
      copies: 3,
      available: 2,
    },
    {
      id: "002",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      year: 1813,
      kind: "Book",
      subjects: ["fiction", "courtship"],
      digitalId: "pride",
      shelf: "Fiction · A-04",
      copies: 2,
      available: 0,
    },
    {
      id: "003",
      title: "Coastal Botany Field Notes",
      author: "Demo Botanical Society",
      year: 1910,
      kind: "Journal",
      subjects: ["plants", "coast"],
      digitalId: null,
      shelf: "Journals · J-08",
      copies: 1,
      available: 1,
    },
    {
      id: "004",
      title: "Harbour Engineering Register",
      author: "Demo Harbour Office",
      year: 1922,
      kind: "Journal",
      subjects: ["harbour", "engineering"],
      digitalId: "missing-scan",
      shelf: "Archives · H-02",
      copies: 1,
      available: 0,
    },
  ],
  newspapers: [
    {
      recordNumber: "001",
      name: "The Example Gazette",
      editor: "Demo Press",
      publicationYear: 1901,
      topics: ["library", "reading room"],
      fileRef: "gazette",
      location: "Newspapers · N-01",
      totalCopies: 1,
      availableCopies: 1,
    },
    {
      recordNumber: "002",
      name: "The Example Gazette — Harbour Edition",
      editor: "Demo Press",
      publicationYear: 1902,
      topics: ["harbour", "transport"],
      fileRef: null,
      location: "Newspapers · N-02",
      totalCopies: 1,
      availableCopies: 1,
    },
  ],
  documents: [
    {
      id: "alice",
      sourceUrl: "https://www.gutenberg.org/ebooks/11",
      sourceLabel: "Lewis Carroll · Chapter I · public-domain text",
      pages: [
        {
          number: 1,
          text: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”",
        },
        {
          number: 2,
          text: "The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.",
        },
        {
          number: 3,
          text: "She took down a jar from one of the shelves as she passed; it was labelled “ORANGE MARMALADE”, but to her great disappointment it was empty: she did not like to drop the jar for fear of killing somebody underneath, so managed to put it into one of the cupboards as she fell past it.",
        },
      ],
    },
    {
      id: "pride",
      sourceUrl: "https://www.gutenberg.org/ebooks/1342",
      sourceLabel: "Jane Austen · Chapter I · public-domain text",
      pages: [
        {
          number: 1,
          text: "It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.",
        },
        {
          number: 2,
          text: "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
        },
      ],
    },
    {
      id: "gazette",
      sourceUrl: null,
      sourceLabel: "Original fictional demonstration text · CC0",
      pages: [
        {
          number: 1,
          text: "The new reading room opens on Monday. Residents may consult the book catalogue and newspaper archive at the enquiry desk. Reference volumes remain in the building; circulating copies may be borrowed.",
        },
        {
          number: 2,
          text: "The harbour board announced repairs to the eastern pier. A temporary footbridge will keep the waterfront accessible while the timber supports are replaced. The engineering register records the dimensions of each beam.",
        },
      ],
    },
  ],
};
