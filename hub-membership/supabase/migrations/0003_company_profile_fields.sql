-- Startup profile fields on companies. All optional — a company can be
-- created with just a name and filled in later from the dashboard.

create type company_size as enum ('1-10', '11-50', '51-200', '201-500', '500+');

create type funding_stage as enum (
  'bootstrapped',
  'pre_seed',
  'seed',
  'series_a',
  'series_b',
  'series_c_plus',
  'public',
  'acquired'
);

alter table companies
  add column industry text,
  add column company_size company_size,
  add column funding_stage funding_stage,
  add column founded_year int check (founded_year between 1800 and 2100),
  add column website text,
  add column phone text,
  add column address text,
  add column description text;
