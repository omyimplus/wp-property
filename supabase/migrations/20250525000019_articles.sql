-- บทความ (หน้าบ้าน /articles + หลังบ้าน)

CREATE TYPE public.article_status AS ENUM ('draft', 'published');

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text,
  body_html text NOT NULL DEFAULT '',
  cover_storage_path text,
  sort_order int NOT NULL DEFAULT 0,
  status public.article_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT articles_slug_unique UNIQUE (slug)
);

CREATE INDEX articles_status_sort_idx
  ON public.articles (status, sort_order, updated_at DESC);

CREATE TRIGGER articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY articles_staff_all
ON public.articles
FOR ALL
TO authenticated
USING (public.is_staff_active())
WITH CHECK (public.is_staff_active());

CREATE POLICY articles_public_read
ON public.articles
FOR SELECT
TO anon, authenticated
USING (status = 'published');

NOTIFY pgrst, 'reload schema';
