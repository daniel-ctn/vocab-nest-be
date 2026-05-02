import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../src/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const toDateOnly = (date = new Date()) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

const vocabularySeed = [
  'negotiate',
  'reliable',
  'hesitate',
  'accomplish',
  'maintain',
  'eventually',
  'clarify',
  'requirement',
  'improve',
  'efficient',
  'opportunity',
  'consequence',
  'approach',
  'temporary',
  'significant',
  'accurate',
  'prioritize',
  'consistent',
  'adapt',
  'resourceful',
]

const makeVocabulary = (word: string, index: number) => {
  const difficulty = (index % 5 === 0 ? 'hard' : index % 2 === 0 ? 'medium' : 'easy') as
    | 'easy'
    | 'medium'
    | 'hard'

  return {
    word,
    normalizedWord: word,
    isPhrase: false,
    partOfSpeech: index % 3 === 0 ? 'verb' : index % 3 === 1 ? 'adjective' : 'noun',
    cefrLevel: index % 2 === 0 ? 'B1' : 'B2',
    englishDefinition: `A practical definition for ${word}.`,
    vietnameseMeaning: `Nghĩa tiếng Việt của ${word}.`,
    simpleExplanation: `A simple learner-friendly explanation for ${word}.`,
    pronunciation: word,
    ipa: '/demo/',
    synonyms: ['sample', 'related'],
    antonyms: [],
    examples: [`I want to use ${word} correctly in a sentence.`],
    collocations: [`${word} skill`, `${word} example`],
    usageNotes: 'Seeded demo vocabulary.',
    commonMistakes: [],
    wordFamily: [],
    tags: ['seed', index % 2 === 0 ? 'work' : 'daily'],
    personalNote: index % 4 === 0 ? 'Review this word carefully.' : null,
    difficulty,
    favorite: index % 6 === 0,
    reviewCount: index % 4,
    lastReviewedAt: index % 3 === 0 ? null : new Date(Date.now() - index * 86_400_000),
  }
}

const main = async () => {
  const passwordHash = await bcrypt.hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@vocabnest.local' },
    update: { name: 'Demo User', passwordHash },
    create: {
      email: 'demo@vocabnest.local',
      name: 'Demo User',
      passwordHash,
    },
  })

  await prisma.searchHistory.deleteMany({ where: { userId: user.id } })
  await prisma.dailyPractice.deleteMany({ where: { userId: user.id } })
  await prisma.vocabularyGroup.deleteMany({ where: { userId: user.id } })
  await prisma.vocabulary.deleteMany({ where: { userId: user.id } })

  const groups = await Promise.all(
    [
      { name: 'Business', color: '#2563eb' },
      { name: 'Daily Conversation', color: '#16a34a' },
      { name: 'Academic', color: '#7c3aed' },
      { name: 'Hard Words', color: '#dc2626' },
      { name: 'Favorites', color: '#f59e0b' },
    ].map((group) =>
      prisma.vocabularyGroup.create({
        data: {
          userId: user.id,
          ...group,
          description: `${group.name} vocabulary group.`,
        },
      }),
    ),
  )

  const vocabulary = await Promise.all(
    vocabularySeed.map((word, index) =>
      prisma.vocabulary.create({
        data: {
          userId: user.id,
          ...makeVocabulary(word, index),
        },
      }),
    ),
  )

  await prisma.vocabularyGroupRelation.createMany({
    data: vocabulary.flatMap((item, index) => {
      const relations = [{ vocabularyId: item.id, groupId: groups[index % groups.length].id }]
      if (item.difficulty === 'hard') {
        relations.push({ vocabularyId: item.id, groupId: groups[3].id })
      }
      if (item.favorite) {
        relations.push({ vocabularyId: item.id, groupId: groups[4].id })
      }
      return relations
    }),
    skipDuplicates: true,
  })

  const practice = await prisma.dailyPractice.create({
    data: {
      userId: user.id,
      date: toDateOnly(),
      completed: false,
      items: {
        create: vocabulary.slice(0, 10).map((item, index) => ({
          vocabularyId: item.id,
          position: index + 1,
          rating: index < 4 ? (index % 2 === 0 ? 'good' : 'hard') : undefined,
          reviewedAt: index < 4 ? new Date() : undefined,
        })),
      },
    },
  })

  await Promise.all(
    ['negotiate', 'clarify', 'efficient'].map((query, index) =>
      prisma.searchHistory.create({
        data: {
          userId: user.id,
          query,
          normalizedQuery: query,
          resultJson: makeVocabulary(query, index),
          savedVocabularyId: vocabulary[index].id,
          demoMode: true,
        },
      }),
    ),
  )

  console.log({
    user: user.email,
    password: 'password123',
    vocabulary: vocabulary.length,
    groups: groups.length,
    practice: practice.id,
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
