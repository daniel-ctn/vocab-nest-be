import type { GroupCreateRequest, GroupUpdateRequest } from '../../contracts'
import { prisma } from '../../db/prisma'
import { conflict, notFound } from '../../shared/errors'
import { toVocabularyDto } from '../vocabulary/vocabulary.service'

export const toGroupDto = (group: any) => ({
  id: group.id,
  userId: group.userId,
  name: group.name,
  description: group.description,
  color: group.color,
  vocabularyCount: group._count?.vocabulary,
  createdAt: group.createdAt.toISOString(),
  updatedAt: group.updatedAt.toISOString(),
})

export const createGroup = async (userId: string, input: GroupCreateRequest) => {
  try {
    const group = await prisma.vocabularyGroup.create({
      data: { userId, ...input },
      include: { _count: { select: { vocabulary: true } } },
    })
    return toGroupDto(group)
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw conflict('A group with this name already exists.')
    }
    throw error
  }
}

export const listGroups = async (userId: string) => {
  const groups = await prisma.vocabularyGroup.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { vocabulary: true } } },
  })
  return groups.map(toGroupDto)
}

export const getGroup = async (userId: string, id: string) => {
  const group = await prisma.vocabularyGroup.findFirst({
    where: { id, userId },
    include: { _count: { select: { vocabulary: true } } },
  })
  if (!group) {
    throw notFound('Group')
  }
  return toGroupDto(group)
}

export const updateGroup = async (userId: string, id: string, input: GroupUpdateRequest) => {
  await getGroup(userId, id)
  const group = await prisma.vocabularyGroup.update({
    where: { id },
    data: input,
    include: { _count: { select: { vocabulary: true } } },
  })
  return toGroupDto(group)
}

export const deleteGroup = async (userId: string, id: string) => {
  await getGroup(userId, id)
  await prisma.vocabularyGroup.delete({ where: { id } })
  return { deleted: true }
}

export const listGroupVocabulary = async (userId: string, id: string) => {
  await getGroup(userId, id)
  const items = await prisma.vocabulary.findMany({
    where: {
      userId,
      groupRelations: {
        some: { groupId: id },
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      groupRelations: {
        include: { group: true },
      },
    },
  })
  return items.map(toVocabularyDto)
}
