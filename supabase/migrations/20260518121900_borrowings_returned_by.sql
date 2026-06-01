-- Track who recorded a return. Needed for partial-return audit:
-- each partial return creates a new returned-row, and we want to know
-- which user clicked the Return button on that portion.

alter table public.borrowings
    add column if not exists returned_by uuid references auth.users(id) on delete set null;
