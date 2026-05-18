-- Covering index for the transactions.created_by foreign key.
-- Silences advisor: unindexed_foreign_keys.

CREATE INDEX IF NOT EXISTS transactions_created_by_idx
  ON public.transactions(created_by);
