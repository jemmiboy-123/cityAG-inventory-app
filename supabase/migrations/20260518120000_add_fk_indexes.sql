-- Add covering indexes for foreign keys and the hot "open loans" filter.
-- Silences advisor: unindexed_foreign_keys.

CREATE INDEX IF NOT EXISTS items_category_id_idx
  ON public.items(category_id);

CREATE INDEX IF NOT EXISTS borrowed_items_item_id_idx
  ON public.borrowed_items(item_id);

CREATE INDEX IF NOT EXISTS borrowed_items_open_idx
  ON public.borrowed_items(returned_at)
  WHERE returned_at IS NULL;
