-- อัปโหลดเฉพาะ WebP หลังปรับขนาดฝั่ง client
update storage.buckets
set
  allowed_mime_types = array['image/webp'],
  file_size_limit = 5242880
where id = 'property-images';
