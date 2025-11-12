# JustADrop

A volunteer opportunities platform connecting volunteers with organizations.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Package Manager:** Bun

## Getting Started

### Prerequisites

- Bun installed
- Supabase account

### Installation

```bash
# Install dependencies
bun install

# Setup environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Generate Prisma Client
bun run db:generate

# Sync database schema
bun run db:push

# Start development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/          # Next.js routes and pages
├── admin/    # Admin dashboard
├── auth/     # Authentication
├── volunteer/
└── organization/

lib/          # Core utilities
├── prisma.ts     # Database client
├── auth.ts       # Auth helpers
└── supabase/     # Supabase config

prisma/       # Database schema
components/   # React components
types/        # TypeScript types
```

## Available Scripts

```bash
bun run dev          # Start dev server
bun run build        # Build for production
bun run start        # Start production server
bun run db:studio    # Open database GUI
bun run db:push      # Sync schema changes
```

## Features

- Role-based access (Volunteer, Organization, Admin)
- Opportunity management
- Application tracking
- User profiles
- Admin dashboard

## License

MIT License - see [LICENSE](LICENSE) file for details.

