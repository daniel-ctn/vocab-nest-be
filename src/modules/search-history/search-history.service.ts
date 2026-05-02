import { prisma } from '../../db/prisma'
import { notFound } from '../../shared/errors'
import { toPagination } from '../../shared/pagination'

export const toSearchHistoryDto = (item: any) => ({
  id: item.id,
  userId: item.userId,
  query: item.query,
  normalizedQuery: item.normalizedQuery,
  resultJson: item.resultJson,
  savedVocabularyId: item.savedVocabularyId,
  demoMode: item.demoMode,
  createdAt: item.createdAt.toISOString(),
})

export const listSearchHistory = async (userId: string, page = 1, pageSize = 20) => {
  const [items, total] = await prisma.$transaction([
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.searchHistory.count({ where: { userId } }),
  ])

  return {
    items: items.map(toSearchHistoryDto),
    meta: toPagination(page, pageSize, total),
  }
}

export const getSearchHistory = async (userId: string, id: string) => {
  const item = await prisma.searchHistory.findFirst({ where: { id, userId } })
  if (!item) {
    throw notFound('Search history item')
  }
  return toSearchHistoryDto(item)
}
