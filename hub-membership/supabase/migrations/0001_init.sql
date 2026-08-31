-- Startup Hub Membership — core schema
-- Manual email/password auth only (no OAuth). Roles:
--   system_role:  super_admin | admin | user
--   company_role: leader | startup_member | employee

create extension if not exists pgcrypto;

create type system_role as enum ('super_admin', 'admin', 'user');
create type company_role as enum ('leader', 'startup_member', 'employee');

-- One row per auth user, created automatically on signup.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  system_role system_role not null default 'user',
  created_at timestamptz not null default now()
);

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

-- A user belongs to at most one company.
create table company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  user_id uuid not null unique references profiles (id) on delete cascade,
  company_role company_role not null,
  invited_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index company_members_company_id_idx on company_members (company_id);

create table invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  role company_role not null check (role in ('startup_member', 'employee')),
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_by uuid not null references profiles (id),
  max_uses int not null default 1 check (max_uses > 0),
  uses_count int not null default 0,
  revoked boolean not null default false,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index invites_company_id_idx on invites (company_id);

-- Fixed catalog of features a super admin can grant to sub-admins.
create table admin_features (
  feature_key text primary key,
  label text not null,
  description text not null
);

insert into admin_features (feature_key, label, description) values
  ('manage_companies', 'Manage companies', 'View every startup company on the platform'),
  ('manage_members', 'Manage members', 'View and remove startup members/employees across all companies'),
  ('manage_invites', 'Manage invites', 'View and revoke invite links across all companies'),
  ('view_admins', 'View admins', 'View the list of admin and sub-admin accounts');

create table admin_feature_grants (
  admin_id uuid not null references profiles (id) on delete cascade,
  feature_key text not null references admin_features (feature_key) on delete cascade,
  enabled boolean not null default true,
  primary key (admin_id, feature_key)
);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER, used by RLS policies below)
-- ---------------------------------------------------------------------------

create function current_system_role()
returns system_role
language sql
stable
security definer
set search_path = public
as $$
  select system_role from profiles where id = auth.uid();
$$;

create function current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from company_members where user_id = auth.uid();
$$;

create function current_company_role()
returns company_role
language sql
stable
security definer
set search_path = public
as $$
  select company_role from company_members where user_id = auth.uid();
$$;

create function admin_has_feature(p_feature text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    current_system_role() = 'super_admin'
    or exists (
      select 1 from admin_feature_grants
      where admin_id = auth.uid() and feature_key = p_feature and enabled
    );
$$;

-- ---------------------------------------------------------------------------
-- New-user trigger
-- ---------------------------------------------------------------------------

create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Transactional RPCs (avoid partial writes / race conditions)
-- ---------------------------------------------------------------------------

create function create_company(p_name text)
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

  if exists (select 1 from company_members where user_id = auth.uid()) then
    raise exception 'You already belong to a company';
  end if;

  if trim(p_name) = '' then
    raise exception 'Company name is required';
  end if;

  insert into companies (name, created_by) values (trim(p_name), auth.uid())
  returning id into v_company_id;

  insert into company_members (company_id, user_id, company_role)
  values (v_company_id, auth.uid(), 'leader');

  return v_company_id;
end;
$$;

create function get_invite_preview(p_token text)
returns table (company_name text, role company_role, valid boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.name,
    i.role,
    (not i.revoked and i.expires_at > now() and i.uses_count < i.max_uses)
  from invites i
  join companies c on c.id = i.company_id
  where i.token = p_token;
$$;

create function accept_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from company_members where user_id = auth.uid()) then
    raise exception 'You already belong to a company';
  end if;

  select * into v_invite from invites where token = p_token for update;

  if not found then
    raise exception 'Invite not found';
  end if;

  if v_invite.revoked or v_invite.expires_at <= now() or v_invite.uses_count >= v_invite.max_uses then
    raise exception 'This invite link is no longer valid';
  end if;

  insert into company_members (company_id, user_id, company_role, invited_by)
  values (v_invite.company_id, auth.uid(), v_invite.role, v_invite.created_by);

  update invites set uses_count = uses_count + 1 where id = v_invite.id;

  return v_invite.company_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table companies enable row level security;
alter table company_members enable row level security;
alter table invites enable row level security;
alter table admin_features enable row level security;
alter table admin_feature_grants enable row level security;

-- profiles
create policy "profiles_select_self" on profiles for select
  using (id = auth.uid());

create policy "profiles_select_company" on profiles for select
  using (
    exists (
      select 1 from company_members me
      join company_members them on them.company_id = me.company_id
      where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );

create policy "profiles_select_admin" on profiles for select
  using (current_system_role() in ('super_admin', 'admin'));

create policy "profiles_update_self" on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and system_role = current_system_role());

-- companies
create policy "companies_select_member" on companies for select
  using (id = current_company_id());

-- Any admin can resolve a company's name for display (e.g. on the members
-- or invites screens); the dedicated companies listing is still gated by
-- the manage_companies feature at the page level.
create policy "companies_select_admin" on companies for select
  using (current_system_role() in ('super_admin', 'admin'));

create policy "companies_update_leader" on companies for update
  using (id = current_company_id() and current_company_role() = 'leader');

-- company_members
create policy "company_members_select_own_company" on company_members for select
  using (company_id = current_company_id());

create policy "company_members_select_admin" on company_members for select
  using (admin_has_feature('manage_members'));

create policy "company_members_delete_leader" on company_members for delete
  using (
    company_id = current_company_id()
    and current_company_role() = 'leader'
    and user_id <> auth.uid()
  );

create policy "company_members_delete_admin" on company_members for delete
  using (admin_has_feature('manage_members') and company_role <> 'leader');

-- invites
create policy "invites_select_leader" on invites for select
  using (company_id = current_company_id() and current_company_role() = 'leader');

create policy "invites_select_admin" on invites for select
  using (admin_has_feature('manage_invites'));

create policy "invites_insert_leader" on invites for insert
  with check (
    company_id = current_company_id()
    and current_company_role() = 'leader'
    and created_by = auth.uid()
  );

create policy "invites_update_leader" on invites for update
  using (company_id = current_company_id() and current_company_role() = 'leader');

create policy "invites_update_admin" on invites for update
  using (admin_has_feature('manage_invites'));

-- admin_features (readable by any admin so the UI can render toggle labels)
create policy "admin_features_select_admin" on admin_features for select
  using (current_system_role() in ('super_admin', 'admin'));

-- admin_feature_grants
create policy "admin_feature_grants_select_self" on admin_feature_grants for select
  using (admin_id = auth.uid());

create policy "admin_feature_grants_select_super_admin" on admin_feature_grants for select
  using (current_system_role() = 'super_admin');

create policy "admin_feature_grants_write_super_admin" on admin_feature_grants for all
  using (current_system_role() = 'super_admin')
  with check (current_system_role() = 'super_admin');
