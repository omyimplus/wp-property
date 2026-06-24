-- สิ่งอำนวยความสะดวกในห้อง/ทรัพย์, ความสะดวกโดยรอบ, รายละเอียดโครงการ

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS facilities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nearby_facilities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS project_description text;

ALTER TABLE public.property_customers
  ADD COLUMN IF NOT EXISTS facilities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS nearby_facilities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS project_description text;
