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

## Protecting newer data from older app versions (recommended once, before deploying the Lab sync and resets)

**The problem.** Consulting Lab work and the deletion markers for resets are stored next to the progress in the same cloud row (`progress.data`).
A browser tab that was opened before this version was deployed still runs the older app code. That code only knows the progress fields,
so when it saves progress it writes a row **without** the Lab section and **without** the reset marker.

**What the app itself does (cannot fully prevent this).** A new app version keeps its own local copy and puts the Lab work and the
marker back on its next sync, so nothing is lost while at least one device that has the work is still using the new version.
Code in the new app cannot stop an older tab from writing, so this is recovery, not prevention.

**What prevents it: a database trigger (server-side).** It adds no table, no column and no policy. On every update of `progress.data`, if the
old row had a `lab` or `progressReset` part and the new data leaves it out, the database puts the old part back. Nothing else is touched.

### What the trigger does, exactly
- Table and operation: only `public.progress`, only `UPDATE` of the `data` column, one row at a time. Not INSERT, not DELETE, not other tables.
- It runs inside the update the person was already allowed to make (Row Level Security is checked first, as before). It reads nothing but the row being
  updated (`OLD` and `NEW`) and is not `security definer`, so it cannot see or change anyone else's row and gives nobody extra access.
- If `data` is not a JSON object (it always is, from the app) it does nothing.
- The new app never leaves these parts out: a Lab reset keeps a `lab` object that holds the marker, and a progress reset or a restore keeps a `progressReset`
  marker. So legitimate resets, backup restores and normal syncs write the values they want and are stored exactly as sent.
- It cannot be bypassed by an older tab, because the check is in the database.
- It does not stop an older tab from saving its own stale progress (old answers). The reset marker is kept, and new-version devices remove such stale
  progress at their next sync.
- Because a bug in a trigger would make every save fail, the steps below test the function on a scratch copy first and only then attach it.
- Safe to run more than once: `create or replace` and `drop trigger if exists` make every step repeatable.

### Step A: create the function (it does nothing until it is attached)
```sql
create or replace function public.keep_newer_sections() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if jsonb_typeof(old.data) = 'object' and jsonb_typeof(new.data) = 'object' then
    if jsonb_exists(old.data, 'lab') and not jsonb_exists(new.data, 'lab') then
      new.data := new.data || jsonb_build_object('lab', old.data -> 'lab');
    end if;
    if jsonb_exists(old.data, 'progressReset') and not jsonb_exists(new.data, 'progressReset') then
      new.data := new.data || jsonb_build_object('progressReset', old.data -> 'progressReset');
    end if;
  end if;
  return new;
end;
$$;
```

### Step B: test the function on a scratch table (nothing real is touched; everything is rolled back)
The scratch table lives in its own `scratch` schema, which the app cannot reach. If you see an error, run `rollback;` once and tell the developer.
```sql
begin;
create schema scratch;
create table scratch.progress_test (id int primary key, data jsonb not null);
create trigger t before update of data on scratch.progress_test
  for each row execute function public.keep_newer_sections();

do $test$
declare r jsonb;
begin
  insert into scratch.progress_test values (1, '{"attempts":[1],"lab":{"v":1},"progressReset":{"c":"x"}}');
  insert into scratch.progress_test values (2, '{"attempts":[]}');

  -- an older app version saves progress only: the progress change is kept, the two sections are put back
  update scratch.progress_test set data = '{"attempts":[1,2]}' where id = 1;
  select data into r from scratch.progress_test where id = 1;
  if r -> 'attempts' <> '[1,2]'::jsonb then raise exception 'FAILED: the progress change was blocked'; end if;
  if r -> 'lab' <> '{"v":1}'::jsonb then raise exception 'FAILED: lab was lost'; end if;
  if r -> 'progressReset' <> '{"c":"x"}'::jsonb then raise exception 'FAILED: reset marker was lost'; end if;

  -- the new app saves new values: they win, nothing old is forced back
  update scratch.progress_test set data = '{"attempts":[],"lab":{"v":2},"progressReset":{"c":"y"}}' where id = 1;
  select data into r from scratch.progress_test where id = 1;
  if r -> 'lab' <> '{"v":2}'::jsonb or r -> 'progressReset' <> '{"c":"y"}'::jsonb then raise exception 'FAILED: a legitimate new value was overwritten'; end if;

  -- a Lab reset keeps a lab object with no work in it: stored as sent
  update scratch.progress_test set data = '{"attempts":[],"lab":{"drafts":{}},"progressReset":{"c":"y"}}' where id = 1;
  select data into r from scratch.progress_test where id = 1;
  if r -> 'lab' <> '{"drafts":{}}'::jsonb then raise exception 'FAILED: a legitimate Lab reset was changed'; end if;

  -- a row that never had the sections is left alone
  update scratch.progress_test set data = '{"attempts":[3]}' where id = 2;
  select data into r from scratch.progress_test where id = 2;
  if jsonb_exists(r, 'lab') or jsonb_exists(r, 'progressReset') or r -> 'attempts' <> '[3]'::jsonb then raise exception 'FAILED: a plain row was changed'; end if;

  -- data that is not an object is not touched
  update scratch.progress_test set data = '[1,2]' where id = 2;
  select data into r from scratch.progress_test where id = 2;
  if r <> '[1,2]'::jsonb then raise exception 'FAILED: non-object data was changed'; end if;
end
$test$;
rollback;
select 'ALL SCRATCH TESTS PASSED' as result;
```
Only continue if the result says `ALL SCRATCH TESTS PASSED`.

### Step C: attach it to the real table
```sql
drop trigger if exists keep_newer_sections on public.progress;
create trigger keep_newer_sections
  before update of data on public.progress
  for each row execute function public.keep_newer_sections();
```

### Step D: verify with disposable accounts
From the project folder run `node scripts/verify-lab-trigger.mjs`. It creates two throwaway accounts (`zz.trigger.*@example.com`), works only on
their own rows and prints PASS or FAIL for each check. Afterwards delete both users in **Authentication → Users** (their rows go with them).

### Rollback (safe at any time; stored data is not changed)
```sql
drop trigger if exists keep_newer_sections on public.progress;
drop function if exists public.keep_newer_sections();
```
Everything works as before afterwards; only the protection against older app tabs is gone.

### If you ever need to remove a person's Lab section on purpose
The trigger would put it back. Switch it off for that one change and on again:
```sql
alter table public.progress disable trigger keep_newer_sections;
-- ...your update...
alter table public.progress enable trigger keep_newer_sections;
```

### Safest deployment order
1. Steps A, B and C above. 2. Step D. 3. Deploy the new app. 4. Ask everyone to refresh the site (Ctrl+F5) or reopen it once; a tab that was not refreshed still runs the older code.