-- พนักงานที่ active (employee / admin)
create or replace function public.is_staff_active()
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
      and is_active = true
  );
$$;

revoke all on function public.is_staff_active() from public;
grant execute on function public.is_staff_active() to authenticated;

-- อสังหาริมทรัพย์
create type public.property_type as enum ('house', 'condo', 'apartment', 'commercial', 'townhouse');
create type public.property_status as enum ('draft', 'pending_approval', 'published');

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  property_code text not null unique,
  project_name text,
  property_type public.property_type not null default 'house',
  address_line text,
  house_number text,
  soi text,
  moo text,
  road text,
  subdistrict text,
  district text,
  province text,
  facing_direction text,
  floors_total int,
  floor_number int,
  bathrooms int,
  bedrooms int,
  parking_spaces int,
  land_area_sqm numeric(12, 2),
  usable_area_sqm numeric(12, 2),
  property_age_years int,
  for_sale boolean not null default true,
  for_rent boolean not null default false,
  sale_price numeric(14, 2),
  rent_price numeric(14, 2),
  rent_deposit_months int,
  status public.property_status not null default 'draft',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_status_idx on public.properties (status);
create index properties_type_idx on public.properties (property_type);

alter table public.properties
add constraint properties_rent_deposit_months_check
check (rent_deposit_months is null or (rent_deposit_months >= 1 and rent_deposit_months <= 6));

create trigger properties_updated_at
before update on public.properties
for each row
execute function public.set_profiles_updated_at();

-- รูปภาพทรัพย์ (หลายรูปต่อ 1 property)
create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index property_images_property_idx on public.property_images (property_id, sort_order);

alter table public.properties enable row level security;
alter table public.property_images enable row level security;

create policy "properties_staff_all"
on public.properties
for all
to authenticated
using (public.is_staff_active())
with check (public.is_staff_active());

create policy "properties_public_read"
on public.properties
for select
to anon, authenticated
using (status = 'published');

create policy "property_images_staff_all"
on public.property_images
for all
to authenticated
using (
  public.is_staff_active()
  and exists (
    select 1 from public.properties p
    where p.id = property_id
  )
)
with check (
  public.is_staff_active()
  and exists (
    select 1 from public.properties p
    where p.id = property_id
  )
);

create policy "property_images_public_read"
on public.property_images
for select
to anon, authenticated
using (
  exists (
    select 1 from public.properties p
    where p.id = property_id and p.status = 'published'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "property_images_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-images'
  and public.is_staff_active()
);

create policy "property_images_storage_select"
on storage.objects
for select
to public
using (bucket_id = 'property-images');

create policy "property_images_storage_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-images'
  and public.is_staff_active()
);

create policy "property_images_storage_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-images'
  and public.is_staff_active()
);
