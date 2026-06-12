-- รองรับวิดีโอใน body editor (รูปยังเป็น WebP ฝั่ง client)
update storage.buckets
set
  allowed_mime_types = array['image/webp', 'video/mp4', 'video/webm'],
  file_size_limit = 52428800
where id = 'property-images';
