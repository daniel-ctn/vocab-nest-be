import { describe, expect, it } from "vitest";
import { normalizeVocabularyQuery } from "../src/modules/vocabulary/vocabulary-normalize";

describe("normalizeVocabularyQuery", () => {
  it("trims, lowercases, and collapses whitespace", () => {
    expect(normalizeVocabularyQuery("  Negotiate   A Deal  ")).toBe("negotiate a deal");
  });
});
