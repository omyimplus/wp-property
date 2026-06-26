-- ความต้องการทรัพย์ — ฟอร์มสนใจซื้อ

ALTER TABLE public.sale_requests
  ADD COLUMN IF NOT EXISTS desired_bedrooms int,
  ADD COLUMN IF NOT EXISTS desired_bathrooms int,
  ADD COLUMN IF NOT EXISTS desired_parking_spaces int,
  ADD COLUMN IF NOT EXISTS desired_move_in text,
  ADD COLUMN IF NOT EXISTS max_occupants int;

NOTIFY pgrst, 'reload schema';
