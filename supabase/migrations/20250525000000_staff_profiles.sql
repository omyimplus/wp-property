-- โปรไฟล์พนักงานหลังบ้าน (เชื่อม auth.users)
create type public.staff_role as enum ('employee', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.staff_role not null default 'employee',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

-- ตรวจ admin แบบ security definer (หลีกเลี่ยง RLS recursion บน profiles)
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

-- อ่านโปรไฟล์ตัวเอง
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- แอดมินอ่านโปรไฟล์ทุกคน
create policy "profiles_select_admin"
on public.profiles
for select
to authenticated
using (public.is_staff_admin());

-- แอดมินแก้ไขโปรไฟล์ทุกคน
create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_staff_admin())
with check (public.is_staff_admin());

-- สร้างโปรไฟล์: ทำผ่าน Supabase Dashboard / service role เท่านั้น (ไม่มี policy insert สำหรับ client)
