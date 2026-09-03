-- Public directory: a safe, read-only subset of company columns that
-- anyone (including unauthenticated visitors) can browse and search.
-- Sensitive/internal fields (phone, address, created_by) are excluded.
--
-- This view intentionally runs with the privileges of its owner rather
-- than the querying role, so it can return every company regardless of
-- the row-level security on the underlying `companies` table (which
-- still restricts direct table access to a company's own members and
-- admins). Only the columns listed here are ever exposed publicly.
create view public_companies as
select
  id,
  name,
  industry,
  company_size,
  funding_stage,
  founded_year,
  website,
  description,
  created_at
from companies;

grant select on public_companies to anon, authenticated;
