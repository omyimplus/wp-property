-- อนุญาตวิดีโอ Reels + rich text ใน bucket property-images
-- (แก้กรณี migration 20250525000017 ยังไม่ถูก apply — bucket เหลือแค่ image/webp)

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ],
  file_size_limit = 52428800
WHERE id = 'property-images';

NOTIFY pgrst, 'reload schema';
