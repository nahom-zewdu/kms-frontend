# Frontend Security Boundaries

**Reviewed:** 2026-11-14  
**KRT work branch:** `feat/krt-00-tenant-isolation`  
**Related backend milestone:** `docs/development/milestones/2026-11-14-knowledge-reliability.md` in `nahom-zewdu/KMS`

## Rules

- Browser-facing and request-scoped database access uses the cookie-backed SSR client, which carries the authenticated user's Supabase session.
- Every tenant operation must verify membership from the authenticated user context. A caller-supplied company ID is a selector, never proof of membership.
- The service-role client is server-only and bypasses RLS. Use it only after explicit authentication, membership, and role checks in the route handler.
- Integration access tokens, refresh tokens, webhook secrets, and other credentials must never be selectable by the browser's `anon` or `authenticated` roles.
- Unauthenticated endpoints must not read tenant-owned codebase, event, graph, or playbook data.

## Changes in KRT-00

- `GET /api/codebase` now requires an authenticated user, resolves the active company from that user's memberships, fetches only that company's repository IDs, and limits file inventory to those repositories. It no longer uses the public anon client.
- `/api/integrations` uses the admin client only after checking company membership; DELETE additionally requires the admin role. Its response selects non-secret integration metadata only.
- The database migration must revoke direct `anon`/`authenticated` access to integration credential columns and keep worker-only tables behind the service-role boundary.

## Remaining audit item

The legacy `/onboard/[role]` page currently queries the public `playbooks` table by role without a company or share-token constraint. The live database has a permissive public playbooks policy. Do not preserve that behavior as a tenant-safe public sharing mechanism: it can return another company's latest playbook. KRT-00 must either make this page authenticated and company-scoped or replace it with an explicitly designed, unguessable, revocable share-token flow before public playbook sharing is re-enabled.


## Additional KRT-00 changes

- Legacy `/onboard/[slug]` no longer queries the public anon client. It requires a verified session and filters playbooks by the active company and role.
- Public, role-only playbook sharing is intentionally disabled. A future public sharing feature must use an unguessable, revocable token with explicit expiry and a narrowly scoped read path; role slugs are not authorization credentials.
- The current live audit found permissive public policies on `companies`, `entities`, and `playbooks`, plus self-service membership insert/update policies. The backend KRT migration must replace these policies and remove direct public grants.
- Current data-integrity snapshot: 2 companies, 2 admin memberships, 422 entities, 611 edges, 153 raw records, 149 events, 237 codebase files, 96 modules. No null company IDs or cross-company edge endpoints were found in those tenant-bearing records. `contributions` is empty and lacks the `company_id` column expected by the current backend; this schema mismatch must be corrected before contribution metrics are relied upon.


## OAuth and active-company follow-up hardening

- Slack OAuth state is now HMAC-signed, time-limited, and bound to the initiating user/company. The callback verifies the current session and requires the initiating user to remain a company admin before writing the integration with the service-role client.
- The active-company switch endpoint now requires authentication and verifies that the requested company is one of the user's memberships before setting the cookie.
