-- คลิปที่น่าสนใจ (Reels หน้าแรก)

CREATE TYPE public.reel_status AS ENUM ('draft', 'published');

CREATE TABLE public.reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_storage_path text,
  video_storage_path text,
  link_url text,
  sort_order int NOT NULL DEFAULT 0,
  status public.reel_status NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reels_status_sort_idx
  ON public.reels (status, sort_order, updated_at DESC);

CREATE TRIGGER reels_updated_at
BEFORE UPDATE ON public.reels
FOR EACH ROW
EXECUTE FUNCTION public.set_profiles_updated_at();

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY reels_staff_all
ON public.reels
FOR ALL
TO authenticated
USING (public.is_staff_active())
WITH CHECK (public.is_staff_active());

CREATE POLICY reels_public_read
ON public.reels
FOR SELECT
TO anon, authenticated
USING (status = 'published');

NOTIFY pgrst, 'reload schema';
