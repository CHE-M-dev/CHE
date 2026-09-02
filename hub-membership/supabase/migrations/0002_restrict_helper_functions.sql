-- current_system_role/current_company_id/current_company_role/admin_has_feature
-- are internal helpers used inside RLS policies, not public API endpoints.
-- Supabase grants EXECUTE to anon/authenticated explicitly on every new
-- function in the exposed schema, on top of the PUBLIC default — both
-- grants have to be revoked. `authenticated` keeps EXECUTE because RLS
-- policy evaluation for signed-in users depends on it; `anon` does not,
-- since unauthenticated requests never need it.
revoke execute on function current_system_role() from public, anon;
revoke execute on function current_company_id() from public, anon;
revoke execute on function current_company_role() from public, anon;
revoke execute on function admin_has_feature(text) from public, anon;
grant execute on function current_system_role() to authenticated;
grant execute on function current_company_id() to authenticated;
grant execute on function current_company_role() to authenticated;
grant execute on function admin_has_feature(text) to authenticated;

-- Trigger-only function; never meant to be called directly by any client.
revoke execute on function handle_new_user() from public, anon, authenticated;
