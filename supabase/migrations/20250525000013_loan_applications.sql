-- คำขอสินเชื่อ (แยกจาก properties / property_customers)

DO $$ BEGIN
  CREATE TYPE public.loan_application_status AS ENUM (
    'pending_approval',
    'rejected',
    'completed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  callback_phone text NOT NULL,
  callback_line text NOT NULL,
  debt_amount numeric(14, 2) NOT NULL,
  creditor_count int NOT NULL,
  residence_province text,
  residence_district text,
  residence_subdistrict text,
  monthly_income numeric(14, 2) NOT NULL,
  current_occupation text NOT NULL,
  status public.loan_application_status NOT NULL DEFAULT 'pending_approval',
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT loan_applications_creditor_count_check
    CHECK (creditor_count >= 1 AND creditor_count <= 99),
  CONSTRAINT loan_applications_debt_amount_check
    CHECK (debt_amount > 0),
  CONSTRAINT loan_applications_monthly_income_check
    CHECK (monthly_income > 0)
);

CREATE INDEX IF NOT EXISTS loan_applications_status_idx
  ON public.loan_applications (status);

CREATE TRIGGER loan_applications_updated_at
BEFORE UPDATE ON public.loan_applications
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY loan_applications_staff_all ON public.loan_applications
  FOR ALL TO authenticated
  USING (public.is_staff_active())
  WITH CHECK (public.is_staff_active());

NOTIFY pgrst, 'reload schema';
