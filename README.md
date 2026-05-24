# kms-frontend

```text
kms-frontend/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   ├── (dashboard)/         # Main protected area
│   │   ├── onboard/         # KMS Onboard section
│   │   │   ├── [slug]/      # Dynamic playbook page (/onboard/backend-engineer)
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx         # Main dashboard
│   ├── api/                 # API routes (if needed)
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn components
│   ├── layout/              # Navbar, Sidebar
│   ├── playbook/            # Playbook-specific components
│   └── common/
├── lib/
│   └── supabase.ts          # Supabase client
├── hooks/
├── types/
├── public/
└── next.config.js
```
