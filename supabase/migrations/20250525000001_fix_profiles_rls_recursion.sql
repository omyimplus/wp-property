-- แก้ infinite recursion: policy ห้าม query profiles ภายใต้ RLS ของตัวเอง
-- รันใน Supabase SQL Editor ถ้าเจอ error "infinite recursion detected in policy for relation profiles"

create or replace function public.is_staff_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

revoke all on function public.is_staff_admin() from public;
grant execute on function public.is_staff_admin() to authenticated;

drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

create policy "profiles_select_admin"
on public.profiles
for select
to authenticated
using (public.is_staff_admin());

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_staff_admin())
with check (public.is_staff_admin());
