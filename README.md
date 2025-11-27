# Just a Drop

A platform connecting volunteers with organizations that need help.

## Stack

- Runtime: Bun (all-in-one JavaScript runtime)
- Frontend: Next.js 14 (App Router) + React 18
- UI: shadcn/ui + Tailwind CSS
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

- Bun >= 1.0 (install from <https://bun.sh>)
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

## Authentication

The platform has three user types:

- Volunteers: Auto-approved on registration
- Organizations: Require admin approval before posting opportunities
- Admins: Can approve/reject/blacklist organizations

Create the first admin user:

```bash
make db-seed-admin
# Default: admin@justadrop.xyz / admin123456
```

Override default admin credentials:

```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword ADMIN_NAME="Your Name" make db-seed-admin
```

OpenAPI docs available at <http://localhost:3001/swagger>

## Email Notifications

The platform uses Nodemailer for sending email notifications.

Add to your `.env` file:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
```

Note: Email sending will be skipped in development if SMTP credentials are not configured.

**Customization:**

Design tokens are configured in:

- [apps/web/src/app/globals.css](apps/web/src/app/globals.css) - CSS variables for colors and theme
- [apps/web/tailwind.config.ts](apps/web/tailwind.config.ts) - Tailwind configuration

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

<details>

<summary>
  <strong> Production Deployment </strong>
</summary>

This is a Docker Compose setup with Caddy for production deployment. This is evolving architecture, so there could be changes as we improve and optimize the deployment process.

### Steps to follow

1. Copy production environment file:

   ```bash
   cp .env.production.example .env.production
   ```

2. Edit `.env.production` and set your production values (database password, JWT secret, SMTP credentials)

3. Deploy:

   ```bash
   make prod-deploy
   # or: ./deploy.sh deploy
   ```

### Management CMDs

```bash
make prod-deploy      # Deploy application
make prod-redeploy    # Rebuild and redeploy
make prod-stop        # Stop all services
make prod-restart     # Restart services
make prod-logs        # View logs
make prod-status      # Check service status
make prod-backup      # Backup database
make prod-seed-admin  # Create admin user
```

### Services (Production Deployment Work In Progress)

- **Frontend**: [https://justadrop.xyz](https://justadrop.xyz)
- **API**: [https://api.justadrop.xyz](https://api.justadrop.xyz)
- **API Docs**: [https://api.justadrop.xyz/swagger](https://api.justadrop.xyz/swagger)

pillars of curent setup:

- PSQL DB with persistent storage
- Automatic HTTPS via Caddy
- Health checks for all services
- Docker Compose orchestration

</details>
