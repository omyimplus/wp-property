/** ลิงก์โซเชียล — ใส่ URL เต็มเมื่อมี (ว่าง = แสดงชื่ออย่างเดียว) */
export const siteSocialUrls = {
  facebook: '',
  instagram: '',
  youtube: '',
  tiktok: '',
} as const

export type SiteSocialKey = keyof typeof siteSocialUrls | 'line'
