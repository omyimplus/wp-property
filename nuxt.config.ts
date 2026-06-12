// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },

  runtimeConfig: {
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
    '/': { prerender: true },
    '/about': { prerender: true },
    '/services': { prerender: true },
    '/services/**': { prerender: true },
    '/consign': { prerender: true },
    '/rent': { prerender: true },
    '/contact': { prerender: true },
    '/articles': { prerender: true },
    '/reviews': { prerender: true },
    '/privacy': { prerender: true },
    '/terms': { prerender: true },
    '/interesting-content': { prerender: true },
    '/properties': { prerender: true },
    '/admin/**': { robots: false },
    '/sitemap.xml': { headers: { 'cache-control': 'public, max-age=3600, s-maxage=3600' } },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'th' },
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
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'wp_i18n',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
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
    types: '~/types/database.types.ts',
  },
})
