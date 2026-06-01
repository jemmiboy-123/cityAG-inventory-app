-- Flag returned-rows that came from a partial return, so the UI can show
-- "Partial" instead of "Returned" and the reader knows some units of the
-- original loan are still out.

alter table public.borrowed_items
    add column if not exists is_partial boolean not null default false;
