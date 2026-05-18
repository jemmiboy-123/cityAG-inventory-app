-- items.updated_at had a default of now() but nothing kept it fresh.
-- This trigger touches it on every UPDATE.

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS items_touch_updated_at ON public.items;
CREATE TRIGGER items_touch_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();
