/** เส้นทางหน้าเว็บสาธารณะ — ใช้กับ header/footer และลิงก์ภายใน */
export const navItems = [
  { key: 'home', path: '/' },
  { key: 'services', path: '/services' },
  { key: 'consignBuy', path: '/consign' },
  { key: 'about', path: '/about' },
  { key: 'articles', path: '/articles' },
  { key: 'reviews', path: '/reviews' },
  { key: 'contact', path: '/contact' },
] as const

export const footerSitemapItems = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'loanServices', path: '/services' },
  { key: 'properties', path: '/properties' },
  { key: 'contact', path: '/contact' },
] as const

export const footerServiceItems = [
  { key: 'properties', path: '/properties' },
  { key: 'loans', path: '/services/loans' },
  { key: 'consign', path: '/consign' },
  { key: 'rent', path: '/rent' },
] as const

/** บทความ mock — slug สำหรับหน้ารายละเอียด */
export const siteArticles = [
  { id: '1', slug: 'quality-debt', image: '/images/content/content-1.png' },
  { id: '2', slug: 'debt-consolidation-guide', image: '/images/content/content-1.png' },
  { id: '3', slug: 'ltv-home-loan', image: '/images/content/content-1.png' },
] as const

export type SiteArticle = (typeof siteArticles)[number]
