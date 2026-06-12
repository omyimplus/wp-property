export { navItems, footerSitemapItems, footerServiceItems } from '~/data/site-routes'

export const heroStats = [
  { valueKey: 'home.hero.statsValues.customers', labelKey: 'home.hero.stats.customers', icon: 'trust' },
  { valueKey: 'home.hero.statsValues.returns', labelKey: 'home.hero.stats.returns', icon: 'returns' },
  { valueKey: 'home.hero.statsValues.approval', labelKey: 'home.hero.stats.approval', icon: 'speed' },
] as const

/** เพิ่มรูปใน array นี้เพื่อเพิ่มสไลด์ — ใส่ path ใต้ /public/images/ */
export const heroSlides = [
  { id: '1', image: '/images/bg-hero.webp' },
] as const

export const services = [
  { key: 'debt', image: '/images/service-1.webp' },
  { key: 'rentBuy', image: '/images/service-2.webp' },
  { key: 'consign', image: '/images/service-3.webp' },
] as const

export const propertyTypeKeys = [
  { key: 'houseTown', image: '/images/icon-property-1.webp' },
  { key: 'townhouse', image: '/images/icon-property-2.webp' },
  { key: 'condo', image: '/images/icon-property-3.webp' },
  { key: 'commercial', image: '/images/icon-property-4.webp' },
  { key: 'apartment', image: '/images/icon-property-5.webp' },
] as const

export const interestingContentItems = [
  { id: '1', image: '/images/content/content-1.png' },
  { id: '2', image: '/images/content/content-2.png' },
  { id: '3', image: '/images/content/content-3.png' },
] as const
