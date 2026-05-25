-- ฝากขายทรัพย์แยกจาก properties — ยังไม่มีรหัสทรัพย์จนกว่าจะอนุมัติ

DO $$ BEGIN
  CREATE TYPE public.property_customer_status AS ENUM (
    'pending_approval',
    'rejected',
    'approved'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.property_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_line text NOT NULL,
  listing_title text,
  project_name text,
  property_type public.property_type NOT NULL DEFAULT 'house',
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
  for_sale boolean NOT NULL DEFAULT true,
  for_rent boolean NOT NULL DEFAULT false,
  sale_price numeric(14, 2),
  rent_price numeric(14, 2),
  rent_deposit_months int,
  status public.property_customer_status NOT NULL DEFAULT 'pending_approval',
  property_id uuid REFERENCES public.properties (id) ON DELETE SET NULL,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT property_customers_rent_deposit_months_check
    CHECK (rent_deposit_months IS NULL OR (rent_deposit_months >= 1 AND rent_deposit_months <= 6))
);

CREATE INDEX IF NOT EXISTS property_customers_status_idx
  ON public.property_customers (status);
CREATE INDEX IF NOT EXISTS property_customers_property_id_idx
  ON public.property_customers (property_id)
  WHERE property_id IS NOT NULL;

CREATE TRIGGER property_customers_updated_at
BEFORE UPDATE ON public.property_customers
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

CREATE TABLE IF NOT EXISTS public.property_customer_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_customer_id uuid NOT NULL REFERENCES public.property_customers (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS property_customer_images_pc_idx
  ON public.property_customer_images (property_customer_id, sort_order);

ALTER TABLE public.property_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_customer_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_customers_staff_all ON public.property_customers
  FOR ALL TO authenticated
  USING (public.is_staff_active())
  WITH CHECK (public.is_staff_active());

CREATE POLICY property_customer_images_staff_all ON public.property_customer_images
  FOR ALL TO authenticated
  USING (public.is_staff_active())
  WITH CHECK (public.is_staff_active());

-- ย้ายรายการฝากขายเดิมที่อยู่ใน properties (ถ้ามี property_source = customer_web)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'property_source'
  ) THEN
    INSERT INTO public.property_customers (
      customer_name, customer_phone, customer_line,
      listing_title, project_name, property_type,
      address_line, house_number, soi, moo, road,
      subdistrict, district, province, facing_direction,
      floors_total, floor_number, bathrooms, bedrooms, parking_spaces,
      land_area_sqm, usable_area_sqm, property_age_years,
      for_sale, for_rent, sale_price, rent_price, rent_deposit_months,
      status, property_id, approved_at, created_by, created_at, updated_at
    )
    SELECT
      '—', '—', '—',
      p.listing_title, p.project_name, p.property_type,
      p.address_line, p.house_number, p.soi, p.moo, p.road,
      p.subdistrict, p.district, p.province, p.facing_direction,
      p.floors_total, p.floor_number, p.bathrooms, p.bedrooms, p.parking_spaces,
      p.land_area_sqm, p.usable_area_sqm, p.property_age_years,
      p.for_sale, p.for_rent, p.sale_price, p.rent_price, p.rent_deposit_months,
      CASE
        WHEN p.status::text = 'published' THEN 'approved'::public.property_customer_status
        WHEN p.status::text = 'rejected' THEN 'rejected'::public.property_customer_status
        ELSE 'pending_approval'::public.property_customer_status
      END,
      p.id,
      CASE WHEN p.status::text = 'published' THEN p.updated_at ELSE NULL END,
      p.created_by, p.created_at, p.updated_at
    FROM public.properties p
    WHERE p.property_source = 'customer_web'
      AND NOT EXISTS (
        SELECT 1 FROM public.property_customers pc WHERE pc.property_id = p.id
      );
  END IF;
END $$;

-- ลบคอลัมน์ลูกค้าออกจาก properties (ข้อมูลย้ายแล้ว)
ALTER TABLE public.properties
  DROP COLUMN IF EXISTS customer_name,
  DROP COLUMN IF EXISTS customer_phone,
  DROP COLUMN IF EXISTS customer_line;

-- รีเฟรช schema cache ของ PostgREST (แก้ "Could not find table in schema cache")
NOTIFY pgrst, 'reload schema';
