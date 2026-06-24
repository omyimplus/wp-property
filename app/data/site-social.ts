/** ลิงก์โซเชียล — ใส่ URL เต็มเมื่อมี (ว่าง = แสดงไอคอน disabled) */
export const siteSocialUrls = {
  facebook: 'https://www.facebook.com/wp.propertyofficial/',
  instagram: 'https://www.instagram.com/property.wp/',
  line: 'https://lin.ee/Q3AKaTR',
  youtube: 'https://www.youtube.com/@wp-landproperty',
  tiktok: 'https://www.tiktok.com/@wp_property',
} as const

export type SiteSocialKey = keyof typeof siteSocialUrls
