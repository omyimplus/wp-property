// https://nuxt.com/docs/api/configuration/nuxt-config

const noCacheHtml = { 'cache-control': 'private, no-cache' } as const
const noStore = { 'cache-control': 'no-store' } as const
const staticPageCache = { 'cache-control': 'public, max-age=3600, s-maxage=3600' } as const

/** หน้าที่ดึงข้อมูลจาก API — SSR + ไม่ให้ browser/proxy เก็บ HTML */
const dynamicPage = { ssr: true, headers: noCacheHtml } as const

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  runtimeConfig: {
    supabase: {
      secretKey: '',
      serviceKey: '',
    },
    lineNotifyToken: process.env.NUXT_LINE_NOTIFY_TOKEN || '',
    public: {
      lineOaId: process.env.NUXT_PUBLIC_LINE_OA_ID || 'wpproperty',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://wplandproperty.com',
    },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@nuxtjs/i18n', '@nuxt/image'],

  image: {
    format: ['webp'],
    quality: 80,
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
  },

  routeRules: {
    '/': dynamicPage,
    '/properties': dynamicPage,
    '/properties/**': dynamicPage,
    '/services/properties': dynamicPage,
    '/rent': dynamicPage,
    '/articles': dynamicPage,
    '/articles/**': dynamicPage,
    '/reviews': dynamicPage,
    '/interesting-content': dynamicPage,
    '/interesting-content/**': dynamicPage,
    '/en': dynamicPage,
    '/en/properties': dynamicPage,
    '/en/properties/**': dynamicPage,
    '/en/services/properties': dynamicPage,
    '/en/rent': dynamicPage,
    '/en/articles': dynamicPage,
    '/en/articles/**': dynamicPage,
    '/en/reviews': dynamicPage,
    '/en/interesting-content': dynamicPage,
    '/en/interesting-content/**': dynamicPage,
    '/about': { prerender: true, headers: staticPageCache },
    '/services': { prerender: true, headers: staticPageCache },
    '/consign': { prerender: true, headers: staticPageCache },
    '/contact': { prerender: true, headers: staticPageCache },
    '/privacy': { prerender: true, headers: staticPageCache },
    '/terms': { prerender: true, headers: staticPageCache },
    '/en/about': { prerender: true, headers: staticPageCache },
    '/en/services': { prerender: true, headers: staticPageCache },
    '/en/consign': { prerender: true, headers: staticPageCache },
    '/en/contact': { prerender: true, headers: staticPageCache },
    '/en/privacy': { prerender: true, headers: staticPageCache },
    '/en/terms': { prerender: true, headers: staticPageCache },
    '/admin/**': { robots: false, headers: noStore },
    '/api/**': { headers: noStore },
    '/sitemap.xml': { headers: staticPageCache },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#011f49' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/webp', href: '/images/fav.webp' },
        { rel: 'apple-touch-icon', href: '/images/fav.webp' },
      ],
    },
  },

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://wplandproperty.com',
    locales: [
      { code: 'th', language: 'th-TH', name: 'ไทย', file: 'th.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'th',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    lazy: true,
    // ปิด auto-detect — กัน hydration mismatch (SSR/prerender เป็น defaultLocale, client เปลี่ยนภาษาก่อน hydrate)
    // ผู้ใช้เลือกภาษาเองจาก SiteLocaleSwitcher → URL /en/...
    detectBrowserLanguage: false,
  },

  hooks: {
    'pages:extend'(pages) {
      for (const page of pages) {
        if (page.file?.includes('/admin/')) {
          page.meta ||= {}
          page.meta.i18n = false
        }
      }
    },
  },

  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/admin/login',
      callback: '/admin/confirm',
      include: ['/admin/**'],
      exclude: ['/admin/login', '/admin/confirm'],
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
    types: '~/types/database.types.ts',
  },
})
