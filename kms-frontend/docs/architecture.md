# Architecture

## Project structure

- `app/`
  - `login/page.tsx` — client login page
  - `signup/page.tsx` — client signup page
  - `dashboard/` — protected application area
  - `api/` — server API routes for auth and application behavior
- `lib/`
  - `supabase-server.ts` — Supabase SSR client with cookie sync
  - `supabase-admin.ts` — Supabase admin client using service role key
  - `auth.ts` — helper to load authenticated user + profile context
- `middleware.ts` — protects `/dashboard` and redirects authenticated users away from `/login` and `/signup`

## Authentication flow

1. User submits signup form on `/signup`.
2. Server route `app/api/auth/signup/route.ts` creates a Supabase user via the service-role admin client.
3. The signup route also creates the corresponding `profiles` row and immediately signs the user in.
4. The authenticated session is stored in cookies using the SSR Supabase client.
5. User can sign in later via `/login`, which calls `app/api/auth/login/route.ts`.
6. Logging out calls `app/api/auth/logout/route.ts` and clears the Supabase session.

## Supabase clients

- `createServerSupabase()` uses `@supabase/ssr` and `next/headers` cookies to manage the session on the server.
- `createAdminSupabase()` uses `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` for admin operations.

## Notes

- `SUPABASE_SERVICE_ROLE_KEY` must be present in `.env.local` for signup/profile creation to work.
- The `profiles` table is expected to be protected by RLS, so the admin client is used for writes during signup.
# Architecture Overview

## App Structure
- `app/` - Next.js App Router pages and route handlers.
  - `app/signup/page.tsx` - client signup form.
  - `app/login/page.tsx` - client login form.
  - `app/dashboard/` - authenticated dashboard UI.
  - `app/api/auth/` - authentication API routes.
  - `app/api/codebase/`, `app/api/playbooks/`, `app/api/query/` - business APIs.

## Authentication Flow
- Signup: `/signup` posts to `/api/auth/signup`.
- Login: `/login` posts to `/api/auth/login`.
- Logout: `/api/auth/logout` invalidates the session.
- Server session cookie is managed with `@supabase/ssr` and `cookies()`.
- `middleware.ts` protects `/dashboard` and redirects authenticated users away from `/login` and `/signup`.

## Supabase Clients
- `lib/supabase-server.ts` - creates a server-side Supabase client with cookie sync.
- `lib/supabase-admin.ts` - creates a service-role Supabase client for admin operations.

## Profiles and RLS
- `profiles` table is written during signup with the admin client.
- `SUPABASE_SERVICE_ROLE_KEY` is required for server-side profile creation when RLS is enabled.
- Authenticated session retrieval uses server-side Supabase and `supabase.auth.getUser()`.
