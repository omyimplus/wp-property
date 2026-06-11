<script setup lang="ts">
import { navItems } from '~/data/site-routes'

const { t } = useI18n()
const localePath = useLocalePath()
const { navTo, isNavActive } = useSiteNav()
const mobileOpen = ref(false)
const scrolled = ref(false)

const navLinks = computed(() =>
  navItems.map(item => ({
    key: item.key,
    label: t(`nav.${item.key}`),
    to: navTo(item.path),
  })),
)

function navLinkClass(to: string) {
  const base = 'border-b-2 pb-1 transition-colors'
  return isNavActive(to)
    ? `${base} border-wp-gold-light font-medium text-wp-gold-light`
    : `${base} border-transparent font-normal text-white/90 hover:border-white/25 hover:text-white`
}

onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 16
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-all duration-300"
    :class="scrolled
      ? 'bg-wp-header/90 shadow-md backdrop-blur-md'
      : 'bg-wp-header'"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-0 sm:px-6">
      <NuxtLink :to="localePath('/')" class="flex shrink-0 items-center">
        <picture>
          <source srcset="/images/logo.webp" type="image/webp">
          <img
            src="/images/logo.png"
            :alt="t('header.logoAlt')"
            class="h-[80px] w-auto"
            width="463"
            height="132"
          >
        </picture>
      </NuxtLink>

      <div class="flex items-center gap-2 lg:gap-4">
        <nav class="hidden items-center lg:flex">
          <template v-for="(link, index) in navLinks" :key="link.key">
            <span
              v-if="index > 0"
              class="mx-2 h-4 w-px shrink-0 bg-white/25 xl:mx-3"
              aria-hidden="true"
            />
            <NuxtLink
              :to="link.to"
              class="rounded-none px-3 py-1.5 text-base transition xl:px-4"
              :class="navLinkClass(link.to)"
            >
              {{ link.label }}
            </NuxtLink>
          </template>
        </nav>

        <SiteLocaleSwitcher class="hidden lg:block" />

        <button
          type="button"
          class="rounded p-2 text-white hover:bg-white/10 lg:hidden"
          :aria-label="t('header.openMenu')"
          @click="mobileOpen = !mobileOpen"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              v-if="!mobileOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <nav
      v-if="mobileOpen"
      class="border-t border-white/10 bg-wp-header px-4 py-3 lg:hidden"
    >
      <NuxtLink
        v-for="link in navLinks"
        :key="link.key"
        :to="link.to"
        class="block rounded-none px-3 py-2 text-base transition hover:bg-white/10"
        :class="navLinkClass(link.to)"
        @click="mobileOpen = false"
      >
        {{ link.label }}
      </NuxtLink>
      <div class="mt-3 border-t border-white/10 pt-3">
        <SiteLocaleSwitcher />
      </div>
    </nav>
  </header>
</template>
