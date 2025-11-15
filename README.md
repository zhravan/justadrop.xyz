# Just A Drop

A modern volunteer opportunity matching platform connecting volunteers with organizations.

## Tech Stack

**Backend:** Node.js + Express + TypeScript + MongoDB + Prisma + JWT + Zod  
**Frontend:** Vue 3 + Vite + Tailwind CSS + Pinia + Vue Router

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or connection string)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cd apps/api
cp .env.example .env
# Edit .env and set DATABASE_URL=mongodb://localhost:27017/justadrop

# 3. Setup database
npm run prisma:generate
npm run prisma:push

# 4. Start development servers
cd ../..
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health: http://localhost:3000/health

## Project Structure

```
justadrop.xyz/
├── apps/
│   ├── api/              # Express REST API
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules (auth, users, etc.)
│   │   │   ├── shared/   # Config, middleware, utils
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   └── prisma/       # Database schema
│   │
│   └── web/              # Vue 3 Frontend
│       ├── src/
│       │   ├── views/    # Pages
│       │   ├── stores/   # Pinia stores
│       │   ├── services/ # API services
│       │   └── router/   # Vue Router
│       └── vite.config.ts
│
└── package.json          # Workspace config
```

## Available Scripts

```bash
npm run dev        # Run both apps
npm run dev:api    # Run API only
npm run dev:web    # Run web only
npm run build      # Build both apps
npm run lint       # Lint all
npm run format     # Format all
```

## API Endpoints

```
POST /api/auth/register  # Register user
POST /api/auth/login     # Login user
GET  /api/auth/profile   # Get profile (protected)
GET  /health             # Health check
```

## MVP Features

**Completed:**
- User authentication (Volunteer, Organization, Admin roles)
- JWT token management
- Protected routes
- Database schema (User, Organization, Opportunity, Application, Bookmark)

**To Build:**
- Organization profile management
- Opportunity posting and browsing
- Volunteer application system
- Bookmarks and admin features

## Development

- Uses npm workspaces for monorepo management
- Hot reload enabled for both apps
- TypeScript strict mode
- ESLint + Prettier configured

## License

MIT

