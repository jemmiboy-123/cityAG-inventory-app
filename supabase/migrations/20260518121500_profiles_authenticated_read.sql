-- The original "self only" SELECT policy on profiles blocks legitimate
-- multi-user features: picking a borrower, showing "Added by" / "Authorized by"
-- names across the app, etc.
--
-- Switch SELECT to "any authenticated user can read all profiles."
-- UPDATE and INSERT stay self-only so no one can modify someone else's prefs.

drop policy if exists "Profiles self read" on public.profiles;

create policy "Profiles authenticated read" on public.profiles
    for select to public
    using ((select auth.role()) = 'authenticated');
