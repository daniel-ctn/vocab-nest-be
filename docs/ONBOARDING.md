# VocabNest Backend Onboarding

Welcome to VocabNest. This document gives new backend contributors the context needed to understand, run, and safely change the project.

## What This Project Is

VocabNest is the backend API for a personal English vocabulary learning app. The API owns authentication, PostgreSQL data access, AI vocabulary generation, dictionary management, vocabulary groups, daily practice selection, review tracking, and consistent REST responses.

The frontend is a separate project. This repository exposes the API contract through shared Zod schemas and OpenAPI at `/openapi.json`.

## Tech Stack

- Node.js + Express 5
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod for request, response, and AI output validation
- JWT access tokens for authentication
- bcrypt for password hashing
- OpenAI SDK with deterministic mock fallback
- Vitest and Supertest for tests
- ESLint and Prettier

## Project Layout

```text
src/
  app.ts                  Express app composition and route mounting
  server.ts               HTTP server entrypoint
  config/                 Environment parsing
  contracts/              Shared Zod schemas, API types, OpenAPI builder
  db/                     Prisma client setup
  middleware/             Auth, error handling, request logging
  modules/                Feature modules
    auth/
    vocabulary/
    groups/
    practice/
    search-history/
    users/
    dashboard/
  openapi/                OpenAPI document export
  shared/                 Cross-module helpers
prisma/
  schema.prisma           Database schema
  seed.ts                 Demo seed data
tests/                    Unit tests and opt-in API integration tests
docs/                     Project and API documentation
```

The code is organized by feature module. Each module usually has routes, controllers, services, and schemas. Controllers handle HTTP concerns, services hold business logic, and contracts define validated request and response shapes.

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create environment config:

```bash
cp .env.example .env
```

Update `.env` with:

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `OPENAI_API_KEY` if you want real AI responses

If `OPENAI_API_KEY` is empty, vocabulary search still works in deterministic demo mode and returns `demoMode: true`.

Start local PostgreSQL with Docker if available:

```bash
docker compose up -d postgres
```

Run database setup:

```bash
pnpm prisma:migrate
pnpm prisma:seed
```

Start the API:

```bash
pnpm dev
```

Useful URLs:

- Health check: `http://localhost:4000/health`
- Swagger UI: `http://localhost:4000/docs`
- OpenAPI JSON: `http://localhost:4000/openapi.json`

## Common Commands

```bash
pnpm generate:api   # Generate openapi.json
pnpm typecheck      # Prisma generate + TypeScript check
pnpm lint           # ESLint
pnpm test           # Unit tests
pnpm build          # Build production output
```

API integration tests require a real database and are skipped by default:

```bash
RUN_API_TESTS=true pnpm test
```

On Windows `cmd.exe`:

```cmd
set RUN_API_TESTS=true && pnpm test
```

## Development Workflow

1. Update or add schemas in `src/contracts` first when the API shape changes.
2. Implement route/controller/service changes inside the relevant `src/modules/*` feature.
3. Regenerate OpenAPI with `pnpm generate:api`.
4. Add or update focused tests.
5. Run `pnpm typecheck`, `pnpm lint`, and `pnpm test`.

For database changes:

1. Update `prisma/schema.prisma`.
2. Create a migration with `pnpm prisma:migrate`.
3. Review the generated SQL before committing.
4. Update `prisma/seed.ts` if seed data should change.

## API Conventions

Successful responses use:

```json
{
  "data": {}
}
```

Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

All protected routes require:

```text
Authorization: Bearer <accessToken>
```

## Important Behaviors

- `/auth/register` and `/auth/login` are public.
- Most app routes are protected by JWT auth.
- Vocabulary search does not automatically save words to the dictionary.
- AI output is never trusted directly; it is validated with Zod.
- Daily practice creates one stable set per user per day.
- Practice review updates item rating, review count, last review timestamp, and simple difficulty.

## Demo Account

After seeding:

- Email: `demo@vocabnest.local`
- Password: `password123`

## Where To Look First

- API examples: `docs/API.md`
- Route mounting: `src/app.ts`
- Contract schemas: `src/contracts/index.ts`
- Prisma models: `prisma/schema.prisma`
- Daily practice logic: `src/modules/practice/practice-selection.ts`
- Mock AI fallback: `src/modules/vocabulary/vocabulary-ai.service.ts`
