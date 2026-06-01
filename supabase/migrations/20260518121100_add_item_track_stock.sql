-- Opt-in stock monitoring per item.
-- Defaults to false: most church inventory (instruments, equipment) doesn't
-- need low-stock alerts. Perishables/consumables flip this on explicitly.

alter table public.items
    add column if not exists track_stock boolean not null default false;
