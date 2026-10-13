# Art Portal — Lakshan's Art Gallery

Production gallery for displaying and managing Lakshan's artwork.

**Live site:** https://lakshanvs.com

## Features

- **Public gallery** — expressive landing page, responsive grid, pagination
- **Artwork pages** — captions, tags, medium/year, click-to-zoom viewer
- **Smart search** — Postgres full-text search across title, caption, medium, and tags
- **Tag filters** — browse by curated tags
- **Viewer tracking** — anonymous page views + per-artwork counters
- **Admin studio** — upload images, edit captions, manage tags, publish/unpublish, analytics
- **Deploy path** — GitHub (`satscanada`) + Actions CI + Vercel + Namecheap (`lakshanvs.com`)

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

- Local gallery: http://localhost:3000  
- Local admin: http://localhost:3000/admin/login  
- Production: https://lakshanvs.com  
- Production admin: https://lakshanvs.com/admin/login  

Set branding in `.env.local`:

```env
NEXT_PUBLIC_SITE_NAME=Lakshan's Art Gallery
NEXT_PUBLIC_ARTIST_NAME=Lakshan
NEXT_PUBLIC_SITE_TAGLINE=A living gallery of young art
```

## Deploy

Follow **[DEPLOY.md](./DEPLOY.md)** for Supabase, GitHub, Vercel, and Namecheap DNS for **lakshanvs.com**.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm start` | Serve production build |
