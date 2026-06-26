-- พักอาศัยได้ (จำนวนคน) — ฟอร์มฝากขาย/ฝากเช่า

ALTER TABLE public.property_customers
  ADD COLUMN IF NOT EXISTS max_occupants int;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS max_occupants int;

NOTIFY pgrst, 'reload schema';
