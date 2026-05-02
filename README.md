# VocabNest

VocabNest is a pnpm monorepo for a personal English vocabulary learning app.

- `apps/api`: Express 5 + TypeScript API
- `apps/web`: Next.js frontend shell with a centralized API client
- `packages/contracts`: shared Zod schemas, TypeScript types, and OpenAPI document builder

## Requirements

- Node.js 20+
- pnpm
- PostgreSQL

## Setup

```bash
pnpm install
cp .env.example apps/api/.env
```

Update `apps/api/.env` with your local `DATABASE_URL` and a long `JWT_SECRET`.
`OPENAI_API_KEY` is optional. If it is missing, `/vocabulary/search` returns deterministic mock data with `demoMode: true`.

For local PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

## Development

```bash
pnpm --filter @vocabnest/api prisma:migrate
pnpm --filter @vocabnest/api prisma:seed
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
RUN_API_TESTS=true pnpm --filter @vocabnest/api test
```

On Windows `cmd.exe`:

```cmd
set RUN_API_TESTS=true && pnpm --filter @vocabnest/api test
```

## Contract Workflow

1. Update schemas in `packages/contracts`.
2. Update backend route implementation in `apps/api`.
3. Regenerate frontend API types with `pnpm generate:api`.
4. Update frontend UI and client usage in `apps/web`.
5. Run `pnpm typecheck` and `pnpm test`.

The backend imports request and response schemas from `@vocabnest/contracts`, validates requests with Zod, and exposes OpenAPI at `/openapi.json`. The frontend imports safe public types from `@vocabnest/contracts` and can generate OpenAPI operation types into `apps/web/src/generated/api-types.ts`.

## Demo User

After seeding:

- Email: `demo@vocabnest.local`
- Password: `password123`

## API Documentation

See `docs/API.md` for request and response examples.
