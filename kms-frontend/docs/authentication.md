# Authentication Documentation

## Overview

Authentication uses Supabase email/password auth with server-side session management.
The app stores a Supabase session cookie on the server and protects private routes with middleware.

## Signup flow

1. User visits `/signup`.
2. Client sends POST to `/api/auth/signup` with `{ name, email, password }`.
3. `app/api/auth/signup/route.ts`:
   - uses `createAdminSupabase()` to call `supabase.auth.admin.createUser(...)`
   - confirms the email automatically with `email_confirm: true`
   - writes a `profiles` row for the new user
   - signs in the new user using `supabase.auth.signInWithPassword(...)`
   - sets the server session with `supabase.auth.setSession(...)`
   - returns `{ ok: true, redirect: '/dashboard' }`

## Login flow

1. User visits `/login`.
2. Client sends POST to `/api/auth/login` with `{ email, password }`.
3. `app/api/auth/login/route.ts`:
   - signs in via `supabase.auth.signInWithPassword(...)`
   - verifies `data.session` exists
   - calls `supabase.auth.setSession(...)`
   - returns `{ ok: true, redirect: '/dashboard' }`

## Logout flow

- `app/api/auth/logout/route.ts` calls `supabase.auth.signOut()`.
- The session cookie is cleared and the user is redirected to `/login`.

## Server session management

- `lib/supabase-server.ts` creates a server-side Supabase client with cookie helpers from `next/headers`.
- This client is used in all auth routes and protected server components.

## Middleware protection

- `middleware.ts` checks the authenticated user with Supabase.
- It redirects unauthenticated users away from `/dashboard` to `/login`.
- It redirects authenticated users away from `/login` and `/signup` to `/dashboard`.

## Required environment keys

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Current status

- Signup is implemented with server-side admin user creation and profile assignment.
- Login is implemented with server-side session cookie setup.
- Logout is implemented and clears the session.
- `SUPABASE_SERVICE_ROLE_KEY` is required for signup/profile writes with RLS.
