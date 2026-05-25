-- สินเชื่อ: รายละเอียดที่อยู่, อาชีพแบบเลือก, แหล่งที่มา, ผู้จัดการสถานะ

DO $$ BEGIN
  CREATE TYPE public.loan_created_source AS ENUM ('admin', 'customer_web');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS residence_detail text,
  ADD COLUMN IF NOT EXISTS occupation_kind text,
  ADD COLUMN IF NOT EXISTS occupation_other text,
  ADD COLUMN IF NOT EXISTS created_source public.loan_created_source,
  ADD COLUMN IF NOT EXISTS handled_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS handled_at timestamptz;

UPDATE public.loan_applications
SET
  occupation_kind = COALESCE(occupation_kind, 'other'),
  occupation_other = COALESCE(
    occupation_other,
    NULLIF(trim(current_occupation), '')
  ),
  created_source = COALESCE(
    created_source,
    CASE
      WHEN created_by IS NULL THEN 'customer_web'::public.loan_created_source
      ELSE 'admin'::public.loan_created_source
    END
  )
WHERE occupation_kind IS NULL
   OR created_source IS NULL;

ALTER TABLE public.loan_applications
  ALTER COLUMN occupation_kind SET DEFAULT 'other',
  ALTER COLUMN occupation_kind SET NOT NULL,
  ALTER COLUMN created_source SET DEFAULT 'admin',
  ALTER COLUMN created_source SET NOT NULL;

ALTER TABLE public.loan_applications
  DROP COLUMN IF EXISTS current_occupation;

NOTIFY pgrst, 'reload schema';
