# Art Portal

A production-ready gallery for displaying and managing Lakshan's artwork.

## Features

- **Public gallery** — expressive landing page, responsive grid, pagination
- **Artwork pages** — captions, tags, medium/year, click-to-zoom viewer
- **Smart search** — Postgres full-text search across title, caption, medium, and tags
- **Tag filters** — browse by curated tags
- **Viewer tracking** — anonymous page views + per-artwork counters
- **Admin studio** — upload images, edit captions, manage tags, publish/unpublish, analytics
- **Deploy path** — GitHub (`satscanada`) + Actions CI + Vercel + Namecheap domain

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage, RLS)
- Vercel hosting

## Quick start

```bash
cp .env.example .env.local
# Add Supabase URL + anon/publishable key
# Run supabase/migrations/001_initial.sql in the Supabase SQL editor
npm install
npm run dev
```

- Gallery: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  

Set branding in `.env.local`:

```env
NEXT_PUBLIC_SITE_NAME=Atelier
NEXT_PUBLIC_ARTIST_NAME=Your Son's Name
NEXT_PUBLIC_SITE_TAGLINE=A living gallery of young art
```

## Deploy

Follow **[DEPLOY.md](./DEPLOY.md)** for:

1. Supabase setup  
2. GitHub repo under **satscanada**  
3. Vercel project + env vars  
4. Namecheap DNS records  

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm start` | Serve production build |
