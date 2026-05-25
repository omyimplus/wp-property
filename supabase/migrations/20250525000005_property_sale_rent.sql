-- ขาย / เช่า แยกราคา + มัดจำเช่า (1–6 เดือน)
alter table public.properties
add column if not exists for_sale boolean not null default true,
add column if not exists for_rent boolean not null default false,
add column if not exists sale_price numeric(14, 2),
add column if not exists rent_price numeric(14, 2),
add column if not exists rent_deposit_months int;

-- ย้าย price เดิมไป sale_price
update public.properties
set sale_price = price, for_sale = true
where sale_price is null and price is not null;

alter table public.properties drop column if exists price;

alter table public.properties
drop constraint if exists properties_rent_deposit_months_check;

alter table public.properties
add constraint properties_rent_deposit_months_check
check (rent_deposit_months is null or (rent_deposit_months >= 1 and rent_deposit_months <= 6));

create index if not exists properties_for_sale_idx on public.properties (for_sale) where for_sale = true;
create index if not exists properties_for_rent_idx on public.properties (for_rent) where for_rent = true;
create index if not exists properties_province_idx on public.properties (province);
create index if not exists properties_district_idx on public.properties (district);
create index if not exists properties_subdistrict_idx on public.properties (subdistrict);
