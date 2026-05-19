-- Item lending: who has what, when due, when returned.
-- returned_at IS NULL == still out.
-- A trigger keeps items.quantity in sync on borrow/return.

create table if not exists public.borrowings (
    id             uuid        primary key default gen_random_uuid(),
    item_id        uuid        not null references public.items(id) on delete cascade,
    borrower_id    uuid        references auth.users(id) on delete set null,
    borrower_email text        not null,
    quantity       integer     not null default 1 check (quantity > 0),
    borrowed_at    timestamptz not null default now(),
    due_at         date,
    returned_at    timestamptz,
    notes          text,
    created_by     uuid        references auth.users(id) on delete set null,
    created_at     timestamptz not null default now()
);

create index if not exists borrowings_item_id_active_idx
    on public.borrowings (item_id)
    where returned_at is null;

create index if not exists borrowings_borrower_id_idx
    on public.borrowings (borrower_id);

alter table public.borrowings enable row level security;

drop policy if exists "Authenticated access" on public.borrowings;
create policy "Authenticated access" on public.borrowings
    for all to public
    using ((select auth.role()) = 'authenticated')
    with check ((select auth.role()) = 'authenticated');

-- Auto-adjust items.quantity on borrow / return
-- INSERT with returned_at IS NULL  -> decrement
-- UPDATE flipping returned_at NULL -> NOT NULL  -> increment
create or replace function public.borrowings_adjust_item_quantity()
returns trigger
language plpgsql
as $$
begin
    if tg_op = 'INSERT' then
        if new.returned_at is null then
            update public.items
               set quantity = greatest(quantity - new.quantity, 0)
             where id = new.item_id;
        end if;
        return new;
    elsif tg_op = 'UPDATE' then
        -- Return event: previously out, now marked returned
        if old.returned_at is null and new.returned_at is not null then
            update public.items
               set quantity = quantity + new.quantity
             where id = new.item_id;
        -- Un-return (rare): previously returned, now NULL again
        elsif old.returned_at is not null and new.returned_at is null then
            update public.items
               set quantity = greatest(quantity - new.quantity, 0)
             where id = new.item_id;
        end if;
        return new;
    end if;
    return new;
end;
$$;

drop trigger if exists borrowings_adjust_qty on public.borrowings;
create trigger borrowings_adjust_qty
    after insert or update on public.borrowings
    for each row
    execute function public.borrowings_adjust_item_quantity();
