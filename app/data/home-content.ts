export const navItems = [
  { key: 'home', hash: null },
  { key: 'services', hash: 'services' },
  { key: 'consignBuy', hash: 'consign-buy' },
  { key: 'about', hash: 'about' },
  { key: 'articles', hash: 'articles' },
  { key: 'reviews', hash: 'reviews' },
  { key: 'contact', hash: 'contact' },
] as const

export const footerSitemapItems = [
  { key: 'home', hash: null },
  { key: 'about', hash: 'about' },
  { key: 'loanServices', hash: 'services' },
  { key: 'properties', hash: 'properties' },
  { key: 'contact', hash: 'contact' },
] as const

export const footerServiceItems = [
  { key: 'properties', hash: 'properties' },
  { key: 'loans', hash: 'services' },
  { key: 'consign', hash: 'consign-buy' },
  { key: 'rent', hash: 'properties' },
] as const

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

const mockListingImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80'

const mockListing = {
  code: 'WP0001',
  price: '2,200,000',
  beds: 2,
  baths: 2,
  parking: 2,
  image: mockListingImage,
} as const

export const recommendedSaleListings = [
  { id: 'sale-1', ...mockListing },
  { id: 'sale-2', ...mockListing },
  { id: 'sale-3', ...mockListing },
  { id: 'sale-4', ...mockListing },
] as const

export const recommendedRentListings = [
  { id: 'rent-1', ...mockListing },
  { id: 'rent-2', ...mockListing },
  { id: 'rent-3', ...mockListing },
  { id: 'rent-4', ...mockListing },
] as const

export const interestingContentItems = [
  { id: '1', image: '/images/content/content-1.png' },
  { id: '2', image: '/images/content/content-2.png' },
  { id: '3', image: '/images/content/content-3.png' },
] as const

export const articles = [
  { id: '1', image: '/images/content/content-1.png' },
  { id: '2', image: '/images/content/content-1.png' },
  { id: '3', image: '/images/content/content-1.png' },
] as const

/** ใส่ thumbnail + url TikTok/Reels ใน array นี้ */
export const reels = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=540&q=80',
    url: '',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=540&q=80',
    url: '',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=540&q=80',
    url: '',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=540&q=80',
    url: '',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=540&q=80',
    url: '',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=540&q=80',
    url: '',
  },
] as const

/** ใส่รูปการ์ดรีวิวเต็มใบใน array นี้ */
export const reviews = [
  { id: '1', image: '/images/content/content-1.png' },
  { id: '2', image: '/images/content/content-2.png' },
  { id: '3', image: '/images/content/content-3.png' },
  { id: '4', image: '/images/service-1.webp' },
  { id: '5', image: '/images/service-2.webp' },
] as const
