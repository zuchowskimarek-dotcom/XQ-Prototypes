# XQ-Prototypes — Policy Dashboard

A full-stack prototype for managing **WES Decision Domains, Scopes, Policy Rules, Strategies, and Parameters** — the runtime policy engine for LogisQ-WES systems.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 · Vite 7 · MUI 6 · Zustand · React Hook Form |
| **Backend** | Express 5 · Prisma 7 · Zod 4 |
| **Database** | PostgreSQL 14+ |
| **Language** | TypeScript 5.9 |

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ running on `localhost:5432`

### Setup

```bash
# 1. Clone
git clone https://github.com/zuchowskimarek-dotcom/XQ-Prototypes.git
cd XQ-Prototypes

# 2. Backend
cd backend
cp .env.example .env   # adjust DATABASE_URL if needed
npm install
npm run db:push         # create tables
npm run db:seed         # seed demo data

# 3. Frontend
cd ../frontend
npm install

# 4. Run (two terminals)
cd backend  && npm run dev   # → http://localhost:3005
cd frontend && npm run dev   # → http://localhost:5175
```

### Environment Variables

Create `backend/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/xq_prototypes?schema=public"
PORT=3005
```

## Project Structure

```
XQ-Prototypes/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Data model (Domain → Scope → Rule → Policy/Strategy/Param)
│   │   └── seed.ts          # Demo data seeder
│   └── src/
│       ├── index.ts         # Express server entry
│       └── routes/          # API routes (domains, scopes, rules, manifest)
├── frontend/
│   └── src/
│       ├── components/      # React components (RuleEditorDrawer, ManifestExport, etc.)
│       ├── contracts/       # TypeScript types (§8-aligned)
│       └── pages/           # Route pages (DomainList, ScopeDetail)
```

## License

Private — © Marek Zuchowski
