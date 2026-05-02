import { z } from 'zod'

const isoDateTime = z.string().datetime()

export const difficultySchema = z.enum(['easy', 'medium', 'hard'])
export const reviewRatingSchema = z.enum(['again', 'hard', 'good', 'easy'])

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

export const metaSchema = z.record(z.string(), z.unknown()).optional()

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
})

export const registerRequestSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(128),
})

export const loginRequestSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
})

export const authResponseSchema = z.object({
  user: userProfileSchema,
  accessToken: z.string(),
})

export const vocabularyAiResultSchema = z.object({
  word: z.string().trim().min(1),
  normalizedWord: z.string().trim().min(1),
  isPhrase: z.boolean(),
  partOfSpeech: z.string().trim().min(1),
  cefrLevel: z.string().trim().min(1),
  englishDefinition: z.string().trim().min(1),
  vietnameseMeaning: z.string().trim().min(1),
  simpleExplanation: z.string().trim().min(1),
  pronunciation: z.string().trim().min(1),
  ipa: z.string().trim().min(1),
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  collocations: z.array(z.string()).default([]),
  usageNotes: z.string().default(''),
  commonMistakes: z.array(z.string()).default([]),
  wordFamily: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
})

export const vocabularySearchRequestSchema = z.object({
  query: z.string().trim().min(1).max(120),
})

export const vocabularySearchResponseSchema = z.object({
  result: vocabularyAiResultSchema,
  demoMode: z.boolean(),
  searchHistoryId: z.string(),
})

export const vocabularyCreateRequestSchema = vocabularyAiResultSchema.extend({
  personalNote: z.string().max(2000).optional(),
  difficulty: difficultySchema.default('medium'),
  favorite: z.boolean().default(false),
  groupIds: z.array(z.string()).optional(),
})

export const vocabularyUpdateRequestSchema = vocabularyAiResultSchema
  .partial()
  .extend({
    personalNote: z.string().max(2000).nullable().optional(),
    difficulty: difficultySchema.optional(),
    favorite: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.')

export const vocabularyListQuerySchema = z.object({
  q: z.string().trim().optional(),
  groupId: z.string().optional(),
  difficulty: difficultySchema.optional(),
  cefrLevel: z.string().optional(),
  partOfSpeech: z.string().optional(),
  favorite: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'oldest', 'alphabetical', 'lastReviewed']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export const vocabularyDtoSchema = vocabularyAiResultSchema.extend({
  id: z.string(),
  userId: z.string(),
  personalNote: z.string().nullable(),
  difficulty: difficultySchema,
  favorite: z.boolean(),
  reviewCount: z.number().int().nonnegative(),
  lastReviewedAt: isoDateTime.nullable(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  groups: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().nullable(),
      }),
    )
    .default([]),
})

export const assignVocabularyGroupsRequestSchema = z.object({
  groupIds: z.array(z.string()).max(50),
})

export const favoriteRequestSchema = z.object({
  favorite: z.boolean(),
})

export const difficultyRequestSchema = z.object({
  difficulty: difficultySchema,
})

export const groupCreateRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(1000).optional(),
  color: z.string().trim().max(32).optional(),
})

export const groupUpdateRequestSchema = groupCreateRequestSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.')

export const groupDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  vocabularyCount: z.number().int().nonnegative().optional(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
})

export const practiceItemDtoSchema = z.object({
  id: z.string(),
  dailyPracticeId: z.string(),
  vocabularyId: z.string(),
  position: z.number().int(),
  rating: reviewRatingSchema.nullable(),
  reviewedAt: isoDateTime.nullable(),
  vocabulary: vocabularyDtoSchema.optional(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
})

export const dailyPracticeDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(),
  completed: z.boolean(),
  completedAt: isoDateTime.nullable(),
  items: z.array(practiceItemDtoSchema),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
})

export const reviewPracticeItemRequestSchema = z.object({
  rating: reviewRatingSchema,
})

export const searchHistoryDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  query: z.string(),
  normalizedQuery: z.string(),
  resultJson: vocabularyAiResultSchema,
  savedVocabularyId: z.string().nullable(),
  demoMode: z.boolean(),
  createdAt: isoDateTime,
})

export const dashboardSummarySchema = z.object({
  totalVocabulary: z.number().int().nonnegative(),
  totalGroups: z.number().int().nonnegative(),
  practicedToday: z.boolean(),
  todayPracticeCompleted: z.boolean(),
  difficultWordsCount: z.number().int().nonnegative(),
  favoriteWordsCount: z.number().int().nonnegative(),
  recentlySavedWords: z.array(vocabularyDtoSchema),
  duePracticeWords: z.array(vocabularyDtoSchema),
})

export const idParamsSchema = z.object({
  id: z.string().min(1),
})

export const reviewParamsSchema = z.object({
  id: z.string().min(1),
  itemId: z.string().min(1),
})

export const searchHistoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export type ApiError = z.infer<typeof apiErrorSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type RegisterRequest = z.infer<typeof registerRequestSchema>
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type Difficulty = z.infer<typeof difficultySchema>
export type ReviewRating = z.infer<typeof reviewRatingSchema>
export type VocabularyAiResult = z.infer<typeof vocabularyAiResultSchema>
export type VocabularySearchRequest = z.infer<typeof vocabularySearchRequestSchema>
export type VocabularySearchResponse = z.infer<typeof vocabularySearchResponseSchema>
export type VocabularyCreateRequest = z.infer<typeof vocabularyCreateRequestSchema>
export type VocabularyUpdateRequest = z.infer<typeof vocabularyUpdateRequestSchema>
export type VocabularyListQuery = z.infer<typeof vocabularyListQuerySchema>
export type VocabularyDto = z.infer<typeof vocabularyDtoSchema>
export type GroupCreateRequest = z.infer<typeof groupCreateRequestSchema>
export type GroupUpdateRequest = z.infer<typeof groupUpdateRequestSchema>
export type GroupDto = z.infer<typeof groupDtoSchema>
export type DailyPracticeDto = z.infer<typeof dailyPracticeDtoSchema>
export type ReviewPracticeItemRequest = z.infer<typeof reviewPracticeItemRequestSchema>
export type SearchHistoryDto = z.infer<typeof searchHistoryDtoSchema>
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>

export type ApiSuccess<T, TMeta = Record<string, unknown>> = {
  data: T
  meta?: TMeta
}

const successSchema = (dataSchema: z.ZodTypeAny) =>
  z.object({
    data: dataSchema,
    meta: z.record(z.string(), z.unknown()).optional(),
  })

const asSchema = (schema: z.ZodTypeAny) =>
  z.toJSONSchema(schema, {
    target: 'openapi-3.0',
    unrepresentable: 'any',
  })

const bearerSecurity = [{ bearerAuth: [] }]

const jsonBody = (schema: z.ZodTypeAny) => ({
  required: true,
  content: {
    'application/json': {
      schema: asSchema(schema),
    },
  },
})

const ok = (schema: z.ZodTypeAny, description = 'Success') => ({
  description,
  content: {
    'application/json': {
      schema: asSchema(successSchema(schema)),
    },
  },
})

const pathId = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
}

export const createOpenApiDocument = () => ({
  openapi: '3.0.3',
  info: {
    title: 'VocabNest API',
    version: '0.1.0',
    description: 'REST API for VocabNest vocabulary learning.',
  },
  servers: [{ url: 'http://localhost:4000' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': ok(z.object({ status: z.literal('ok') })) },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a user',
        requestBody: jsonBody(registerRequestSchema),
        responses: { '201': ok(authResponseSchema) },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        requestBody: jsonBody(loginRequestSchema),
        responses: { '200': ok(authResponseSchema) },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Current user',
        security: bearerSecurity,
        responses: { '200': ok(userProfileSchema) },
      },
    },
    '/vocabulary/search': {
      post: {
        summary: 'Generate vocabulary details',
        security: bearerSecurity,
        requestBody: jsonBody(vocabularySearchRequestSchema),
        responses: { '200': ok(vocabularySearchResponseSchema) },
      },
    },
    '/vocabulary': {
      post: {
        summary: 'Save vocabulary',
        security: bearerSecurity,
        requestBody: jsonBody(vocabularyCreateRequestSchema),
        responses: { '201': ok(vocabularyDtoSchema) },
      },
      get: {
        summary: 'List vocabulary',
        security: bearerSecurity,
        responses: { '200': ok(z.array(vocabularyDtoSchema)) },
      },
    },
    '/vocabulary/{id}': {
      get: {
        summary: 'Get vocabulary',
        security: bearerSecurity,
        parameters: [pathId],
        responses: { '200': ok(vocabularyDtoSchema) },
      },
      patch: {
        summary: 'Update vocabulary',
        security: bearerSecurity,
        parameters: [pathId],
        requestBody: jsonBody(vocabularyUpdateRequestSchema),
        responses: { '200': ok(vocabularyDtoSchema) },
      },
      delete: {
        summary: 'Delete vocabulary',
        security: bearerSecurity,
        parameters: [pathId],
        responses: { '200': ok(z.object({ deleted: z.boolean() })) },
      },
    },
    '/vocabulary/{id}/groups': {
      post: {
        summary: 'Replace vocabulary groups',
        security: bearerSecurity,
        parameters: [pathId],
        requestBody: jsonBody(assignVocabularyGroupsRequestSchema),
        responses: { '200': ok(vocabularyDtoSchema) },
      },
    },
    '/vocabulary/{id}/favorite': {
      patch: {
        summary: 'Update favorite flag',
        security: bearerSecurity,
        parameters: [pathId],
        requestBody: jsonBody(favoriteRequestSchema),
        responses: { '200': ok(vocabularyDtoSchema) },
      },
    },
    '/vocabulary/{id}/difficulty': {
      patch: {
        summary: 'Update difficulty',
        security: bearerSecurity,
        parameters: [pathId],
        requestBody: jsonBody(difficultyRequestSchema),
        responses: { '200': ok(vocabularyDtoSchema) },
      },
    },
    '/groups': {
      post: {
        summary: 'Create group',
        security: bearerSecurity,
        requestBody: jsonBody(groupCreateRequestSchema),
        responses: { '201': ok(groupDtoSchema) },
      },
      get: {
        summary: 'List groups',
        security: bearerSecurity,
        responses: { '200': ok(z.array(groupDtoSchema)) },
      },
    },
    '/groups/{id}': {
      get: {
        summary: 'Get group',
        security: bearerSecurity,
        parameters: [pathId],
        responses: { '200': ok(groupDtoSchema) },
      },
      patch: {
        summary: 'Update group',
        security: bearerSecurity,
        parameters: [pathId],
        requestBody: jsonBody(groupUpdateRequestSchema),
        responses: { '200': ok(groupDtoSchema) },
      },
      delete: {
        summary: 'Delete group',
        security: bearerSecurity,
        parameters: [pathId],
        responses: { '200': ok(z.object({ deleted: z.boolean() })) },
      },
    },
    '/groups/{id}/vocabulary': {
      get: {
        summary: 'List vocabulary in group',
        security: bearerSecurity,
        parameters: [pathId],
        responses: { '200': ok(z.array(vocabularyDtoSchema)) },
      },
    },
    '/practice/today': {
      get: {
        summary: "Get or create today's practice",
        security: bearerSecurity,
        responses: { '200': ok(dailyPracticeDtoSchema) },
      },
    },
    '/practice/{id}/items/{itemId}/review': {
      post: {
        summary: 'Review a practice item',
        security: bearerSecurity,
        parameters: [
          pathId,
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: jsonBody(reviewPracticeItemRequestSchema),
        responses: { '200': ok(practiceItemDtoSchema) },
      },
    },
    '/practice/{id}/complete': {
      post: {
        summary: 'Complete practice',
        security: bearerSecurity,
        parameters: [pathId],
        responses: { '200': ok(dailyPracticeDtoSchema) },
      },
    },
    '/search-history': {
      get: {
        summary: 'List search history',
        security: bearerSecurity,
        responses: { '200': ok(z.array(searchHistoryDtoSchema)) },
      },
    },
    '/search-history/{id}': {
      get: {
        summary: 'Get search history item',
        security: bearerSecurity,
        parameters: [pathId],
        responses: { '200': ok(searchHistoryDtoSchema) },
      },
    },
    '/dashboard/summary': {
      get: {
        summary: 'Dashboard summary',
        security: bearerSecurity,
        responses: { '200': ok(dashboardSummarySchema) },
      },
    },
  },
})
