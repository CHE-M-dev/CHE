-- Move from "one company per user, leader invites people in" to a
-- LinkedIn-style model: a personal profile with any number of work
-- experiences, each linking to a company. Joining a company is entirely
-- self-service (search for it, or create it) and gated by two independent
-- approvals:
--   - a new company page is reviewed by a platform admin before it's public
--   - a person's "I work here" claim is reviewed by that company's owner
--     (whoever created its page) before it shows up on "Who works here"

-- ---------------------------------------------------------------------------
-- 1. Drop the old join model. Tables first (this drops their own policies
--    automatically, including the ones that depend on current_company_role
--    / current_company_id below); then the companies policies that also
--    depend on those functions; then the now-unreferenced functions; then
--    the enum the dropped columns used.
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_company" on profiles;

drop table if exists invites;
drop table if exists company_members;

drop policy if exists "companies_select_member" on companies;
drop policy if exists "companies_select_admin" on companies;
drop policy if exists "companies_update_leader" on companies;

drop function if exists accept_invite(text);
drop function if exists get_invite_preview(text);
drop function if exists create_company(text);
drop function if exists current_company_role();
drop function if exists current_company_id();

drop type if exists company_role;

-- ---------------------------------------------------------------------------
-- 2. Shared approval-status enum.
-- ---------------------------------------------------------------------------
create type approval_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------------
-- 3. Companies: approval gate + social links (About section).
-- ---------------------------------------------------------------------------
alter table companies
  add column status approval_status not null default 'pending',
  add column linkedin_url text,
  add column twitter_url text;

-- ---------------------------------------------------------------------------
-- 4. Profiles: LinkedIn-style personal fields.
-- ---------------------------------------------------------------------------
alter table profiles
  add column headline text,
  add column bio text;

-- ---------------------------------------------------------------------------
-- 5. Experiences: the new join table. A profile can have any number of
--    past/current experiences at any number of companies.
-- ---------------------------------------------------------------------------
create table experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null default auth.uid() references profiles (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  title text not null,
  is_current boolean not null default true,
  start_date date,
  end_date date,
  description text,
  status approval_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index experiences_company_id_idx on experiences (company_id);
create index experiences_profile_id_idx on experiences (profile_id);

-- ---------------------------------------------------------------------------
-- 6. RPCs
-- ---------------------------------------------------------------------------

-- Creating a company also creates the founder's own, auto-approved
-- experience, atomically. The company itself still starts 'pending'.
create function create_company_with_experience(
  p_name text,
  p_title text,
  p_industry text default null,
  p_company_size company_size default null,
  p_funding_stage funding_stage default null,
  p_founded_year int default null,
  p_website text default null,
  p_phone text default null,
  p_address text default null,
  p_description text default null,
  p_linkedin_url text default null,
  p_twitter_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if trim(p_name) = '' then
    raise exception 'Company name is required';
  end if;
  if trim(coalesce(p_title, '')) = '' then
    raise exception 'Your title at the company is required';
  end if;

  insert into companies (
    name, created_by, industry, company_size, funding_stage, founded_year,
    website, phone, address, description, linkedin_url, twitter_url
  ) values (
    trim(p_name), auth.uid(), p_industry, p_company_size, p_funding_stage, p_founded_year,
    p_website, p_phone, p_address, p_description, p_linkedin_url, p_twitter_url
  )
  returning id into v_company_id;

  insert into experiences (profile_id, company_id, title, is_current, status)
  values (auth.uid(), v_company_id, trim(p_title), true, 'approved');

  return v_company_id;
end;
$$;

-- Company owner approves/rejects a pending "I work here" claim.
create function review_experience(p_experience_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select c.created_by into v_owner
  from experiences e
  join companies c on c.id = e.company_id
  where e.id = p_experience_id;

  if v_owner is null then
    raise exception 'Experience request not found';
  end if;
  if v_owner <> auth.uid() then
    raise exception 'Only the company owner can review this request';
  end if;

  update experiences
  set status = case when p_approve then 'approved'::approval_status else 'rejected'::approval_status end
  where id = p_experience_id;
end;
$$;

-- Platform admin approves/rejects a newly created company page.
create function review_company(p_company_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not admin_has_feature('manage_companies') then
    raise exception 'Only an admin with the manage_companies feature can review companies';
  end if;

  update companies
  set status = case when p_approve then 'approved'::approval_status else 'rejected'::approval_status end
  where id = p_company_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. RLS: companies
-- ---------------------------------------------------------------------------
-- Deliberately no "approved companies are visible to everyone" policy here:
-- that would grant full-row access (including the private `phone` column)
-- to any signed-in user. Anyone but the owner/admin reads an approved
-- company through the public_companies view below instead, which excludes it.
create policy "companies_select_own" on companies for select
  using (created_by = auth.uid());

create policy "companies_select_admin" on companies for select
  using (current_system_role() in ('super_admin', 'admin'));

create policy "companies_update_owner" on companies for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- 8. Public-facing view: approved companies only, with the owner's private
-- contact number (phone) excluded. Anyone but the owner/admin reads
-- companies through this view instead of the base table.
-- ---------------------------------------------------------------------------
drop view if exists public_companies;
create view public_companies as
select
  id, name, industry, company_size, funding_stage, founded_year,
  website, description, address, linkedin_url, twitter_url,
  created_by, created_at
from companies
where status = 'approved';

revoke select on public_companies from anon;
grant select on public_companies to authenticated;

-- ---------------------------------------------------------------------------
-- 9. RLS: experiences
-- ---------------------------------------------------------------------------
alter table experiences enable row level security;

create policy "experiences_select_self" on experiences for select
  using (profile_id = auth.uid());

create policy "experiences_select_approved" on experiences for select
  using (status = 'approved');

create policy "experiences_select_owner" on experiences for select
  using (exists (select 1 from companies c where c.id = company_id and c.created_by = auth.uid()));

create policy "experiences_select_admin" on experiences for select
  using (current_system_role() in ('super_admin', 'admin'));

-- Checking a company's status can't be a plain subquery on `companies`
-- here: that table has no policy granting a regular user visibility into
-- a company they don't own, so the subquery would silently return zero
-- rows (and block every legitimate request) regardless of the company's
-- real status. Route it through a SECURITY DEFINER function that bypasses
-- RLS to read the actual value, same pattern as admin_has_feature.
create function company_is_approved(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from companies where id = p_company_id and status = 'approved');
$$;

revoke execute on function company_is_approved(uuid) from anon;

-- Inserting is always a self-service "request" starting as pending, and
-- only for companies that have already been approved.
create policy "experiences_insert_self" on experiences for insert
  with check (
    profile_id = auth.uid()
    and status = 'pending'
    and company_is_approved(company_id)
  );

-- Withdraw a pending request or remove a past role — no editing in place;
-- fix a mistake by deleting and re-adding.
create policy "experiences_delete_self" on experiences for delete
  using (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 10. RLS: profiles, replacing the old "same company_members row" policy.
-- Anyone with an approved experience is visible to any signed-in user (so a
-- name on "Who works here" can be opened as a profile); a company owner can
-- also see the profile behind any request against their company, approved
-- or not, so the review queue shows who's asking.
-- ---------------------------------------------------------------------------
create policy "profiles_select_via_experience" on profiles for select
  using (
    exists (
      select 1 from experiences e
      where e.profile_id = profiles.id and e.status = 'approved'
    )
  );

create policy "profiles_select_via_owned_company" on profiles for select
  using (
    exists (
      select 1 from experiences e
      join companies c on c.id = e.company_id
      where e.profile_id = profiles.id and c.created_by = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 11. Admin feature catalog: "manage_members" / "manage_invites" no longer
-- correspond to anything (memberships and invites are gone). Reviewing
-- companies is now part of what "manage_companies" means.
-- ---------------------------------------------------------------------------
delete from admin_features where feature_key in ('manage_members', 'manage_invites');

update admin_features
set description = 'Review and approve new startup companies, and view every company on the platform'
where feature_key = 'manage_companies';

-- ---------------------------------------------------------------------------
-- 12. Nothing in this app is reachable without an account, so these RPCs
-- shouldn't be callable by the anon role at all (they already self-guard
-- via auth.uid()/ownership checks, but there's no reason to expose them
-- pre-auth in the first place).
-- ---------------------------------------------------------------------------
revoke execute on function create_company_with_experience(
  text, text, text, company_size, funding_stage, int, text, text, text, text, text, text
) from anon;
revoke execute on function review_company(uuid, boolean) from anon;
revoke execute on function review_experience(uuid, boolean) from anon;
