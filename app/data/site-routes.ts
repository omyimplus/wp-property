/** เส้นทางหน้าเว็บสาธารณะ — ใช้กับ header/footer และลิงก์ภายใน */
export const serviceDropdownItems = [
  { key: 'overview', path: '/services' },
  { key: 'properties', path: '/services/properties' },
  { key: 'loans', path: '/services/loans' },
  { key: 'consign', path: '/consign' },
  { key: 'rent', path: '/rent' },
] as const

export const serviceNavPaths = serviceDropdownItems.map(item => item.path)

/** หน้าอสังหาริมทรัพย์ — highlight เมนู「เช่า-ซื้อ」เท่านั้น */
export const rentBuyNavPaths = ['/services/properties', '/properties'] as const

/** paths ที่ทำให้เมนู「บริการของเรา」active (ไม่รวมอสังหาริมทรัพย์) */
export const serviceNavPathsForParent = serviceDropdownItems
  .filter(item => item.path !== '/services/properties')
  .map(item => item.path)

export const navItems = [
  { key: 'home', path: '/' },
  { key: 'services', path: '/services', children: serviceDropdownItems },
  { key: 'rentBuy', path: '/services/properties' },
  { key: 'about', path: '/about' },
  { key: 'articles', path: '/articles' },
  { key: 'reviews', path: '/reviews' },
  { key: 'contact', path: '/contact' },
] as const

export const footerSitemapItems = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'loanServices', path: '/services' },
  { key: 'properties', path: '/services/properties' },
  { key: 'contact', path: '/contact' },
] as const

export const footerServiceItems = [
  { key: 'properties', path: '/services/properties' },
  { key: 'loans', path: '/services/loans' },
  { key: 'consign', path: '/consign' },
  { key: 'rent', path: '/rent' },
] as const
