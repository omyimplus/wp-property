-- คอนเทนต์ที่น่าสนใจ (หน้าแรก + หน้ารายละเอียด)

CREATE TYPE public.interesting_content_status AS ENUM ('draft', 'published');

CREATE TABLE public.interesting_content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text,
  body_html text NOT NULL DEFAULT '',
  cover_storage_path text,
  link_url text,
  sort_order int NOT NULL DEFAULT 0,
  status public.interesting_content_status NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX interesting_content_items_status_sort_idx
  ON public.interesting_content_items (status, sort_order, updated_at DESC);

CREATE TRIGGER interesting_content_items_updated_at
BEFORE UPDATE ON public.interesting_content_items
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

ALTER TABLE public.interesting_content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY interesting_content_staff_all
ON public.interesting_content_items
FOR ALL
TO authenticated
USING (public.is_staff_active())
WITH CHECK (public.is_staff_active());

CREATE POLICY interesting_content_public_read
ON public.interesting_content_items
FOR SELECT
TO anon, authenticated
USING (status = 'published');

NOTIFY pgrst, 'reload schema';
