# kms-frontend

A Next.js 16 application with Supabase email/password authentication, server-side session handling, and a protected dashboard.

## Overview

This repository contains the frontend for a knowledge management system.
It implements:

- Email/password signup and login using Supabase.
- Server-side session handling with `@supabase/ssr` and Next.js App Router.
- Protected dashboard routes under `/dashboard`.
- User profile creation during signup for RLS-protected data.
- Middleware redirect rules for auth and protected pages.

## Project structure

- `app/`
  - `login/page.tsx` — login UI
  - `signup/page.tsx` — signup UI
  - `dashboard/` — authenticated application area
  - `api/auth/` — auth route handlers for signup, login, logout, and session management
- `lib/`
  - `supabase-server.ts` — server-side Supabase client with cookie sync
  - `supabase-admin.ts` — admin Supabase client using service-role key
  - `auth.ts` — authenticated user/profile helper
- `middleware.ts` — route protection and auth redirects
- `docs/` — project and auth documentation

## Getting started

Create `.env.local` with the required Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Documentation

See the `docs/` directory for structured documentation:

- `docs/getting-started.md`
- `docs/architecture.md`
- `docs/authentication.md`

## Authentication status

- Signup uses Supabase admin user creation and profile creation.
- Login establishes a server-side session cookie and redirects to `/dashboard`.
- Logout clears the Supabase session.
- `SUPABASE_SERVICE_ROLE_KEY` is required for signup/profile writes when RLS is enabled.

## Additional notes

- The app uses Next.js App Router with React 19.
- Supabase admin operations are separated from public SSR requests.
- Middleware secures dashboard pages and prevents logged-in users from seeing auth forms.
