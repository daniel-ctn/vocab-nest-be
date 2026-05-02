import type {
  VocabularyCreateRequest,
  VocabularyListQuery,
  VocabularyUpdateRequest,
} from "@vocabnest/contracts";
import { prisma } from "../../db/prisma";
import { conflict, notFound } from "../../shared/errors";
import { toPagination } from "../../shared/pagination";
import { generateVocabularyDetails } from "./vocabulary-ai.service";
import { dedupeGroupIds } from "./vocabulary-groups";
import { normalizeVocabularyQuery } from "./vocabulary-normalize";

const asArray = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

export const toVocabularyDto = (vocabulary: any) => ({
  id: vocabulary.id,
  userId: vocabulary.userId,
  word: vocabulary.word,
  normalizedWord: vocabulary.normalizedWord,
  isPhrase: vocabulary.isPhrase,
  partOfSpeech: vocabulary.partOfSpeech,
  cefrLevel: vocabulary.cefrLevel,
  englishDefinition: vocabulary.englishDefinition,
  vietnameseMeaning: vocabulary.vietnameseMeaning,
  simpleExplanation: vocabulary.simpleExplanation,
  pronunciation: vocabulary.pronunciation,
  ipa: vocabulary.ipa,
  synonyms: asArray(vocabulary.synonyms),
  antonyms: asArray(vocabulary.antonyms),
  examples: asArray(vocabulary.examples),
  collocations: asArray(vocabulary.collocations),
  usageNotes: vocabulary.usageNotes,
  commonMistakes: asArray(vocabulary.commonMistakes),
  wordFamily: asArray(vocabulary.wordFamily),
  tags: asArray(vocabulary.tags),
  personalNote: vocabulary.personalNote,
  difficulty: vocabulary.difficulty,
  favorite: vocabulary.favorite,
  reviewCount: vocabulary.reviewCount,
  lastReviewedAt: vocabulary.lastReviewedAt?.toISOString() ?? null,
  createdAt: vocabulary.createdAt.toISOString(),
  updatedAt: vocabulary.updatedAt.toISOString(),
  groups:
    vocabulary.groupRelations?.map((relation: any) => ({
      id: relation.group.id,
      name: relation.group.name,
      color: relation.group.color,
    })) ?? [],
});

const vocabularyInclude = {
  groupRelations: {
    include: {
      group: true,
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
};

const ensureGroupsBelongToUser = async (userId: string, groupIds: string[]) => {
  const uniqueGroupIds = dedupeGroupIds(groupIds);
  if (uniqueGroupIds.length === 0) {
    return uniqueGroupIds;
  }

  const count = await prisma.vocabularyGroup.count({
    where: {
      userId,
      id: { in: uniqueGroupIds },
    },
  });

  if (count !== uniqueGroupIds.length) {
    throw notFound("One or more groups");
  }

  return uniqueGroupIds;
};

export const searchVocabulary = async (userId: string, query: string) => {
  const normalizedQuery = normalizeVocabularyQuery(query);
  const { result, demoMode } = await generateVocabularyDetails(query);

  const history = await prisma.searchHistory.create({
    data: {
      userId,
      query,
      normalizedQuery,
      resultJson: result as any,
      demoMode,
    },
  });

  return { result, demoMode, searchHistoryId: history.id };
};

export const createVocabulary = async (userId: string, input: VocabularyCreateRequest) => {
  const groupIds = await ensureGroupsBelongToUser(userId, input.groupIds ?? []);

  try {
    const vocabulary = await prisma.vocabulary.create({
      data: {
        userId,
        word: input.word,
        normalizedWord: normalizeVocabularyQuery(input.normalizedWord || input.word),
        isPhrase: input.isPhrase,
        partOfSpeech: input.partOfSpeech,
        cefrLevel: input.cefrLevel,
        englishDefinition: input.englishDefinition,
        vietnameseMeaning: input.vietnameseMeaning,
        simpleExplanation: input.simpleExplanation,
        pronunciation: input.pronunciation,
        ipa: input.ipa,
        synonyms: input.synonyms as any,
        antonyms: input.antonyms as any,
        examples: input.examples as any,
        collocations: input.collocations as any,
        usageNotes: input.usageNotes,
        commonMistakes: input.commonMistakes as any,
        wordFamily: input.wordFamily as any,
        tags: input.tags as any,
        personalNote: input.personalNote,
        difficulty: input.difficulty,
        favorite: input.favorite,
        groupRelations: {
          create: groupIds.map((groupId) => ({ groupId })),
        },
      },
      include: vocabularyInclude,
    });

    return toVocabularyDto(vocabulary);
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw conflict("This vocabulary item is already saved.");
    }
    throw error;
  }
};

export const listVocabulary = async (userId: string, query: VocabularyListQuery) => {
  const where: any = {
    userId,
    ...(query.q
      ? {
          OR: [
            { word: { contains: query.q, mode: "insensitive" } },
            { normalizedWord: { contains: normalizeVocabularyQuery(query.q), mode: "insensitive" } },
            { englishDefinition: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(query.groupId
      ? { groupRelations: { some: { groupId: query.groupId, group: { userId } } } }
      : {}),
    ...(query.difficulty ? { difficulty: query.difficulty } : {}),
    ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
    ...(query.partOfSpeech ? { partOfSpeech: query.partOfSpeech } : {}),
    ...(query.favorite === undefined ? {} : { favorite: query.favorite }),
  };

  const orderBy =
    query.sort === "oldest"
      ? { createdAt: "asc" as const }
      : query.sort === "alphabetical"
        ? { normalizedWord: "asc" as const }
        : query.sort === "lastReviewed"
          ? { lastReviewedAt: "desc" as const }
          : { createdAt: "desc" as const };

  const [items, total] = await prisma.$transaction([
    prisma.vocabulary.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: vocabularyInclude,
    }),
    prisma.vocabulary.count({ where }),
  ]);

  return {
    items: items.map(toVocabularyDto),
    meta: toPagination(query.page, query.pageSize, total),
  };
};

export const getVocabulary = async (userId: string, id: string) => {
  const vocabulary = await prisma.vocabulary.findFirst({
    where: { id, userId },
    include: vocabularyInclude,
  });

  if (!vocabulary) {
    throw notFound("Vocabulary");
  }

  return toVocabularyDto(vocabulary);
};

export const updateVocabulary = async (
  userId: string,
  id: string,
  input: VocabularyUpdateRequest,
) => {
  await getVocabulary(userId, id);

  const vocabulary = await prisma.vocabulary.update({
    where: { id },
    data: {
      ...input,
      ...(input.normalizedWord || input.word
        ? { normalizedWord: normalizeVocabularyQuery(input.normalizedWord ?? input.word ?? "") }
        : {}),
      synonyms: input.synonyms as any,
      antonyms: input.antonyms as any,
      examples: input.examples as any,
      collocations: input.collocations as any,
      commonMistakes: input.commonMistakes as any,
      wordFamily: input.wordFamily as any,
      tags: input.tags as any,
    },
    include: vocabularyInclude,
  });

  return toVocabularyDto(vocabulary);
};

export const deleteVocabulary = async (userId: string, id: string) => {
  await getVocabulary(userId, id);
  await prisma.vocabulary.delete({ where: { id } });
  return { deleted: true };
};

export const replaceVocabularyGroups = async (userId: string, id: string, groupIds: string[]) => {
  await getVocabulary(userId, id);
  const uniqueGroupIds = await ensureGroupsBelongToUser(userId, groupIds);

  await prisma.$transaction([
    prisma.vocabularyGroupRelation.deleteMany({ where: { vocabularyId: id } }),
    prisma.vocabularyGroupRelation.createMany({
      data: uniqueGroupIds.map((groupId) => ({ vocabularyId: id, groupId })),
      skipDuplicates: true,
    }),
  ]);

  return getVocabulary(userId, id);
};

export const updateFavorite = async (userId: string, id: string, favorite: boolean) => {
  await getVocabulary(userId, id);
  const vocabulary = await prisma.vocabulary.update({
    where: { id },
    data: { favorite },
    include: vocabularyInclude,
  });
  return toVocabularyDto(vocabulary);
};

export const updateDifficulty = async (
  userId: string,
  id: string,
  difficulty: "easy" | "medium" | "hard",
) => {
  await getVocabulary(userId, id);
  const vocabulary = await prisma.vocabulary.update({
    where: { id },
    data: { difficulty },
    include: vocabularyInclude,
  });
  return toVocabularyDto(vocabulary);
};

export const verifyReplaceGroupIds = async (userId: string, groupIds: string[]) =>
  ensureGroupsBelongToUser(userId, groupIds);
