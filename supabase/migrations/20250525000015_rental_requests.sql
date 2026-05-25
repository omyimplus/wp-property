-- คำขอเช่าทรัพย์ (แยกจาก properties / loan_applications)

DO $$ BEGIN
  CREATE TYPE public.rental_request_status AS ENUM (
    'pending_approval',
    'rejected',
    'completed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.rental_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  callback_phone text NOT NULL,
  callback_line text NOT NULL,
  desired_province text,
  desired_district text,
  desired_subdistrict text,
  desired_area_detail text,
  rent_budget_min numeric(14, 2) NOT NULL,
  rent_budget_max numeric(14, 2) NOT NULL,
  status public.rental_request_status NOT NULL DEFAULT 'pending_approval',
  created_source public.loan_created_source NOT NULL DEFAULT 'admin',
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  handled_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  handled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rental_requests_rent_budget_check
    CHECK (rent_budget_min > 0 AND rent_budget_max >= rent_budget_min)
);

CREATE INDEX IF NOT EXISTS rental_requests_status_idx
  ON public.rental_requests (status);

CREATE TRIGGER rental_requests_updated_at
BEFORE UPDATE ON public.rental_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY rental_requests_staff_all ON public.rental_requests
  FOR ALL TO authenticated
  USING (public.is_staff_active())
  WITH CHECK (public.is_staff_active());

NOTIFY pgrst, 'reload schema';
