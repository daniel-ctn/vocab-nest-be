import { prisma } from "../../db/prisma";
import { toDateOnly } from "../../shared/dates";
import { toVocabularyDto } from "../vocabulary/vocabulary.service";

export const getDashboardSummary = async (userId: string) => {
  const today = toDateOnly();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalVocabulary,
    totalGroups,
    todayPractice,
    difficultWordsCount,
    favoriteWordsCount,
    recentlySavedWords,
    duePracticeWords,
  ] = await prisma.$transaction([
    prisma.vocabulary.count({ where: { userId } }),
    prisma.vocabularyGroup.count({ where: { userId } }),
    prisma.dailyPractice.findUnique({ where: { userId_date: { userId, date: today } } }),
    prisma.vocabulary.count({ where: { userId, difficulty: "hard" } }),
    prisma.vocabulary.count({ where: { userId, favorite: true } }),
    prisma.vocabulary.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { groupRelations: { include: { group: true } } },
    }),
    prisma.vocabulary.findMany({
      where: {
        userId,
        OR: [{ lastReviewedAt: null }, { lastReviewedAt: { lt: sevenDaysAgo } }],
      },
      orderBy: [{ difficulty: "desc" }, { reviewCount: "asc" }, { createdAt: "asc" }],
      take: 10,
      include: { groupRelations: { include: { group: true } } },
    }),
  ]);

  return {
    totalVocabulary,
    totalGroups,
    practicedToday: Boolean(todayPractice),
    todayPracticeCompleted: todayPractice?.completed ?? false,
    difficultWordsCount,
    favoriteWordsCount,
    recentlySavedWords: recentlySavedWords.map(toVocabularyDto),
    duePracticeWords: duePracticeWords.map(toVocabularyDto),
  };
};
