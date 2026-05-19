-- Add email to profiles so the frontend can list users without querying auth.users
-- (Supabase doesn't expose auth.users via PostgREST for security.)

alter table public.profiles
    add column if not exists email text;

-- Backfill from auth.users for any existing profiles
update public.profiles p
   set email = u.email
  from auth.users u
 where p.id = u.id
   and p.email is null;

-- Rewrite handle_new_user to also capture the email at signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email)
      values (new.id, new.email)
      on conflict (id) do update
        set email = excluded.email
        where profiles.email is distinct from excluded.email;
    return new;
end;
$$;
