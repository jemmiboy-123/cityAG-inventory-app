-- Per-user preferences for the inventory app.
-- One row per auth.users row, auto-created on signup, self-only RLS.

CREATE TABLE IF NOT EXISTS public.profiles (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  low_stock_threshold integer     NOT NULL DEFAULT 2 CHECK (low_stock_threshold >= 0),
  email_alerts        boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Each user can only see / update / insert their own row.
DROP POLICY IF EXISTS "Profiles self read"   ON public.profiles;
DROP POLICY IF EXISTS "Profiles self update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles self insert" ON public.profiles;

CREATE POLICY "Profiles self read" ON public.profiles
  FOR SELECT TO public
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Profiles self update" ON public.profiles
  FOR UPDATE TO public
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Profiles self insert" ON public.profiles
  FOR INSERT TO public
  WITH CHECK ((SELECT auth.uid()) = id);

-- Touch updated_at on every row update (reuses the function from migration 0001).
DROP TRIGGER IF EXISTS profiles_touch_updated_at ON public.profiles;
CREATE TRIGGER profiles_touch_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create a profile row when a new auth.users row is inserted.
-- SECURITY DEFINER lets the trigger bypass the self-only RLS policy
-- (which would otherwise reject the insert because auth.uid() is null
-- in the trigger context for a fresh signup).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
       VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill: give existing users a profile row.
INSERT INTO public.profiles (id)
  SELECT id FROM auth.users
  ON CONFLICT (id) DO NOTHING;
