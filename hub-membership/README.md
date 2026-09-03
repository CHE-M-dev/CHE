# Startup Hub Membership

A membership app for a startup hub. Nothing but membership: manual email/password
accounts, startup companies, their teams, and admin oversight. No other features
are in scope by design.

## Roles

- **Company leader** — the person who creates a company. Can invite startup
  members and employees via shareable invite links, and remove anyone from
  their company (except themselves).
- **Startup member** — a core team member added to a company (by the leader or
  another startup member's invite link).
- **Employee** — staff added to a company via an employee invite link.
- **Admin** — created by a super admin, sees only the sections toggled on for
  them: Companies, Members, Invites, Admins.
- **Super admin** — full access. Creates sub-admin accounts and toggles which
  features each one can access.

A user belongs to at most one company. Signing up with no invite link prompts
you to create a company (making you its leader); signing up via an invite link
joins you to that company instead.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase: Postgres, Auth (email/password only — no OAuth), and Row Level
  Security for all authorization

## How it works

- Every Supabase auth user gets a `profiles` row automatically (`system_role`
  defaults to `user`) via a database trigger.
- `companies` holds one row per startup. `company_members` links a user to a
  company with a `company_role` of `leader`, `startup_member`, or `employee`,
  and a unique constraint on `user_id` so nobody is in two companies at once.
- A company is created with just a name; the leader fills in the rest —
  industry, company size, funding stage, founded year, website, phone,
  address, and a short description — from **Dashboard → Company profile**
  whenever they want. All of it is optional.
- `invites` are single-use-by-default tokenized links (`/invite/<token>`)
  scoped to a company and a role (`startup_member` or `employee`), created
  only by the company leader. Accepting one is handled by the `accept_invite`
  SQL function so the check-and-join is atomic.
- `/companies` is a public directory — searchable by anyone, signed in or
  not — built on a `public_companies` view that exposes only the safe,
  non-sensitive fields (name, industry, size, funding stage, founded year,
  website, description). Phone and address stay private to the company's
  own members and admins.
- `admin_features` is the fixed catalog of togglable admin capabilities
  (`manage_companies`, `manage_members`, `manage_invites`, `view_admins`).
  `admin_feature_grants` records which of those a given sub-admin has —
  set only by a super admin.
- Route access (`/onboarding`, `/dashboard/*`, `/admin/*`) and post-login
  redirects are enforced in `src/middleware.ts` based on the signed-in user's
  system role and company membership. Every table also has Row Level Security
  policies so access is enforced at the database layer regardless of the app.

## Local setup

1. Create a Supabase project (or use an existing one dedicated to this app).
2. Run the SQL files under `supabase/migrations/` once, in order, via the
   Supabase SQL editor or `supabase db push` with the CLI.
3. In Supabase Auth settings, you can leave "confirm email" on for production
   use, or turn it off (Authentication → Providers → Email) for instant
   access during local testing.
4. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project
     Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — same page. This stays server-side; it's
     only used by the super admin's "create sub-admin" action.
5. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000). New visitors are sent
   to `/login`.

## Creating the first super admin

There's no UI for this — it's the one bootstrap step. After someone signs up
normally, promote them once in the Supabase SQL editor:

```sql
update profiles set system_role = 'super_admin' where email = 'the-owner@example.com';
```

From then on, that person can create sub-admins from **Admin → Admins → Create
a sub-admin**, and toggle which of the four admin features each one has.

## Notes

- Invite links expire after 14 days and are single-use by default
  (`invites.max_uses`), enforced by the `accept_invite` function.
- A company leader can remove any startup member or employee from their
  company, but not themselves — there's no leadership transfer or company
  deletion flow in this scope.
- Admins can never grant themselves permissions or create other admins —
  only a super admin can do either.
