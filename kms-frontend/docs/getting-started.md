# Getting Started

## Prerequisites
- Node.js 20+ recommended.
- A Supabase project with email/password authentication enabled.
- Environment variables configured in `.env.local` (see `.env.example` for the full list).

## Environment variables

Copy the example file and fill in the values for the services you use:

```bash
cp .env.example .env.local
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
