import { siteSocialUrls, type SiteSocialKey } from '~/data/site-social'

export type SiteSocialChannel = {
  key: SiteSocialKey
  label: string
  href: string | null
}

export function useSiteSocial() {
  const { t } = useI18n()

  const channels = computed((): SiteSocialChannel[] => {
    const items: { key: SiteSocialKey, href: string | null }[] = [
      { key: 'facebook', href: siteSocialUrls.facebook || null },
      { key: 'instagram', href: siteSocialUrls.instagram || null },
      { key: 'line', href: siteSocialUrls.line || null },
      { key: 'youtube', href: siteSocialUrls.youtube || null },
      { key: 'tiktok', href: siteSocialUrls.tiktok || null },
    ]
    return items.map(({ key, href }) => ({
      key,
      href,
      label: t(`pages.contact.social.${key}`),
    }))
  })

  return { channels }
}
