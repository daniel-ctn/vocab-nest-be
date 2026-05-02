export const normalizeVocabularyQuery = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, " ");
