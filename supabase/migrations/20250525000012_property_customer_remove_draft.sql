-- ลบสถานะฉบับร่างออกจากฝากขาย (property_customers)

UPDATE public.property_customers
SET status = 'pending_approval'
WHERE status::text = 'draft';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'property_customer_status' AND e.enumlabel = 'draft'
  ) THEN
    CREATE TYPE public.property_customer_status_new AS ENUM (
      'pending_approval',
      'rejected',
      'approved'
    );

    ALTER TABLE public.property_customers
      ALTER COLUMN status DROP DEFAULT;

    ALTER TABLE public.property_customers
      ALTER COLUMN status TYPE public.property_customer_status_new
      USING (status::text::public.property_customer_status_new);

    ALTER TABLE public.property_customers
      ALTER COLUMN status SET DEFAULT 'pending_approval';

    DROP TYPE public.property_customer_status;

    ALTER TYPE public.property_customer_status_new RENAME TO property_customer_status;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
