<script setup lang="ts">
import { footerServiceItems, footerSitemapItems } from '~/data/site-routes'

const { t } = useI18n()
const { navTo } = useSiteNav()
const { mailto, phoneHref } = useSiteContact()

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
    <div class="site-container py-12 sm:py-14 lg:py-16">
      <div class="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-12 xl:gap-x-12">
        <div id="about" class="min-w-0 sm:col-span-2 lg:col-span-4">
          <NuxtLink :to="navTo('/')" class="inline-flex h-14 items-center">
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
          <p class="mt-4 max-w-md text-sm leading-relaxed text-white/85">
            {{ t('footer.description') }}
          </p>
        </div>

        <div class="min-w-0 lg:col-span-2">
          <h3 class="mb-5 flex min-h-14 items-center text-base font-medium text-white">
            {{ t('footer.sitemap') }}
          </h3>
          <ul class="space-y-3 text-sm text-white/85">
            <li v-for="link in sitemapLinks" :key="link.to">
              <NuxtLink :to="link.to" class="transition hover:text-wp-gold">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="min-w-0 lg:col-span-2">
          <h3 class="mb-5 flex min-h-14 items-center text-base font-medium text-white">
            {{ t('footer.services') }}
          </h3>
          <ul class="space-y-3 text-sm text-white/85">
            <li v-for="link in serviceLinks" :key="`${link.to}-${link.label}`">
              <NuxtLink :to="link.to" class="transition hover:text-wp-gold">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="min-w-0 sm:col-span-2 lg:col-span-4">
          <h3 class="mb-5 flex min-h-14 items-center text-base font-medium text-white">
            {{ t('footer.contact') }}
          </h3>
          <ul class="space-y-3 text-sm leading-relaxed text-white/85">
            <li class="space-y-1">
              <span class="block">{{ t('footer.companyName') }}</span>
              <span class="block">{{ t('footer.address') }}</span>
            </li>
            <li>
              <span class="font-medium text-white">{{ t('footer.phoneLabel') }}</span>
              <a :href="phoneHref" class="ml-1 transition hover:text-wp-gold">
                {{ t('footer.phone') }}
              </a>
            </li>
            <li>
              <span class="font-medium text-white">{{ t('footer.emailLabel') }}</span>
              <a :href="mailto" class="ml-1 transition hover:text-wp-gold">
                {{ t('footer.email') }}
              </a>
            </li>
            <li>
              <span class="font-medium text-white">{{ t('footer.lineLabel') }}</span>
              <span class="ml-1">{{ t('footer.line') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="border-t border-white/20">
      <div class="site-container flex items-center justify-center gap-4 py-5 text-sm text-white/85 sm:py-6">
        <NuxtLink :to="navTo('/privacy')" class="transition hover:text-wp-gold">{{ t('footer.privacy') }}</NuxtLink>
        <span class="text-white/40" aria-hidden="true">|</span>
        <NuxtLink :to="navTo('/terms')" class="transition hover:text-wp-gold">{{ t('footer.terms') }}</NuxtLink>
      </div>
    </div>
  </footer>
</template>
