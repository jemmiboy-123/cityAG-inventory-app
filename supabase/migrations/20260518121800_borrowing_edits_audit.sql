-- Audit trail for loan edits.
-- Two things this migration does:
--   1. New borrowing_edits table that captures who changed what, when.
--   2. Update borrowings_adjust_item_quantity() so editing quantity on an
--      ACTIVE loan keeps items.quantity in sync (previously only INSERT and
--      return-transitions were handled, so quantity edits would desync stock).

-- =========================================================================
-- borrowing_edits: per-edit history rows
-- =========================================================================
create table if not exists public.borrowing_edits (
    id           uuid        primary key default gen_random_uuid(),
    borrowing_id uuid        not null references public.borrowings(id) on delete cascade,
    edited_by    uuid        references auth.users(id) on delete set null,
    edited_at    timestamptz not null default now(),
    changes      jsonb       not null
);

create index if not exists borrowing_edits_borrowing_id_idx
    on public.borrowing_edits(borrowing_id, edited_at desc);

alter table public.borrowing_edits enable row level security;

drop policy if exists "Borrowing edits read"   on public.borrowing_edits;
drop policy if exists "Borrowing edits insert" on public.borrowing_edits;

create policy "Borrowing edits read" on public.borrowing_edits
    for select to public
    using ((select auth.role()) = 'authenticated');

-- Anyone signed in can record an edit, but only AS themselves.
create policy "Borrowing edits insert" on public.borrowing_edits
    for insert to public
    with check ((select auth.uid()) = edited_by);

-- =========================================================================
-- Keep items.quantity in sync when a loan's quantity is edited.
-- =========================================================================
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
        -- Loan being returned: refund the units.
        if old.returned_at is null and new.returned_at is not null then
            update public.items
               set quantity = quantity + old.quantity
             where id = new.item_id;
        -- Return being undone: deduct again.
        elsif old.returned_at is not null and new.returned_at is null then
            update public.items
               set quantity = greatest(quantity - new.quantity, 0)
             where id = new.item_id;
        -- Active loan, quantity edited: adjust by the delta.
        elsif old.returned_at is null and new.returned_at is null
              and new.quantity is distinct from old.quantity then
            update public.items
               set quantity = greatest(quantity + old.quantity - new.quantity, 0)
             where id = new.item_id;
        end if;
        return new;
    end if;
    return new;
end;
$$;
