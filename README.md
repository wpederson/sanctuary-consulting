# 🕊 Sanctuary Consulting — Deployment Guide

## Stack
- **Next.js 15** (App Router) — frontend + API routes
- **Supabase** (free tier) — PostgreSQL database, Auth, Storage
- **Vercel** (free tier) — hosting with automatic deploys
- **Resend** (free tier, 3,000 emails/month) — invoice emails

---

## Step 1: Supabase Setup (~15 min)

1. Go to **[supabase.com](https://supabase.com)** → New project
2. Choose a project name (e.g. `sanctuary-consulting`), set a database password, pick a region close to you
3. Wait for project to provision (~2 min)

### Run the database schema

4. In Supabase dashboard → **SQL Editor** → New Query
5. Paste the entire contents of `supabase/migrations/001_schema.sql`
6. Click **Run** — this creates all tables, RLS policies, and storage buckets

### Create your Super Admin account

7. Supabase dashboard → **Authentication** → **Users** → **Add user**
8. Enter your email (`wespederson@comcast.net`) and a strong password
9. Copy the **User UID** from the user list
10. In SQL Editor, run:
```sql
INSERT INTO public.admin_users (auth_user_id, name, email, role, title, avatar, color)
VALUES (
  '<paste-your-user-uid-here>',
  'Wes Pederson',
  'wespederson@comcast.net',
  'super_admin',
  'Founder & Lead Consultant',
  'WP',
  'gold'
);
```

### Get your API keys

11. Supabase dashboard → **Project Settings** → **API**
12. Copy:
    - **Project URL** (`https://xxxx.supabase.co`)
    - **anon/public** key
    - **service_role** key (keep secret — server-side only)

---

## Step 2: Resend Setup (~5 min) — for invoice emails

1. Go to **[resend.com](https://resend.com)** → Sign up (free: 3,000 emails/month)
2. **API Keys** → Create API Key → copy it
3. **Domains** → Add domain (or use the default `onboarding@resend.dev` for testing)
4. Update `.env.local`:
   ```
   SANCTUARY_FROM_EMAIL=invoices@yourdomain.com
   ```
   Or for testing without a domain:
   ```
   SANCTUARY_FROM_EMAIL=onboarding@resend.dev
   ```

> **Skip Resend?** That's fine — invoice emails will fall back gracefully.
> The "Email" button in the admin will still work using your local email client (mailto:).

---

## Step 3: Local Development (~5 min)

```bash
# Clone or download this project
cd sanctuary-app

# Install dependencies
npm install

# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your actual values:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# RESEND_API_KEY=re_xxxx

# Start development server
npm run dev
```

Open **http://localhost:3000** — you'll be redirected to `/login`

Sign in with: `wespederson@comcast.net` + the password you set in Supabase Auth

---

## Step 4: Deploy to Netlify (~10 min)

### Option A: GitHub (recommended — auto-deploys on every push)

1. Push this project to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial Sanctuary app"
   git remote add origin https://github.com/YOUR_USERNAME/sanctuary-consulting
   git push -u origin main
   ```

2. Go to **[netlify.com](https://netlify.com)** → **Add new site** → **Import an existing project** → Connect to GitHub → select your repo

3. Netlify auto-detects Next.js. Build settings should be:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

4. Click **Deploy site** — the first deploy will take ~2 min

5. After deploy, go to **Site settings** → **Environment variables** → **Add a variable** and add each of these:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
   | `NEXT_PUBLIC_APP_URL` | `https://your-site.netlify.app` |
   | `RESEND_API_KEY` | `re_xxxx` |
   | `SANCTUARY_FROM_EMAIL` | `invoices@yourdomain.com` |

6. **Trigger a redeploy** after adding env vars: Deploys → Trigger deploy → Deploy site

### Option B: Drag and drop (no GitHub needed)

```bash
npm run build
```

Then drag the entire project folder into the Netlify dashboard at [app.netlify.com](https://app.netlify.com).

> **Note:** Drag-and-drop only works for static sites. For this Next.js app with server-side features, use the GitHub method above.

### Option C: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## Custom Domain (optional — free on Netlify)

1. Netlify dashboard → **Domain management** → **Add custom domain**
2. Enter your domain (e.g. `portal.sanctuary.consulting`)
3. Update your DNS records as instructed — Netlify provides free SSL automatically
4. Update your `NEXT_PUBLIC_APP_URL` env var to your custom domain and redeploy

---

## Step 5: Set up client portals

### Create a consultant account

1. Sign in as Super Admin → **User Management** → **Add User**
2. Create an account with role "Consultant", link to a consultant profile
3. Supabase Auth → **Add user** with same email + password
4. Copy the Auth User UID and run:
   ```sql
   UPDATE public.admin_users
   SET auth_user_id = '<auth-user-uid>'
   WHERE email = 'consultant@sanctuary.consulting';
   ```

### Create a client and give them portal access

1. Admin → **Clients** → **New Client** — fill in church name, contact, email
2. The client's unique portal URL is automatically: `https://your-app.vercel.app/portal/<client-uuid>`
3. Create a Supabase Auth account for the client:
   - Supabase dashboard → Authentication → Users → Add user
   - Use their **same email** address + a temporary password
4. Share their portal URL and credentials

> **Tip:** Use Supabase's built-in **magic link** or **email invite** instead of manually creating passwords.
> Auth → Users → select user → Send magic link

---

## Client Portal URLs

Each client gets a permanent, unique URL:
```
https://your-app.vercel.app/portal/[client-uuid]
```

This URL:
- Is unique to that congregation — can be bookmarked and shared
- Requires login (their email + password, or magic link)
- Shows only their assigned resources, their consultant's info, and their invoices
- Automatically shows past-due invoice popup on login if overdue invoices exist

---

## Feature Summary

| Feature | Where |
|---|---|
| Unique client portal URL | `/portal/[clientId]` |
| Admin dashboard (role-based) | `/admin` |
| Invoice management | `/admin/invoices` |
| Send invoice via email (Resend) | `/api/invoices/[id]/send` |
| Consultant photo upload | Supabase Storage → `consultant-photos` |
| Resource files | Supabase Storage → `resources` |
| Real auth | Supabase Auth (email+password, magic link) |
| Row-level security | All tables have RLS — consultants see only their clients |

---

## Troubleshooting

**"relation does not exist" error** — run the SQL schema migration in Supabase SQL Editor

**Login redirects back to /login** — check that you inserted the admin_users row with the correct auth_user_id

**Email not sending** — verify RESEND_API_KEY is set in Vercel env vars; check Resend dashboard for send logs

**Client portal shows 404** — the client UUID must match exactly; find it in Supabase → Table Editor → clients

**RLS blocking reads** — if testing, you can temporarily disable RLS in Supabase dashboard → Table Editor → [table] → RLS toggle (re-enable before going live)

---

## Upgrading from the Single-File Version

Your existing data in the browser (localStorage) can be exported by opening the old HTML file and running in the browser console:
```javascript
JSON.stringify({
  clients: JSON.parse(localStorage.getItem('sanctuary_clients') || '[]'),
  resources: JSON.parse(localStorage.getItem('sanctuary_resources') || '[]'),
  consultants: JSON.parse(localStorage.getItem('sanctuary_consultants') || '[]'),
  invoices: JSON.parse(localStorage.getItem('sanctuary_invoices') || '[]'),
})
```

Then use the Supabase Table Editor or SQL to insert this data into the new database.

---

## Free Tier Limits

| Service | Free Limit |
|---|---|
| Vercel | Unlimited deploys, 100GB bandwidth/month |
| Supabase | 500MB database, 1GB storage, 50,000 monthly active users |
| Resend | 3,000 emails/month, 100/day |

All three free tiers are more than sufficient for a consulting practice of 50–100 clients.
