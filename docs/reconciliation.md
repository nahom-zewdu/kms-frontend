# KMS Frontend Reality Reconciliation

> Snapshot: `feat/ramp`, 2026-08-30

## Repository boundary

`kms-frontend` is a separate Next.js App Router repository. It owns the browser-facing application and does not contain the Go API or Python NLP worker.

## Current product surface

The current frontend README and recent `feat/ramp` work establish these surfaces:

- Supabase email/password authentication.
- Multiple companies per user.
- Company roles: `admin`, `manager`, `member`.
- Global dashboard: overview, companies, plan, account settings.
- Company workspace: overview, playbooks, members, settings/integrations, analytics navigation.
- Slack company connection through OAuth.
- GitHub App installation scoped to a company.
- Ramp/"First 7 Days" navigation and API routes for generating/fetching ramp plans.

## Architectural boundary

```text
Browser
  |
  v
Next.js (`kms-frontend`)
  |
  +--> Supabase Auth / browser data access
  |
  +--> authenticated frontend API routes
  |
  +--> Go API / Python NLP services
```

Company identity is a first-class routing concern under `/dashboard/c/[companyId]/*`.

## Important invariant

A company-scoped page must not infer authorization merely from a URL parameter. The authenticated user must be a member of the company, and server-side access must enforce that membership.

## Current documentation limitation

The frontend README documents the broad surface but is not a complete API contract or product specification. It should not be treated as proof that every listed feature is production-ready.

## Development direction

The frontend is now moving from infrastructure/setup toward validating customer-facing workflows. New work should prioritize complete user journeys over adding navigation shells or speculative dashboard features.
