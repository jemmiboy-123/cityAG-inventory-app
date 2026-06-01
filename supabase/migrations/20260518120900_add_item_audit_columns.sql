-- Audit + soft-delete for items
-- updated_by: who last modified the item
-- deleted_at / deleted_by: soft-delete so we can audit who removed what

alter table public.items
    add column if not exists updated_by uuid references auth.users(id) on delete set null;

alter table public.items
    add column if not exists deleted_at timestamptz;

alter table public.items
    add column if not exists deleted_by uuid references auth.users(id) on delete set null;

-- Speeds up the active-items filter that every Inventory query uses
create index if not exists items_active_idx
    on public.items (created_at desc)
    where deleted_at is null;
