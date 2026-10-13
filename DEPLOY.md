# Deploy Art Portal (GitHub + Vercel + Namecheap)

This guide gets your son's gallery live on your Namecheap domain, with GitHub as source of truth and Vercel as the host.

## Architecture

| Layer | Choice | Why |
| --- | --- | --- |
| App | Next.js (App Router) on Vercel | Image optimization, SSR, previews |
| Data + Auth + Storage | Supabase | Postgres, admin login, image bucket, RLS |
| CI | GitHub Actions | Lint + build on every PR/push |
| CD | Vercel Git integration | Preview URLs per PR, auto-prod on `main` |
| DNS | Namecheap → Vercel | Custom domain |

GitHub account used in this guide: **satscanada**

---

## 1. Supabase (one-time)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste and run `supabase/migrations/001_initial.sql`.
3. **Authentication → Users** → Add user (email + password). This is your admin login.
4. Optional hardening: disable public sign-ups under **Authentication → Providers → Email**.
5. Copy from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable / anon key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

Locally:

```bash
cp .env.example .env.local
# fill keys + artist name
npm run dev
```

Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 2. Push to GitHub (`satscanada`)

```bash
# from ArtPortal root (if not already a repo with remote)
git init
git add .
git commit -m "Initial art portal"
gh repo create satscanada/art-portal --private --source=. --remote=origin --push
```

Or create the empty repo on GitHub, then:

```bash
git remote add origin https://github.com/satscanada/art-portal.git
git branch -M main
git push -u origin main
```

GitHub Actions workflow: `.github/workflows/ci.yml` (lint + build on `main` / PRs).

---

## 3. Vercel project

1. Sign in at [vercel.com](https://vercel.com) with GitHub (**satscanada**).
2. **Add New Project** → import `satscanada/art-portal`.
3. Framework: Next.js (auto-detected).
4. Add Environment Variables (Production + Preview):

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `NEXT_PUBLIC_SITE_NAME` | e.g. `Atelier` |
| `NEXT_PUBLIC_ARTIST_NAME` | your son's name |
| `NEXT_PUBLIC_SITE_TAGLINE` | short line under the brand |
| `NEXT_PUBLIC_PAGE_SIZE` | `12` |

5. Deploy. You get a URL like `art-portal-xxx.vercel.app`.

Every push to `main` → production. Every PR → preview URL.

### Optional: deploy via GitHub Actions + Vercel CLI

Only needed if you want Actions to deploy instead of Vercel Git hooks:

1. Vercel → Project → Settings → Tokens / IDs: create token, copy Org ID + Project ID.
2. GitHub repo → Settings → Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
3. Uncomment / extend the deploy job in `.github/workflows/ci.yml`.

Recommended default: **keep Vercel Git integration** and use Actions only for CI quality gates.

---

## 4. Namecheap domain → Vercel

1. In Vercel → Project → **Settings → Domains** → add your domain (e.g. `gallery.yourdomain.com` or apex `yourdomain.com`).
2. Vercel shows the DNS records to create.

### In Namecheap (Domain List → Manage → Advanced DNS)

**Apex domain (`yourdomain.com`)**

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `76.76.21.21` |

**www**

| Type | Host | Value |
| --- | --- | --- |
| CNAME | `www` | `cname.vercel-dns.com` |

**Subdomain only (e.g. `art.yourdomain.com`)**

| Type | Host | Value |
| --- | --- | --- |
| CNAME | `art` | `cname.vercel-dns.com` |

3. Remove conflicting Namecheap parking / redirect records for the same host.
4. Wait for DNS (often minutes; can take up to 48h).
5. In Vercel, confirm the domain shows **Valid** and HTTPS is issued automatically.

---

## 5. Post-deploy checklist

- [ ] Open production URL → gallery loads (empty state is OK).
- [ ] `/admin/login` works with your Supabase user.
- [ ] Create tags → upload an image → set caption → publish.
- [ ] Public artwork page zooms; views appear under **Admin → Analytics**.
- [ ] Search by title/caption/tag works.
- [ ] GitHub PR creates a Vercel Preview; CI is green.

---

## 6. Ongoing workflow

1. Edit locally → `npm run dev`.
2. Push branch → open PR → review Vercel Preview.
3. Merge to `main` → production updates.
4. Upload new art anytime via `/admin` (no redeploy needed).

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Gallery shows setup error | Env vars missing on Vercel; redeploy after adding them |
| Images 400 / broken | Confirm SQL migration created `artworks` storage bucket; check `next.config.ts` remotePatterns |
| Admin redirect loop | Confirm Auth user exists; disable email confirmation for that user if needed |
| Domain not verifying | Clear old A/CNAME/URL Redirect records in Namecheap; wait for TTL |
| CI build fails | Match Node 22 locally; ensure `npm ci` succeeds |
