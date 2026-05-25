-- สำหรับโปรเจกต์ที่รัน migration เก่าแล้ว (มี category / subtype)
-- ข้ามได้ถ้ารัน 20250525000002 เวอร์ชันใหม่โดยตรง

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'properties' and column_name = 'category'
  ) then
    create type public.property_type as enum ('house', 'condo', 'apartment', 'commercial', 'townhouse');

    alter table public.properties add column if not exists property_type public.property_type;

    update public.properties
    set property_type = case
      when subtype::text in ('house', 'condo', 'apartment', 'commercial', 'townhouse') then subtype::text::public.property_type
      else 'house'::public.property_type
    end
    where property_type is null;

    alter table public.properties alter column property_type set not null;
    alter table public.properties alter column property_type set default 'house';

    alter table public.properties drop column if exists category;
    alter table public.properties drop column if exists subtype;

    drop type if exists public.property_category;
    drop type if exists public.property_subtype;

    drop index if exists properties_category_idx;
    create index if not exists properties_type_idx on public.properties (property_type);
  end if;
end $$;
