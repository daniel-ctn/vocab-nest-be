# VocabNest

VocabNest is the Express backend for a personal English vocabulary learning app.

- `src`: Express 5 + TypeScript API
- `src/contracts`: shared Zod schemas, TypeScript types, and OpenAPI document builder
- `prisma`: Prisma schema and seed script

## Requirements

- Node.js 20+
- pnpm
- PostgreSQL

## Setup

```bash
pnpm install
cp .env.example .env
```

Update `.env` with your local `DATABASE_URL` and a long `JWT_SECRET`.
`OPENAI_API_KEY` is optional. If it is missing, `/vocabulary/search` returns deterministic mock data with `demoMode: true`.

For local PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

## Development

```bash
pnpm prisma:migrate
pnpm prisma:seed
pnpm generate:api
pnpm dev
```

API server: `http://localhost:4000`

Swagger UI: `http://localhost:4000/docs`

OpenAPI JSON: `http://localhost:4000/openapi.json`

## Useful Scripts

```bash
pnpm generate:api
pnpm typecheck
pnpm lint
pnpm test
```

API integration tests are opt-in because they need PostgreSQL:

```bash
RUN_API_TESTS=true pnpm test
```

On Windows `cmd.exe`:

```cmd
set RUN_API_TESTS=true && pnpm test
```

## Contract Workflow

1. Update schemas in `src/contracts`.
2. Update backend route implementation in `src`.
3. Regenerate the OpenAPI document with `pnpm generate:api`.
4. Run `pnpm typecheck` and `pnpm test`.

The backend imports request and response schemas from `src/contracts`, validates requests with Zod, and exposes OpenAPI at `/openapi.json`.

## Demo User

After seeding:

- Email: `demo@vocabnest.local`
- Password: `password123`

## API Documentation

See `docs/API.md` for request and response examples.
