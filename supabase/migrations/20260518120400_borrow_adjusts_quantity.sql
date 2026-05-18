-- Keep items.quantity in sync with borrowed_items automatically.
-- Insert open loan          → quantity - 1
-- Set returned_at (return)  → quantity + 1
-- Clear returned_at (undo)  → quantity - 1
-- Delete open loan          → quantity + 1
-- A loan inserted already-returned is a no-op.

CREATE OR REPLACE FUNCTION public.borrow_adjust_quantity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.returned_at IS NULL THEN
      UPDATE public.items
         SET quantity = quantity - 1
       WHERE id = NEW.item_id AND quantity > 0;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.returned_at IS NULL AND NEW.returned_at IS NOT NULL THEN
      UPDATE public.items
         SET quantity = quantity + 1
       WHERE id = NEW.item_id;
    ELSIF OLD.returned_at IS NOT NULL AND NEW.returned_at IS NULL THEN
      UPDATE public.items
         SET quantity = quantity - 1
       WHERE id = NEW.item_id AND quantity > 0;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.returned_at IS NULL THEN
      UPDATE public.items
         SET quantity = quantity + 1
       WHERE id = OLD.item_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS borrowed_items_adjust_quantity ON public.borrowed_items;
CREATE TRIGGER borrowed_items_adjust_quantity
  AFTER INSERT OR UPDATE OR DELETE ON public.borrowed_items
  FOR EACH ROW
  EXECUTE FUNCTION public.borrow_adjust_quantity();
