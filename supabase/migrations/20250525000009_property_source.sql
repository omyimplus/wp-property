-- แหล่งที่มาทรัพย์: สร้างจากระบบหลังบ้าน หรือลูกค้าฝากขายผ่านเว็บ

DO $$ BEGIN
  CREATE TYPE property_source AS ENUM ('system', 'customer_web');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS property_source property_source NOT NULL DEFAULT 'system';

COMMENT ON COLUMN public.properties.property_source IS
  'system = สร้างจากระบบ, customer_web = ลูกค้าฝากขายผ่านเว็บ';

CREATE INDEX IF NOT EXISTS idx_properties_property_source
  ON public.properties (property_source);
