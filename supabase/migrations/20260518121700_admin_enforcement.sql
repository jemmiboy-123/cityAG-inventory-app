-- Step 3 — role-based access enforcement (admin / user)
-- Three things this migration does:
--   1. is_admin() helper for use in policies and triggers
--   2. Trigger blocking non-admins from soft-deleting items
--   3. Trigger blocking non-admins from changing role on profiles
--   4. Categories: admin-only INSERT/UPDATE/DELETE (SELECT stays open)

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

-- =========================================================================
-- Items: only admins may soft-delete (write deleted_at).
-- Non-admins can still edit all other fields.
-- =========================================================================
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

drop trigger if exists items_enforce_admin_delete on public.items;
create trigger items_enforce_admin_delete
    before update of deleted_at on public.items
    for each row
    execute function public.enforce_admin_item_delete();

-- =========================================================================
-- Profiles: only admins may change someone's role.
-- Users can still update their own non-role fields (low_stock_threshold, etc.)
-- =========================================================================
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

drop trigger if exists profiles_enforce_admin_role_change on public.profiles;
create trigger profiles_enforce_admin_role_change
    before update of role on public.profiles
    for each row
    execute function public.enforce_admin_role_change();

-- =========================================================================
-- Categories: admin-only writes. SELECT remains open to authenticated.
-- =========================================================================
drop policy if exists "Authenticated access"  on public.categories;
drop policy if exists "Categories read"       on public.categories;
drop policy if exists "Categories admin write" on public.categories;

create policy "Categories read" on public.categories
    for select to public
    using ((select auth.role()) = 'authenticated');

create policy "Categories admin write" on public.categories
    for all to public
    using (public.is_admin())
    with check (public.is_admin());
