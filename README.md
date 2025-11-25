# Just a Drop

A platform connecting volunteers with organizations that need help.

## Stack

- Runtime: Bun (all-in-one JavaScript runtime)
- Frontend: Next.js 14 (App Router)
- Backend: Elysia
- Database: PostgreSQL + Drizzle ORM
- Monorepo: Bun workspaces

## Structure

```
apps/
  web/         Next.js frontend
  api/         Elysia backend
packages/
  db/          Drizzle schema and migrations
  types/       Shared TypeScript types
```

## Prerequisites

- Bun >= 1.0 (install from https://bun.sh)
- Docker (for PostgreSQL)

## Setup

Install dependencies:
```bash
make install
# or: bun install
```

Setup PostgreSQL (Docker):
```bash
make db-setup
```

Copy environment files:
```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
```

Generate and run migrations:
```bash
make db-generate
make db-migrate
```

Build packages (required before first run):
```bash
bun run build:packages
```

## Development

Start both frontend and backend:
```bash
make dev
```

Or individually:
```bash
bun run dev:web    # Frontend on :3000
bun run dev:api    # Backend on :3001
```

Database studio:
```bash
make db-studio
```

## Build

```bash
make build
```

## Database

Stop PostgreSQL:
```bash
make db-stop
```

Remove PostgreSQL container:
```bash
make db-remove
```