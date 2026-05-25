-- ตรวจว่า user ใน Auth มีโปรไฟล์ครบหรือไม่ (รันใน SQL Editor)
-- แทนอีเมลด้านล่างด้วยอีเมลที่ใช้ login

select
  u.id as auth_user_id,
  u.email as auth_email,
  p.id as profile_id,
  p.role,
  p.is_active,
  case
    when p.id is null then 'ไม่มีแถวใน profiles — ต้อง insert'
    when p.is_active = false then 'มีโปรไฟล์แต่ถูกระงับ'
    else 'พร้อม login ได้'
  end as status
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'admin@yourcompany.com';

-- ถ้าไม่มี profile ให้ insert (แทน UUID และอีเมล):
-- insert into public.profiles (id, email, full_name, role, is_active)
-- values ('auth_user_id จากผลด้านบน', 'admin@yourcompany.com', 'ชื่อ', 'admin', true);
