export { navItems, footerSitemapItems, footerServiceItems } from '~/data/site-routes'

export const heroStats = [
  { valueKey: 'home.hero.statsValues.customers', labelKey: 'home.hero.stats.customers', icon: 'trust' },
  { valueKey: 'home.hero.statsValues.returns', labelKey: 'home.hero.stats.returns', icon: 'returns' },
  { valueKey: 'home.hero.statsValues.approval', labelKey: 'home.hero.stats.approval', icon: 'speed' },
] as const

/** เพิ่มรูปใน array นี้เพื่อเพิ่มสไลด์ — ใส่ path ใต้ /public/images/ */
export const heroSlides = [
  { id: '1', image: '/images/hero-bg-3.webp', mobileImage: '/images/m1.webp', whiteFade: true },
  {
    id: '2',
    image: '/images/hero-bg-2.webp',
    mobileImage: '/images/m2.webp',
    contentKey: 'debt',
    showStats: false,
    imageClass: 'object-cover object-[72%_center] sm:object-[68%_center]',
    altKey: 'home.hero.slides.alt.debt',
  },
  {
    id: '3',
    image: '/images/hero-bg-1.webp',
    mobileImage: '/images/m3.webp',
    contentKey: 'properties',
    showStats: false,
    whiteFade: true,
    altKey: 'home.hero.slides.alt.properties',
  },
] as const

export const services = [
  { key: 'debt', image: '/images/service-bg-1.webp' },
  { key: 'rentBuy', image: '/images/service-bg-2.webp' },
  { key: 'consign', image: '/images/service-bg-3.webp' },
] as const

export const serviceDetailLinks: Record<(typeof services)[number]['key'], string> = {
  debt: '/services/debt',
  rentBuy: '/services/rent-buy',
  consign: '/services/consign',
}

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
