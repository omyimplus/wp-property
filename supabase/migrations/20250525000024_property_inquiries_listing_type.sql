-- แยกประเภทคำขอสนใจทรัพย์: ขาย / เช่า

DO $$ BEGIN
  CREATE TYPE public.property_inquiry_listing_type AS ENUM ('sale', 'rent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.property_inquiries
  ADD COLUMN IF NOT EXISTS listing_type public.property_inquiry_listing_type;

UPDATE public.property_inquiries
SET listing_type = 'sale'
WHERE listing_type IS NULL;

ALTER TABLE public.property_inquiries
  ALTER COLUMN listing_type SET DEFAULT 'sale';

ALTER TABLE public.property_inquiries
  ALTER COLUMN listing_type SET NOT NULL;

CREATE INDEX IF NOT EXISTS property_inquiries_listing_type_status_idx
  ON public.property_inquiries (listing_type, status);

NOTIFY pgrst, 'reload schema';
