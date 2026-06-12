-- รีวิวจากลูกค้า (รูปการ์ดเต็มใบ)

CREATE TYPE public.customer_review_status AS ENUM ('draft', 'published');

CREATE TABLE public.customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_storage_path text,
  sort_order int NOT NULL DEFAULT 0,
  status public.customer_review_status NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX customer_reviews_status_sort_idx
  ON public.customer_reviews (status, sort_order, updated_at DESC);

CREATE TRIGGER customer_reviews_updated_at
BEFORE UPDATE ON public.customer_reviews
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_reviews_staff_all
ON public.customer_reviews
FOR ALL
TO authenticated
USING (public.is_staff_active())
WITH CHECK (public.is_staff_active());

CREATE POLICY customer_reviews_public_read
ON public.customer_reviews
FOR SELECT
TO anon, authenticated
USING (status = 'published');

NOTIFY pgrst, 'reload schema';
