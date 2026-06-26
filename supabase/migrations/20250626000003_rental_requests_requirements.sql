-- ความต้องการทรัพย์ — ฟอร์มสนใจเช่า

ALTER TABLE public.rental_requests
  ADD COLUMN IF NOT EXISTS desired_bedrooms int,
  ADD COLUMN IF NOT EXISTS desired_bathrooms int,
  ADD COLUMN IF NOT EXISTS desired_parking_spaces int,
  ADD COLUMN IF NOT EXISTS lease_duration text,
  ADD COLUMN IF NOT EXISTS max_occupants int;

NOTIFY pgrst, 'reload schema';
