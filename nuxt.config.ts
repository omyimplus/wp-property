// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

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

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/webp', href: '/images/fav.webp' },
        { rel: 'apple-touch-icon', href: '/images/fav.webp' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
        },
      ],
    },
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@nuxtjs/i18n'],

  i18n: {
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
