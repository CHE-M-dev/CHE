# Startup Hub Membership

A LinkedIn-style membership app for a startup hub: manual email/password
accounts, a personal profile with work experience, startup company pages,
and admin oversight. No posting/feed feature — that's deliberately out of
scope.

## Architecture: sign in, then an app launcher

There is exactly one landing page: `/login`. Nothing is public — the company
directory included. Once signed in, every user lands on `/apps`, a launcher
(in the spirit of Odoo's app grid) showing only the apps their role grants
them:

- **Profile** (`/apps/profile`) — for everyone. Your name, headline, about,
  and work experience.
- **Directory** (`/apps/directory`) — for everyone. Search every approved
  startup on the hub.
- **Admin** (`/apps/admin`) — only for admins and super admins. Sub-pages
  are individually gated by that admin's feature grants.

Company pages live at `/apps/company/[id]` — reached by searching the
Directory or by following a company link from someone's experience, not from
a launcher tile (there's no single "your company" destination, since a
person can have experience at any number of companies).

Each app is self-contained under its own route segment with its own layout,
actions, and components.

## The model: personal profile + experience, not team membership

There's no "your one company" relationship and no invite links. Instead:

- Everyone has a personal profile (name, headline, about) and any number of
  **experiences** — a title at a company, with a date range and a
  current/past flag, exactly like a LinkedIn work history entry.
- **Adding an experience** means searching the Directory for the company —
  or, if it doesn't exist yet, creating its page on the spot (name,
  industry, size, funding stage, website, socials, and all the rest, plus
  your own title there). Creating a company auto-approves your own founding
  experience; searching an existing one submits a request.
- **Two independent approvals** gate what's actually public:
  - A **platform admin** reviews every newly created company page before
    it's visible to anyone but its creator (Admin app → Companies).
  - The **company's owner** (whoever created its page) reviews every "I work
    here" request before that person shows up on the company's **Who works
    here** tab (shown directly on the company page when you're the owner).
- A company page has an **About** tab (industry, size, funding stage,
  founded year, website, LinkedIn/Twitter links, address, description —
  editable only by the owner) and a **Who works here** tab (everyone with an
  approved, current experience there).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase: Postgres, Auth (email/password only — no OAuth), and Row Level
  Security for all authorization

## How it works

- Every Supabase auth user gets a `profiles` row automatically (`system_role`
  defaults to `user`) via a database trigger. `headline` and `bio` are
  filled in from the Profile app.
- `companies` holds one row per startup, including a `status` of `pending`,
  `approved`, or `rejected`. `experiences` links a profile to a company with
  a free-text `title`, `is_current`/`start_date`/`end_date`, and its own
  `status` — a person can have any number of experiences, past or current,
  at any number of companies.
- `create_company_with_experience` creates the company (`pending`) and the
  founder's own experience (auto-`approved`) atomically. `review_company`
  (admin-only) and `review_experience` (company-owner-only) flip a row's
  status — both check the caller's authority themselves and raise if it's
  wrong, so they're safe to call directly.
- The Directory (and anyone browsing a company they don't own) reads through
  a `public_companies` view, not the `companies` table directly: it's
  filtered to `status = 'approved'` and leaves out the private `phone`
  column. The owner and admins read the full table instead, so they see
  pending companies and the phone number.
- `admin_features` is the fixed catalog of togglable admin capabilities
  (`manage_companies`, `view_admins`). `admin_feature_grants` records which
  of those a given sub-admin has — set only by a super admin.
- Route access and the post-login redirect to `/apps` are enforced in
  `src/middleware.ts`, which only special-cases the Admin app (admin/
  super_admin only) — everything else under `/apps` just requires being
  signed in. Every table also has Row Level Security policies, so access is
  enforced at the database layer regardless of the app.

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
a sub-admin**, and toggle which of the two admin features each one has.

## Notes

- There's no editing an experience once submitted, only removing it (your
  own) and re-adding it — keeps the approval model simple.
- Rejected companies and experiences stay rejected; there's no re-review
  flow in this scope.
- Admins can never grant themselves permissions or create other admins —
  only a super admin can do either.
