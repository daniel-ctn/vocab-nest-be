import { daysBetween } from "../../shared/dates";

export type PracticeCandidate = {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  favorite: boolean;
  reviewCount: number;
  lastReviewedAt: Date | null;
};

export type ReviewRating = "again" | "hard" | "good" | "easy";
export type Difficulty = PracticeCandidate["difficulty"];

export const scorePracticeCandidate = (candidate: PracticeCandidate, today = new Date()) => {
  let score = 0;
  if (candidate.difficulty === "hard") score += 30;
  if (candidate.difficulty === "medium") score += 15;
  if (!candidate.lastReviewedAt) score += 25;
  if (candidate.lastReviewedAt && daysBetween(candidate.lastReviewedAt, today) >= 7) score += 20;
  if (candidate.reviewCount <= 2) score += 10;
  if (candidate.favorite) score += 5;
  return score;
};

export const selectPracticeVocabulary = (
  candidates: PracticeCandidate[],
  options: { maxItems?: number; today?: Date; random?: () => number } = {},
) => {
  const maxItems = options.maxItems ?? 10;
  const today = options.today ?? new Date();
  const random = options.random ?? Math.random;
  const seen = new Set<string>();

  return candidates
    .filter((candidate) => {
      if (seen.has(candidate.id)) return false;
      seen.add(candidate.id);
      return true;
    })
    .map((candidate) => ({
      candidate,
      score: scorePracticeCandidate(candidate, today),
      tieBreaker: random(),
    }))
    .sort((a, b) => b.score - a.score || b.tieBreaker - a.tieBreaker)
    .slice(0, maxItems)
    .map(({ candidate }) => candidate);
};

export const updateDifficultyAfterReview = (
  currentDifficulty: Difficulty,
  rating: ReviewRating,
): Difficulty => {
  if (rating === "again" || rating === "hard") {
    if (currentDifficulty === "easy") return "medium";
    return "hard";
  }

  if (currentDifficulty === "hard") return "medium";
  return "easy";
};
