# Cloud accounts and sync — one-time setup (Supabase free tier)

The app works without this (local-only). With it, each person gets their own account and their progress follows them across devices.

## 1. Create the project
1. Sign up at https://supabase.com (free plan) and create a new project (any name, pick a nearby region, save the database password somewhere safe — the app never needs it).
2. **Authentication → Providers → Email:** keep Email enabled. For a private family group, turn **off** "Confirm email" (the app uses `#/` routes, so email-link redirects are not supported). After everyone has registered you can switch **Allow new users to sign up** off to close registration.
3. **Project Settings → API:** copy the **Project URL** and the **anon public** key. Never copy the `service_role` key anywhere.

## 2. Create the table and the access rules
Open **SQL Editor**, paste and run:

```sql
create table public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint progress_size check (pg_column_size(data) < 3000000)
);

alter table public.progress enable row level security;

create policy "own row: read"   on public.progress for select to authenticated using (auth.uid() = user_id);
create policy "own row: create" on public.progress for insert to authenticated with check (auth.uid() = user_id);
create policy "own row: update" on public.progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Newer Supabase projects do not grant table access automatically. Signed-in users only; no delete; nothing for signed-out visitors.
grant select, insert, update on public.progress to authenticated;

-- Deliberately no delete policy and no access for signed-out visitors.
```

These rules are what stop one person reading or changing another person's progress.

## 2b. Allow the password-reset link to come back to the app
In **Authentication → URL Configuration** (older dashboards: Authentication → Settings):
- **Site URL:** `https://moszkuuu.github.io/mba-learning-simulator/`
- **Redirect URLs:** add `https://moszkuuu.github.io/mba-learning-simulator/` (and `http://localhost:5173/mba-learning-simulator/` if you test locally).

How reset works: **Forgot password?** emails a link that returns to the app with a single-use code (PKCE). The link must be opened in the **same browser** that asked for it. The app then shows "Choose a new password". Supabase's built-in email sender is rate limited (a few emails per hour), which is enough for a family group.

## 3. Give the build the two public values
GitHub repo → **Settings → Secrets and variables → Actions → Variables** (not Secrets) → add:
- `VITE_SUPABASE_URL` = the Project URL
- `VITE_SUPABASE_ANON_KEY` = the anon public key

For local testing create `.env.local` (git-ignored by Vite's default rules; do not commit it) with the same two lines.

## 4. Check it
Push/deploy only after you approve. Then register two test accounts on two browsers and confirm each sees only its own progress.

## How it behaves
- Signed out ("guest"): exactly as before; progress stays in this browser.
- Signing in never changes guest progress. A banner offers to copy it into the account (merge, guest copy kept).
- Progress is cached per account on each device and merged with the cloud copy. Two devices are merged, never overwritten. Reset and "import backup" are deliberate and replace the account copy.
- Known limits: an in-progress simulator game is taken from whichever side has more months played; a signed-out device keeps the account's cached copy on disk (shared computers: sign out).
