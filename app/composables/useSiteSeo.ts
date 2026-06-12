import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { absoluteSiteUrl, normalizeSiteUrl, resolveSiteMediaUrl } from '~/utils/site-url'

type JsonLd = Record<string, unknown>

export type SiteSeoOptions = {
  title?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<'website' | 'article' | 'product'>
  noindex?: MaybeRefOrGetter<boolean | undefined>
  jsonLd?: MaybeRefOrGetter<JsonLd | JsonLd[] | undefined>
}

export function useSiteSeo(options: SiteSeoOptions = {}) {
  const { t, locale } = useI18n()
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteUrl = normalizeSiteUrl(config.public.siteUrl)

  const siteName = computed(() => t('seo.siteName'))
  const defaultDescription = computed(() => t('seo.defaultDescription'))
  const defaultImage = computed(() => absoluteSiteUrl(siteUrl, '/images/bg-hero.webp'))

  const pageTitle = computed(() => {
    const raw = toValue(options.title)?.trim()
    if (!raw) return siteName.value
    return raw.includes(siteName.value) ? raw : `${raw} | ${siteName.value}`
  })

  const description = computed(() => toValue(options.description)?.trim() || defaultDescription.value)
  const ogImage = computed(() => resolveSiteMediaUrl(siteUrl, toValue(options.image)) ?? defaultImage.value)
  const canonicalUrl = computed(() => absoluteSiteUrl(siteUrl, route.path))
  const ogLocale = computed(() => (locale.value === 'th' ? 'th_TH' : 'en_US'))

  useSeoMeta({
    title: pageTitle,
    description,
    ogTitle: pageTitle,
    ogDescription: description,
    ogType: () => toValue(options.type) ?? 'website',
    ogUrl: canonicalUrl,
    ogImage,
    ogSiteName: siteName,
    ogLocale,
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitle,
    twitterDescription: description,
    twitterImage: ogImage,
    robots: () => (toValue(options.noindex) ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'),
  })

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
    script: computed(() => {
      const value = toValue(options.jsonLd)
      if (!value) return []
      const schemas = Array.isArray(value) ? value : [value]
      return schemas.map((schema, index) => ({
        key: `jsonld-${index}-${route.path}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      }))
    }),
  })
}

export function useStaticPageSeo(titleKey: string, descriptionKey = 'seo.defaultDescription') {
  const { t } = useI18n()
  useSiteSeo({
    title: () => t(titleKey),
    description: () => t(descriptionKey),
  })
}

export function useSiteOrganizationSchema() {
  const { t } = useI18n()
  const config = useRuntimeConfig()
  const siteUrl = normalizeSiteUrl(config.public.siteUrl)

  useHead({
    script: [
      {
        key: 'jsonld-organization',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateAgent',
          name: t('seo.siteName'),
          url: absoluteSiteUrl(siteUrl, '/'),
          logo: absoluteSiteUrl(siteUrl, '/images/logo.webp'),
          image: absoluteSiteUrl(siteUrl, '/images/bg-hero.webp'),
          description: t('seo.defaultDescription'),
          telephone: t('footer.phone'),
          email: t('footer.email').replace(/\{'@'\}/g, '@'),
          address: {
            '@type': 'PostalAddress',
            streetAddress: t('footer.address'),
            addressCountry: 'TH',
          },
          sameAs: [`https://line.me/R/ti/p/${encodeURIComponent(t('footer.line').replace(/\{'@'\}/g, '@'))}`],
        }),
      },
      {
        key: 'jsonld-website',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: t('seo.siteName'),
          url: absoluteSiteUrl(siteUrl, '/'),
          inLanguage: ['th-TH', 'en-US'],
        }),
      },
    ],
  })
}
