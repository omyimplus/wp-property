<script setup lang="ts">
import { navItems, rentBuyNavPaths, serviceNavPathsForParent } from '~/data/site-routes'

const { t } = useI18n()
const localePath = useLocalePath()
const { navTo, isNavActive, isNavActiveAny, isServiceParentNavActive } = useSiteNav()
const mobileOpen = ref(false)
const mobileServicesOpen = ref(false)
const scrolled = ref(false)

const isRentBuyNavActive = computed(() => isNavActiveAny(rentBuyNavPaths))

const navLinks = computed(() =>
  navItems.map(item => ({
    key: item.key,
    label: t(`nav.${item.key}`),
    to: navTo(item.path),
    children: 'children' in item
      ? item.children.map(child => ({
          key: child.key,
          label: t(`nav.serviceDropdown.${child.key}`),
          to: navTo(child.path),
        }))
      : undefined,
  })),
)

function isServiceChildActive(childKey: string, childTo: string) {
  if (childKey === 'properties' && isRentBuyNavActive.value) return false
  return isNavActive(childTo)
}

function isTopNavActive(link: { key: string, to: string }) {
  if (link.key === 'rentBuy') return isRentBuyNavActive.value
  return isNavActive(link.to)
}

function navLinkClass(to: string, active?: boolean) {
  const base = 'border-b-2 pb-1 transition-colors'
  const isActive = active ?? isNavActive(to)
  return isActive
    ? `${base} border-wp-gold-light font-medium text-wp-gold-light`
    : `${base} border-transparent font-normal text-white/90 hover:border-white/25 hover:text-white`
}

function closeMobile() {
  mobileOpen.value = false
  mobileServicesOpen.value = false
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
    <div class="site-container flex items-center justify-between gap-3 py-1.5 sm:py-2">
      <NuxtLink :to="localePath('/')" class="flex shrink-0 items-center">
        <picture>
          <source srcset="/images/logo.webp" type="image/webp">
          <img
            src="/images/logo.png"
            :alt="t('header.logoAlt')"
            class="h-12 w-auto sm:h-14"
            width="463"
            height="132"
          >
        </picture>
      </NuxtLink>

      <div class="flex items-center gap-1.5 lg:gap-3">
        <nav class="hidden items-center lg:flex">
          <template v-for="(link, index) in navLinks" :key="link.key">
            <span
              v-if="index > 0"
              class="mx-1.5 h-3 w-px shrink-0 bg-white/25 xl:mx-2"
              aria-hidden="true"
            />

            <div v-if="link.children" class="group relative">
              <NuxtLink
                :to="link.to"
                class="inline-flex items-center gap-0.5 rounded-none px-2 py-1 text-sm transition xl:px-2.5"
                :class="navLinkClass(link.to, isServiceParentNavActive(serviceNavPathsForParent))"
              >
                {{ link.label }}
                <svg class="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </NuxtLink>

              <div
                class="invisible absolute left-0 top-full z-50 min-w-[12rem] pt-1.5 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
              >
                <div class="overflow-hidden rounded-lg border border-white/10 bg-wp-header py-1 shadow-lg">
                  <NuxtLink
                    v-for="child in link.children"
                    :key="child.key"
                    :to="child.to"
                    class="block px-3 py-2 text-xs text-white/90 transition hover:bg-white/10 hover:text-white sm:text-sm"
                    :class="isServiceChildActive(child.key, child.to) ? 'bg-white/10 font-medium text-wp-gold-light' : ''"
                  >
                    {{ child.label }}
                  </NuxtLink>
                </div>
              </div>
            </div>

            <NuxtLink
              v-else
              :to="link.to"
              class="rounded-none px-2 py-1 text-sm transition xl:px-2.5"
              :class="navLinkClass(link.to, isTopNavActive(link))"
            >
              {{ link.label }}
            </NuxtLink>
          </template>
        </nav>

        <SiteLocaleSwitcher class="hidden lg:block" />

        <button
          type="button"
          class="rounded p-1.5 text-white hover:bg-white/10 lg:hidden"
          :aria-label="t('header.openMenu')"
          @click="mobileOpen = !mobileOpen"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      class="border-t border-white/10 bg-wp-header px-3 py-2 lg:hidden"
    >
      <template v-for="link in navLinks" :key="link.key">
        <div v-if="link.children">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-none px-2 py-1.5 text-sm transition hover:bg-white/10"
            :class="navLinkClass(link.to, isServiceParentNavActive(serviceNavPathsForParent))"
            @click="mobileServicesOpen = !mobileServicesOpen"
          >
            {{ link.label }}
            <svg
              class="h-3.5 w-3.5 transition"
              :class="mobileServicesOpen ? 'rotate-180' : ''"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="mobileServicesOpen" class="pb-1 pl-3">
            <NuxtLink
              v-for="child in link.children"
              :key="child.key"
              :to="child.to"
              class="block rounded-none px-2 py-1.5 text-xs transition hover:bg-white/10 sm:text-sm"
              :class="navLinkClass(child.to, isServiceChildActive(child.key, child.to))"
              @click="closeMobile"
            >
              {{ child.label }}
            </NuxtLink>
          </div>
        </div>

        <NuxtLink
          v-else
          :to="link.to"
          class="block rounded-none px-2 py-1.5 text-sm transition hover:bg-white/10"
          :class="navLinkClass(link.to, isTopNavActive(link))"
          @click="closeMobile"
        >
          {{ link.label }}
        </NuxtLink>
      </template>

      <div class="mt-2 border-t border-white/10 pt-2">
        <SiteLocaleSwitcher />
      </div>
    </nav>
  </header>
</template>
