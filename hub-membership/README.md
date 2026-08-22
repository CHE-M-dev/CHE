# Hub Membership

A minimal membership app for the hub: two roles only, admin and member.

- **Members** sign up, sign in, and see a personal QR code plus their own check-in history.
- **Admins** see all members, activate/deactivate them, and scan member QR codes with a
  device camera to check people in. Every scan is logged with a timestamp.

No other features are in scope by design.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase: Postgres, Auth (email/password), and Row Level Security for all authorization
- `qrcode.react` to render each member's QR code, `html5-qrcode` to scan it from the browser

## How it works

- Every Supabase auth user gets a `profiles` row automatically (`role` defaults to `member`,
  `status` defaults to `active`) via a database trigger.
- A member's QR code simply encodes their `profiles.id` (a UUID) — nothing else to configure.
- Scanning inserts a row into `check_ins` (`member_id`, `scanned_by`, `created_at`). Row Level
  Security enforces that **only** admins can insert check-ins, and that members can only ever
  read their own check-in history while admins can read everyone's.
- Route access (`/admin/*` vs `/member/*`) and post-login redirects are enforced in `src/proxy.ts`
  (Next.js's server-side request interceptor) using the signed-in user's role.

## Local setup

1. Copy `.env.local.example` to `.env.local` and fill in your Supabase project's URL and anon
   (publishable) key — find both in the Supabase dashboard under Project Settings → API.
2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000). New visitors are sent to `/signup`.

The database schema (`profiles`, `check_ins`, RLS policies, and the signup trigger) already
lives in the connected Supabase project's migrations — no manual SQL is needed unless you're
pointing this app at a fresh Supabase project, in which case re-apply the SQL from the project's
migration history.

## Promoting the first admin

Every new signup starts as a `member`. To create your first admin, run this once in the
Supabase SQL editor after that person signs up:

```sql
update profiles set role = 'admin' where email = 'the-admin@example.com';
```

After that, existing admins can promote or demote other members from **Admin → Members →
(select a member) → Make admin / Revoke admin** in the app itself.

## Notes

- Supabase's default "confirm email" setting is on, so a new signup must click the confirmation
  link in their email before they can sign in. Turn this off in Supabase Auth settings
  (Authentication → Providers → Email) if you'd rather members get instant access at the hub.
- The QR code is just the member's ID — it's meant for fast, low-friction check-in at a single
  hub, not as a high-security credential. Deactivating a member's `status` immediately blocks
  further check-ins for them even if their QR code is shared or photographed.
