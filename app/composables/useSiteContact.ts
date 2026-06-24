import { siteOffice } from '~/data/site-office'
import { googleMapsEmbedUrl, googleMapsPinUrl } from '~/utils/property-address'

export function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('66')) return `+${digits}`
  if (digits.startsWith('0')) return `+66${digits.slice(1)}`
  return `+${digits}`
}

export function useSiteContact() {
  const config = useRuntimeConfig()
  const { t } = useI18n()

  const email = computed(() => t('footer.email').replace(/\{'@'\}/g, '@'))
  const mailto = computed(() => `mailto:${email.value}`)
  const phoneHref = computed(() => `tel:${formatPhoneE164(t('footer.phone'))}`)

  const lineOaId = computed(() => String(config.public.lineOaId || 'wpproperty'))
  const lineAddUrl = computed(() => `https://line.me/R/ti/p/@${lineOaId.value}`)
  const lineDisplay = computed(() => t('footer.line').replace(/\{'@'\}/g, '@'))

  const mapEmbedUrl = computed(() =>
    googleMapsEmbedUrl(siteOffice.latitude, siteOffice.longitude),
  )
  const mapOpenUrl = computed(() =>
    googleMapsPinUrl(siteOffice.latitude, siteOffice.longitude),
  )

  return {
    email,
    mailto,
    phoneHref,
    lineAddUrl,
    lineDisplay,
    mapEmbedUrl,
    mapOpenUrl,
  }
}
