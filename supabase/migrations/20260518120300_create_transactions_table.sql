-- Backing table for the Accounting page (currently rendering mock data).
-- amount is signed: positive for credits, negative for debits.
-- type is explicit for clarity and to drive UI styling.

CREATE TABLE IF NOT EXISTS public.transactions (
  id           uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_on  date           NOT NULL DEFAULT CURRENT_DATE,
  description  text           NOT NULL,
  category     text,
  amount       numeric(12, 2) NOT NULL,
  type         text           NOT NULL CHECK (type IN ('credit', 'debit')),
  notes        text,
  created_at   timestamptz    NOT NULL DEFAULT now(),
  created_by   uuid           REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS transactions_occurred_on_idx
  ON public.transactions(occurred_on DESC);

CREATE INDEX IF NOT EXISTS transactions_type_idx
  ON public.transactions(type);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated access" ON public.transactions;
CREATE POLICY "Authenticated access" ON public.transactions
  FOR ALL TO public
  USING ((SELECT auth.role()) = 'authenticated')
  WITH CHECK ((SELECT auth.role()) = 'authenticated');
