-- Remove the borrowing/loan feature.
-- borrowed_items is empty so this is a clean drop. The borrow trigger and
-- adjust-quantity function are also dropped since they only existed to
-- keep items.quantity in sync with this table.

DROP TRIGGER IF EXISTS borrowed_items_adjust_quantity ON public.borrowed_items;
DROP FUNCTION IF EXISTS public.borrow_adjust_quantity();
DROP TABLE IF EXISTS public.borrowed_items;
