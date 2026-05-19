-- Track who originally added each item
-- created_by: FK to auth.users for proper relational integrity
-- created_by_email: denormalized for cheap display without joining through auth schema

alter table public.items
    add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.items
    add column if not exists created_by_email text;
