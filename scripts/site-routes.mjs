/** หน้า public สำหรับ smoke test */
export const PUBLIC_PAGE_ROUTES = [
  '/',
  '/about',
  '/services',
  '/services/properties',
  '/services/debt',
  '/services/rent-buy',
  '/services/consign',
  '/services/loans',
  '/consign',
  '/rent',
  '/buy',
  '/contact',
  '/articles',
  '/reviews',
  '/interesting-content',
  '/privacy',
  '/terms',
  '/properties',
  '/en',
  '/en/about',
  '/en/services',
  '/en/services/properties',
  '/en/services/debt',
  '/en/services/rent-buy',
  '/en/services/consign',
  '/en/services/loans',
  '/en/consign',
  '/en/rent',
  '/en/buy',
  '/en/contact',
  '/en/articles',
  '/en/reviews',
  '/en/interesting-content',
  '/en/properties',
]

/** หน้า admin (list + create) — edit จะ discover จาก API หลัง login */
export const ADMIN_PAGE_ROUTES = [
  { path: '/admin', title: 'แดชบอร์ด' },
  { path: '/admin/loans', title: 'สินเชื่อ' },
  { path: '/admin/loans/create', title: 'รับคำขอสินเชื่อ' },
  { path: '/admin/rentals', title: 'สนใจเช่า' },
  { path: '/admin/rentals/create', title: 'รับคำขอสนใจเช่า' },
  { path: '/admin/sales', title: 'สนใจซื้อ' },
  { path: '/admin/sales/create', title: 'รับคำขอสนใจซื้อ' },
  { path: '/admin/consignments', title: 'ฝากขายทรัพย์' },
  { path: '/admin/consignments/create', title: 'รับฝากขายทรัพย์' },
  { path: '/admin/properties', title: 'อสังหาฯ' },
  { path: '/admin/properties/create', title: 'เพิ่มอสังหาฯ' },
  { path: '/admin/property-inquiries/sale', title: null },
  { path: '/admin/property-inquiries/rent', title: null },
  { path: '/admin/interesting-content', title: 'คอนเทนต์ที่น่าสนใจ' },
  { path: '/admin/interesting-content/create', title: 'เพิ่มคอนเทนต์' },
  { path: '/admin/articles', title: 'บทความ' },
  { path: '/admin/articles/create', title: 'เพิ่มบทความ' },
  { path: '/admin/reels', title: 'คลิปที่น่าสนใจ' },
  { path: '/admin/reels/create', title: 'เพิ่มคลิป' },
  { path: '/admin/customer-reviews', title: 'รีวิวจากลูกค้า' },
  { path: '/admin/customer-reviews/create', title: 'เพิ่มรีวิว' },
  { path: '/admin/users', title: 'ผู้ใช้งาน', allowRedirectTo: '/admin' },
]

/** GET API สาธารณะ */
export const PUBLIC_API_ROUTES = [
  { path: '/api/properties', expectJson: true },
  { path: '/api/articles', expectJson: true },
  { path: '/api/reels', expectJson: true },
  { path: '/api/customer-reviews', expectJson: true },
  { path: '/api/interesting-content', expectJson: true },
]

/** GET API หลังบ้าน (ต้อง login) */
export const ADMIN_API_ROUTES = [
  { path: '/api/admin/health', expectJson: true, checkOk: true },
  { path: '/api/admin/dashboard/summary', expectJson: true },
  { path: '/api/admin/properties', expectJson: true },
  { path: '/api/admin/loans', expectJson: true },
  { path: '/api/admin/rentals', expectJson: true },
  { path: '/api/admin/sales', expectJson: true },
  { path: '/api/admin/consignments', expectJson: true },
  { path: '/api/admin/property-inquiries', expectJson: true },
  { path: '/api/admin/interesting-content', expectJson: true },
  { path: '/api/admin/articles', expectJson: true },
  { path: '/api/admin/reels', expectJson: true },
  { path: '/api/admin/customer-reviews', expectJson: true },
  { path: '/api/admin/users', expectJson: true, allow403: true },
]

/** ใช้ discover หน้า edit จากรายการแรกของแต่ละ module */
export const ADMIN_EDIT_DISCOVERY = [
  { listPath: '/api/admin/properties', itemsKey: 'properties', idKey: 'id', editPath: (id) => `/admin/properties/${id}/edit` },
  { listPath: '/api/admin/loans', itemsKey: 'loans', idKey: 'id', editPath: (id) => `/admin/loans/${id}/edit` },
  { listPath: '/api/admin/rentals', itemsKey: 'rentals', idKey: 'id', editPath: (id) => `/admin/rentals/${id}/edit` },
  { listPath: '/api/admin/sales', itemsKey: 'sales', idKey: 'id', editPath: (id) => `/admin/sales/${id}/edit` },
  { listPath: '/api/admin/consignments', itemsKey: 'consignments', idKey: 'id', editPath: (id) => `/admin/consignments/${id}/edit` },
  { listPath: '/api/admin/interesting-content', itemsKey: 'items', idKey: 'id', editPath: (id) => `/admin/interesting-content/${id}/edit` },
  { listPath: '/api/admin/articles', itemsKey: 'items', idKey: 'id', editPath: (id) => `/admin/articles/${id}/edit` },
  { listPath: '/api/admin/reels', itemsKey: 'items', idKey: 'id', editPath: (id) => `/admin/reels/${id}/edit` },
  { listPath: '/api/admin/customer-reviews', itemsKey: 'items', idKey: 'id', editPath: (id) => `/admin/customer-reviews/${id}/edit` },
]

export const PUBLIC_META_ROUTES = [
  '/robots.txt',
  '/sitemap.xml',
]
