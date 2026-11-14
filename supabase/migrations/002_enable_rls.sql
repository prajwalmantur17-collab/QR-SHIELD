-- QR Shield: Supabase Database Migration
-- Version: 002_enable_rls.sql
--
-- WHY: Supabase exposes every table in the `public` schema through its REST API using the
-- project's public "anon" key. Without Row Level Security, anyone who has that key could read
-- or modify `users` (including password hashes), `scans` and `community_reports` directly,
-- bypassing this application's API entirely.
--
-- The QR Shield backend connects with the SERVICE ROLE key, which bypasses RLS, so enabling RLS
-- with NO policies simply denies all direct anon/authenticated access while the API keeps working.
--
-- Run this in the Supabase SQL Editor (it is idempotent and safe to re-run).

ALTER TABLE IF EXISTS public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scan_signals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.community_reports ENABLE ROW LEVEL SECURITY;

-- Belt and braces: make sure the public roles hold no direct table privileges.
REVOKE ALL ON public.users             FROM anon, authenticated;
REVOKE ALL ON public.scans             FROM anon, authenticated;
REVOKE ALL ON public.scan_signals      FROM anon, authenticated;
REVOKE ALL ON public.community_reports FROM anon, authenticated;
