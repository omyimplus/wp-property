-- คำขอสนใจทรัพย์จากเว็บ (ส่งผ่าน Line dialog)

DO $$ BEGIN
  CREATE TYPE public.property_inquiry_status AS ENUM (
    'pending_approval',
    'rejected',
    'completed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.property_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties (id) ON DELETE SET NULL,
  property_code text NOT NULL,
  listing_title text,
  project_name text,
  property_url text,
  customer_name text NOT NULL,
  callback_phone text NOT NULL,
  callback_line text NOT NULL,
  note text,
  status public.property_inquiry_status NOT NULL DEFAULT 'pending_approval',
  created_source public.loan_created_source NOT NULL DEFAULT 'customer_web',
  handled_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  handled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS property_inquiries_status_idx
  ON public.property_inquiries (status);

CREATE INDEX IF NOT EXISTS property_inquiries_property_code_idx
  ON public.property_inquiries (property_code);

CREATE INDEX IF NOT EXISTS property_inquiries_created_at_idx
  ON public.property_inquiries (created_at DESC);

CREATE TRIGGER property_inquiries_updated_at
BEFORE UPDATE ON public.property_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_inquiries_staff_all ON public.property_inquiries
  FOR ALL TO authenticated
  USING (public.is_staff_active())
  WITH CHECK (public.is_staff_active());

NOTIFY pgrst, 'reload schema';
