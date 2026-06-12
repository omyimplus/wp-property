-- แก้ bucket property-images ให้รองรับวิดีโอ Reels (รันใน SQL Editor ได้ทันที)
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
