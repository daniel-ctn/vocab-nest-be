import { describe, expect, it } from "vitest";
import {
  selectPracticeVocabulary,
  updateDifficultyAfterReview,
  type PracticeCandidate,
} from "../src/modules/practice/practice-selection";

const today = new Date("2026-05-02T00:00:00.000Z");

describe("selectPracticeVocabulary", () => {
  it("prioritizes hard, stale, low-review words and caps at 10", () => {
    const candidates: PracticeCandidate[] = Array.from({ length: 12 }, (_, index) => ({
      id: `word-${index}`,
      difficulty: index === 11 ? "hard" : "easy",
      favorite: false,
      reviewCount: index === 10 ? 0 : 5,
      lastReviewedAt: index === 9 ? null : new Date("2026-05-01T00:00:00.000Z"),
    }));

    const selected = selectPracticeVocabulary(candidates, {
      today,
      random: () => 0,
    });

    expect(selected).toHaveLength(10);
    expect(selected[0]?.id).toBe("word-11");
    expect(selected.map((item) => item.id)).toContain("word-9");
    expect(new Set(selected.map((item) => item.id)).size).toBe(selected.length);
  });
});

describe("updateDifficultyAfterReview", () => {
  it("increases difficulty for again or hard ratings", () => {
    expect(updateDifficultyAfterReview("easy", "again")).toBe("medium");
    expect(updateDifficultyAfterReview("medium", "hard")).toBe("hard");
  });

  it("reduces difficulty for good or easy ratings", () => {
    expect(updateDifficultyAfterReview("hard", "good")).toBe("medium");
    expect(updateDifficultyAfterReview("medium", "easy")).toBe("easy");
  });
});
