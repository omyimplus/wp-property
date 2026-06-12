-- รูปหลักแนวนอน (หน้ารายละเอียดคอนเทนต์)
ALTER TABLE public.interesting_content_items
  ADD COLUMN IF NOT EXISTS hero_storage_path text;

NOTIFY pgrst, 'reload schema';
