<script setup lang="ts">
import { footerServiceItems, footerSitemapItems } from '~/data/site-routes'

const { t } = useI18n()
const { navTo } = useSiteNav()

const sitemapLinks = computed(() =>
  footerSitemapItems.map(item => ({
    label: t(`footer.sitemapLinks.${item.key}`),
    to: navTo(item.path),
  })),
)

const serviceLinks = computed(() =>
  footerServiceItems.map(item => ({
    label: t(`footer.serviceLinks.${item.key}`),
    to: navTo(item.path),
  })),
)
</script>

<template>
  <footer id="contact" class="bg-wp-footer text-white">
    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:gap-8 lg:py-14">
      <div id="about" class="lg:col-span-1">
        <NuxtLink :to="navTo('/')" class="inline-flex items-center">
          <picture>
            <source srcset="/images/logo.webp" type="image/webp">
            <img
              src="/images/logo.png"
              :alt="t('header.logoAlt')"
              class="h-14 w-auto"
              width="463"
              height="132"
            >
          </picture>
        </NuxtLink>
        <p class="mt-5 text-sm leading-relaxed text-white/85">
          {{ t('footer.description') }}
        </p>
      </div>

      <div>
        <h3 class="mb-4 text-base font-medium text-white">
          {{ t('footer.sitemap') }}
        </h3>
        <ul class="space-y-2.5 text-sm text-white/85">
          <li v-for="link in sitemapLinks" :key="link.to">
            <NuxtLink :to="link.to" class="transition hover:text-wp-gold">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="mb-4 text-base font-medium text-white">
          {{ t('footer.services') }}
        </h3>
        <ul class="space-y-2.5 text-sm text-white/85">
          <li v-for="link in serviceLinks" :key="`${link.to}-${link.label}`">
            <NuxtLink :to="link.to" class="transition hover:text-wp-gold">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="mb-4 text-base font-medium text-white">
          {{ t('footer.contact') }}
        </h3>
        <ul class="space-y-2.5 text-sm leading-relaxed text-white/85">
          <li>
            {{ t('footer.addressLabel') }} : {{ t('footer.address') }}
          </li>
          <li>
            {{ t('footer.phoneLabel') }}
            <a href="tel:029999999" class="transition hover:text-wp-gold">
              {{ t('footer.phone') }}
            </a>
          </li>
          <li>
            {{ t('footer.emailLabel') }} :
            <a href="mailto:info@wpproperty.co.th" class="transition hover:text-wp-gold">
              {{ t('footer.email') }}
            </a>
          </li>
          <li>
            {{ t('footer.lineLabel') }} : {{ t('footer.line') }}
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-white/30">
      <div class="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-5 text-sm text-white/85 sm:px-6">
        <NuxtLink :to="navTo('/privacy')" class="transition hover:text-wp-gold">{{ t('footer.privacy') }}</NuxtLink>
        <span aria-hidden="true">|</span>
        <NuxtLink :to="navTo('/terms')" class="transition hover:text-wp-gold">{{ t('footer.terms') }}</NuxtLink>
      </div>
    </div>
  </footer>
</template>
