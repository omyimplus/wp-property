-- ฟอร์มรวมหนี้: อายุ, บูโร, ทำเลที่สนใจ — ปรับฟิลด์ติดต่อ

ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS age int,
  ADD COLUMN IF NOT EXISTS bureau_record text,
  ADD COLUMN IF NOT EXISTS preferred_location text;

ALTER TABLE public.loan_applications
  ALTER COLUMN creditor_count DROP NOT NULL,
  ALTER COLUMN callback_line DROP NOT NULL;

ALTER TABLE public.loan_applications
  DROP CONSTRAINT IF EXISTS loan_applications_age_check;

ALTER TABLE public.loan_applications
  ADD CONSTRAINT loan_applications_age_check
    CHECK (age IS NULL OR (age >= 18 AND age <= 120));

NOTIFY pgrst, 'reload schema';
