-- Tier 1 item-details enhancement
-- Adds identification (serial_number, brand, model) and lifecycle status

alter table public.items add column if not exists serial_number text;
alter table public.items add column if not exists brand text;
alter table public.items add column if not exists model text;
alter table public.items add column if not exists status text not null default 'In use';

-- Restrict status to the agreed lifecycle values
alter table public.items drop constraint if exists items_status_check;
alter table public.items add constraint items_status_check
    check (status in ('In use', 'In storage', 'Under repair', 'Retired', 'Lost'));

-- Speeds up warranty / audit lookups by serial
create index if not exists items_serial_number_idx
    on public.items (serial_number)
    where serial_number is not null;
