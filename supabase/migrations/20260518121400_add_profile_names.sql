-- Surface first_name / last_name from auth.users.raw_user_meta_data
-- so the frontend can show real names instead of emails in audit columns.

alter table public.profiles
    add column if not exists first_name text;

alter table public.profiles
    add column if not exists last_name text;

-- Backfill from existing auth users
update public.profiles p
   set first_name = (u.raw_user_meta_data->>'first_name'),
       last_name  = (u.raw_user_meta_data->>'last_name')
  from auth.users u
 where p.id = u.id
   and (p.first_name is null or p.last_name is null);

-- Rewrite handle_new_user to capture names on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, first_name, last_name)
      values (
          new.id,
          new.email,
          new.raw_user_meta_data->>'first_name',
          new.raw_user_meta_data->>'last_name'
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
