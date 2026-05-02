import type { ReviewRating } from "@vocabnest/contracts";
import { prisma } from "../../db/prisma";
import { toDateOnly, toIsoDate } from "../../shared/dates";
import { notFound } from "../../shared/errors";
import { toVocabularyDto } from "../vocabulary/vocabulary.service";
import { selectPracticeVocabulary, updateDifficultyAfterReview } from "./practice-selection";

const practiceInclude = {
  items: {
    orderBy: { position: "asc" as const },
    include: {
      vocabulary: {
        include: {
          groupRelations: {
            include: { group: true },
          },
        },
      },
    },
  },
};

export const toPracticeItemDto = (item: any) => ({
  id: item.id,
  dailyPracticeId: item.dailyPracticeId,
  vocabularyId: item.vocabularyId,
  position: item.position,
  rating: item.rating,
  reviewedAt: item.reviewedAt?.toISOString() ?? null,
  vocabulary: item.vocabulary ? toVocabularyDto(item.vocabulary) : undefined,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});

export const toDailyPracticeDto = (practice: any) => ({
  id: practice.id,
  userId: practice.userId,
  date: toIsoDate(practice.date),
  completed: practice.completed,
  completedAt: practice.completedAt?.toISOString() ?? null,
  items: practice.items.map(toPracticeItemDto),
  createdAt: practice.createdAt.toISOString(),
  updatedAt: practice.updatedAt.toISOString(),
});

export const getOrCreateTodayPractice = async (userId: string, today = new Date()) => {
  const date = toDateOnly(today);
  const existing = await prisma.dailyPractice.findUnique({
    where: { userId_date: { userId, date } },
    include: practiceInclude,
  });

  if (existing) {
    return toDailyPracticeDto(existing);
  }

  const vocabulary = await prisma.vocabulary.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  const selected = selectPracticeVocabulary(vocabulary, { today: date });

  const practice = await prisma.dailyPractice.create({
    data: {
      userId,
      date,
      items: {
        create: selected.map((item, index) => ({
          vocabularyId: item.id,
          position: index + 1,
        })),
      },
    },
    include: practiceInclude,
  });

  return toDailyPracticeDto(practice);
};

export const reviewPracticeItem = async (
  userId: string,
  practiceId: string,
  itemId: string,
  rating: ReviewRating,
) => {
  const item = await prisma.dailyPracticeItem.findFirst({
    where: {
      id: itemId,
      dailyPracticeId: practiceId,
      dailyPractice: { userId },
    },
    include: { vocabulary: true },
  });

  if (!item) {
    throw notFound("Practice item");
  }

  const now = new Date();
  const nextDifficulty = updateDifficultyAfterReview(item.vocabulary.difficulty, rating);

  const [updatedItem] = await prisma.$transaction([
    prisma.dailyPracticeItem.update({
      where: { id: item.id },
      data: { rating, reviewedAt: now },
      include: {
        vocabulary: {
          include: {
            groupRelations: {
              include: { group: true },
            },
          },
        },
      },
    }),
    prisma.vocabulary.update({
      where: { id: item.vocabularyId },
      data: {
        reviewCount: { increment: 1 },
        lastReviewedAt: now,
        difficulty: nextDifficulty,
      },
    }),
  ]);

  return toPracticeItemDto(updatedItem);
};

export const completePractice = async (userId: string, id: string) => {
  const existing = await prisma.dailyPractice.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    throw notFound("Daily practice");
  }

  const practice = await prisma.dailyPractice.update({
    where: { id },
    data: {
      completed: true,
      completedAt: existing.completedAt ?? new Date(),
    },
    include: practiceInclude,
  });

  return toDailyPracticeDto(practice);
};
