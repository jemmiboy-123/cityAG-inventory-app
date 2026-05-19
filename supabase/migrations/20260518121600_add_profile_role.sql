-- Role-based access: 'admin' or 'user'
-- New signups default to 'user'. First user ever auto-promoted to admin
-- (handles fresh installs without needing the create-admin.mjs script).

alter table public.profiles
    add column if not exists role text not null default 'user';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
    check (role in ('admin', 'user'));

-- Backfill: promote the earliest registered user to admin if no admin exists.
-- Covers anyone who signed up before this migration ran.
update public.profiles
   set role = 'admin'
 where id = (
     select id from public.profiles
      order by created_at asc nulls last
      limit 1
   )
   and not exists (select 1 from public.profiles where role = 'admin');

-- Update handle_new_user so the first signup becomes admin automatically,
-- and every subsequent signup is a regular 'user'.
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
