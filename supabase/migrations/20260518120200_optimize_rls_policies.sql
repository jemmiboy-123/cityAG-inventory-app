-- Wrap auth.role() in a SELECT so Postgres caches the result per query
-- instead of re-evaluating it per row.
-- Silences advisor: auth_rls_initplan.

DROP POLICY IF EXISTS "Authenticated access" ON public.categories;
CREATE POLICY "Authenticated access" ON public.categories
  FOR ALL TO public
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Authenticated access" ON public.items;
CREATE POLICY "Authenticated access" ON public.items
  FOR ALL TO public
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Authenticated access" ON public.borrowed_items;
CREATE POLICY "Authenticated access" ON public.borrowed_items
  FOR ALL TO public
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');
