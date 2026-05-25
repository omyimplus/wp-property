-- เพิ่มประเภททรัพย์ "บ้าน" (house) ใน enum
alter type public.property_type add value if not exists 'house' before 'condo';
