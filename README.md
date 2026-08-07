# KMS Frontend

Next.js app for KMS: auth, multi-company workspaces, onboarding playbooks, and per-company integrations (Slack, GitHub App).

## Features

- Email/password auth (Supabase)
- Multiple companies per user; roles: admin / manager / member
- **Global** dashboard: overview, companies, plan, account settings
- **Company** workspace: overview, playbooks, members, settings (integrations), analytics (nav ready)
- Slack + GitHub App connection per company
- Collapsible context-aware sidebars (global vs company)

## Stack

- Next.js (App Router)
- Supabase Auth + Postgres (SSR cookies)
- Tailwind CSS

## Setup

```bash
npm install
cp .env.example .env.local   # if present
npm run dev
```

### Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Slack OAuth (company connect)
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=

# GitHub App
GITHUB_APP_ID=
GITHUB_APP_SLUG=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY_PATH=   # or GITHUB_APP_PRIVATE_KEY
GITHUB_WEBHOOK_URL=            # public Go /github/ URL (docs only; webhook is on the App)
```

Use the same public origin for GitHub App **Callback / Setup URL** as `NEXT_PUBLIC_APP_URL` (ngrok in local dev).

## Routes

| Path | Scope |
|------|--------|
| `/login`, `/signup` | Public |
| `/dashboard` | Global overview |
| `/dashboard/subscription` | Plan |
| `/dashboard/c/[companyId]` | Company overview |
| `/dashboard/c/[companyId]/playbooks` | Playbooks |
| `/dashboard/c/[companyId]/members` | Members |
| `/dashboard/c/[companyId]/settings` | Integrations & company settings |
| `/onboard/[slug]` | Playbook viewer (legacy/public link patterns as implemented) |

## Integrations UX

1. Open company **Settings**.
2. **Connect Slack** → OAuth → store `team_id` on `company_integrations`.
3. **Connect GitHub** → GitHub App install (all or selected repos) → store `installation_id`.
4. Repo list reflects the App installation; change repos via “Configure on GitHub”.

Backend Go must receive GitHub/Slack webhooks and resolve `company_id` from those external IDs.

## Layout rules

- `/dashboard/*` (non-company): **GlobalSidebar** only  
- `/dashboard/c/[companyId]/*`: **CompanySidebar** only  
- Company chrome lives in `app/dashboard/c/[companyId]/layout.tsx`, not in `page.tsx`

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Related services

- Go API — webhooks and query enqueue  
- Python NLP — worker + playbook/visualizer/baseline HTTP API  

Point frontend API calls at those services as configured in your deployment.

## License

MIT
