# Getting Started

## Prerequisites
- Node.js 20+ recommended.
- A Supabase project with email/password authentication enabled.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` configured in `.env.local`.

## Environment variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## Install dependencies

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build for production

```bash
npm run build
npm run start
```
