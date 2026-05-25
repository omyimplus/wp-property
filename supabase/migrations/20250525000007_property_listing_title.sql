alter table public.properties
add column if not exists listing_title text;

comment on column public.properties.listing_title is 'หัวข้อประกาศ (แสดงหลังรหัสทรัพย์)';
