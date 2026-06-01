-- ===========================================================
-- City Assembly of God — Inventory App
-- Initial schema (fresh-setup consolidated)
-- ===========================================================
-- Run this once in a brand-new Supabase project's SQL Editor.
-- Equivalent to the 8 incremental migrations + Tier 1 columns.
-- Idempotent (IF NOT EXISTS / OR REPLACE) — safe to re-run.

create extension if not exists pgcrypto;

-- ============================ FUNCTIONS ============================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first_admin boolean;
begin
  select not exists (select 1 from public.profiles where role = 'admin')
    into is_first_admin;

  insert into public.profiles (id, email, first_name, last_name, role)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      case when is_first_admin then 'admin' else 'user' end
    )
    on conflict (id) do update
      set email      = excluded.email,
          first_name = excluded.first_name,
          last_name  = excluded.last_name
      where profiles.email      is distinct from excluded.email
         or profiles.first_name is distinct from excluded.first_name
         or profiles.last_name  is distinct from excluded.last_name;
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid()
       and role = 'admin'
  );
$$;

create or replace function public.enforce_admin_item_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.deleted_at is distinct from old.deleted_at and not public.is_admin() then
    raise exception 'Only administrators can delete items';
  end if;
  return new;
end;
$$;

create or replace function public.enforce_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only administrators can change user roles';
  end if;
  return new;
end;
$$;

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
    if old.returned_at is null and new.returned_at is not null then
      update public.items
         set quantity = quantity + old.quantity
       where id = new.item_id;
    elsif old.returned_at is not null and new.returned_at is null then
      update public.items
         set quantity = greatest(quantity - new.quantity, 0)
       where id = new.item_id;
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

-- ============================ TABLES ============================

create table if not exists public.categories (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  color       text,
  created_at  timestamptz not null default now()
);

create table if not exists public.items (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  category_id   uuid        references public.categories(id) on delete set null,
  quantity      integer     not null default 0,
  location      text,
  description   text,
  condition     text        not null default 'Good'
                check (condition in ('New', 'Good', 'Fair', 'Poor')),
  status        text        not null default 'In use'
                check (status in ('In use', 'In storage', 'Under repair', 'Retired', 'Lost')),
  serial_number text,
  brand         text,
  model         text,
  track_stock   boolean     not null default false,
  created_at       timestamptz not null default now(),
  created_by       uuid        references auth.users(id) on delete set null,
  created_by_email text,
  updated_at       timestamptz not null default now(),
  updated_by       uuid        references auth.users(id) on delete set null,
  deleted_at       timestamptz,
  deleted_by       uuid        references auth.users(id) on delete set null
);

create table if not exists public.transactions (
  id           uuid           primary key default gen_random_uuid(),
  occurred_on  date           not null default current_date,
  description  text           not null,
  category     text,
  amount       numeric(12, 2) not null,
  type         text           not null check (type in ('credit', 'debit')),
  notes        text,
  created_at   timestamptz    not null default now(),
  created_by   uuid           references auth.users(id) on delete set null
);

create table if not exists public.profiles (
  id                  uuid        primary key references auth.users(id) on delete cascade,
  email               text,
  first_name          text,
  last_name           text,
  role                text        not null default 'user'
                      check (role in ('admin', 'user')),
  low_stock_threshold integer     not null default 2 check (low_stock_threshold >= 0),
  email_alerts        boolean     not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.borrowings (
  id             uuid        primary key default gen_random_uuid(),
  item_id        uuid        not null references public.items(id) on delete cascade,
  borrower_id    uuid        references auth.users(id) on delete set null,
  borrower_email text        not null,
  quantity       integer     not null default 1 check (quantity > 0),
  borrowed_at    timestamptz not null default now(),
  due_at         date,
  returned_at    timestamptz,
  returned_by    uuid        references auth.users(id) on delete set null,
  is_partial     boolean     not null default false,
  notes          text,
  created_by     uuid        references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);

create table if not exists public.borrowing_edits (
  id           uuid        primary key default gen_random_uuid(),
  borrowing_id uuid        not null references public.borrowings(id) on delete cascade,
  edited_by    uuid        references auth.users(id) on delete set null,
  edited_at    timestamptz not null default now(),
  changes      jsonb       not null
);

-- ============================ INDEXES ============================

create index if not exists items_category_id_idx
  on public.items(category_id);

create index if not exists items_serial_number_idx
  on public.items(serial_number)
  where serial_number is not null;

create index if not exists items_active_idx
  on public.items(created_at desc)
  where deleted_at is null;

create index if not exists borrowings_item_id_active_idx
  on public.borrowings(item_id)
  where returned_at is null;

create index if not exists borrowings_borrower_id_idx
  on public.borrowings(borrower_id);

create index if not exists borrowing_edits_borrowing_id_idx
  on public.borrowing_edits(borrowing_id, edited_at desc);

create index if not exists transactions_occurred_on_idx
  on public.transactions(occurred_on desc);

create index if not exists transactions_type_idx
  on public.transactions(type);

create index if not exists transactions_created_by_idx
  on public.transactions(created_by);

-- ============================ TRIGGERS ============================

drop trigger if exists items_touch_updated_at on public.items;
create trigger items_touch_updated_at
  before update on public.items
  for each row
  execute function public.touch_updated_at();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row
  execute function public.touch_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

drop trigger if exists borrowings_adjust_qty on public.borrowings;
create trigger borrowings_adjust_qty
  after insert or update on public.borrowings
  for each row
  execute function public.borrowings_adjust_item_quantity();

drop trigger if exists items_enforce_admin_delete on public.items;
create trigger items_enforce_admin_delete
  before update of deleted_at on public.items
  for each row
  execute function public.enforce_admin_item_delete();

drop trigger if exists profiles_enforce_admin_role_change on public.profiles;
create trigger profiles_enforce_admin_role_change
  before update of role on public.profiles
  for each row
  execute function public.enforce_admin_role_change();

-- ============================ RLS ============================

alter table public.categories      enable row level security;
alter table public.items           enable row level security;
alter table public.transactions    enable row level security;
alter table public.profiles        enable row level security;
alter table public.borrowings      enable row level security;
alter table public.borrowing_edits enable row level security;

drop policy if exists "Authenticated access"   on public.categories;
drop policy if exists "Categories read"        on public.categories;
drop policy if exists "Categories admin write" on public.categories;

create policy "Categories read" on public.categories
  for select to public
  using ((select auth.role()) = 'authenticated');

create policy "Categories admin write" on public.categories
  for all to public
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated access" on public.items;
create policy "Authenticated access" on public.items
  for all to public
  using ((select auth.role()) = 'authenticated')
  with check ((select auth.role()) = 'authenticated');

drop policy if exists "Authenticated access" on public.transactions;
create policy "Authenticated access" on public.transactions
  for all to public
  using ((select auth.role()) = 'authenticated')
  with check ((select auth.role()) = 'authenticated');

drop policy if exists "Authenticated access" on public.borrowings;
create policy "Authenticated access" on public.borrowings
  for all to public
  using ((select auth.role()) = 'authenticated')
  with check ((select auth.role()) = 'authenticated');

drop policy if exists "Borrowing edits read"   on public.borrowing_edits;
drop policy if exists "Borrowing edits insert" on public.borrowing_edits;

create policy "Borrowing edits read" on public.borrowing_edits
  for select to public
  using ((select auth.role()) = 'authenticated');

create policy "Borrowing edits insert" on public.borrowing_edits
  for insert to public
  with check ((select auth.uid()) = edited_by);

drop policy if exists "Profiles self read"            on public.profiles;
drop policy if exists "Profiles authenticated read"   on public.profiles;
drop policy if exists "Profiles self update"          on public.profiles;
drop policy if exists "Profiles self insert"          on public.profiles;

-- Any signed-in user can read all profile rows (needed for borrower pickers,
-- "Added by" / "Authorized by" displays). Writes stay self-only below.
create policy "Profiles authenticated read" on public.profiles
  for select to public
  using ((select auth.role()) = 'authenticated');

create policy "Profiles self update" on public.profiles
  for update to public
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Profiles self insert" on public.profiles
  for insert to public
  with check ((select auth.uid()) = id);

-- Backfill profiles for any existing auth users
insert into public.profiles (id, email, first_name, last_name)
  select
    id,
    email,
    raw_user_meta_data->>'first_name',
    raw_user_meta_data->>'last_name'
  from auth.users
  on conflict (id) do update
    set email      = excluded.email,
        first_name = excluded.first_name,
        last_name  = excluded.last_name
    where profiles.email      is distinct from excluded.email
       or profiles.first_name is distinct from excluded.first_name
       or profiles.last_name  is distinct from excluded.last_name;
