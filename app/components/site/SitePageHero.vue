<script setup lang="ts">
import type { BreadcrumbItem } from '~/components/site/SiteBreadcrumb.vue'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  image?: string
  breadcrumbs?: BreadcrumbItem[]
}>(), {
  image: '/images/bg-hero.webp',
})

const { t } = useI18n()
const localePath = useLocalePath()

const breadcrumbItems = computed(() =>
  props.breadcrumbs ?? [
    { label: t('nav.home'), to: localePath('/') },
    { label: props.title },
  ],
)

const backgroundImage = computed(() => props.image || '/images/bg-hero.webp')
</script>

<template>
  <section class="relative overflow-hidden bg-wp-navy">
    <!-- Background -->
    <div class="absolute inset-0" aria-hidden="true">
      <img
        :src="backgroundImage"
        alt=""
        class="h-full w-full scale-105 object-cover object-[center_35%] opacity-40 sm:opacity-50"
      >
      <div class="absolute inset-0 bg-gradient-to-br from-wp-navy/95 via-wp-navy/88 to-wp-hero-blue/80" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(232,185,35,0.14),transparent_50%)]" />
      <div class="absolute inset-0 bg-[linear-gradient(to_top,rgba(1,31,73,0.55),transparent_45%)]" />
    </div>

    <!-- Decorative rings -->
    <div
      class="pointer-events-none absolute -right-10 top-1/2 hidden h-56 w-56 -translate-y-1/2 rounded-full border border-wp-gold/15 lg:block"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute right-8 top-1/2 hidden h-32 w-32 -translate-y-1/2 rounded-full border border-white/10 lg:block"
      aria-hidden="true"
    />

    <!-- Content -->
    <div class="site-container relative pb-10 pt-8 sm:pb-12 sm:pt-9 lg:pb-14 lg:pt-10">
      <SiteBreadcrumb :items="breadcrumbItems" variant="light" />

      <div class="mt-3 flex items-start gap-3 sm:mt-4 sm:gap-4">
        <span
          class="mt-1.5 hidden h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-wp-gold to-wp-gold-light sm:block"
          aria-hidden="true"
        />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-wp-gold-light/90 sm:text-sm">
            WP Property
          </p>
          <h1 class="mt-1.5 text-2xl font-bold leading-tight text-white sm:mt-2 sm:text-3xl lg:text-4xl">
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="mt-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-2.5 sm:text-base lg:text-lg"
          >
            {{ subtitle }}
          </p>
          <div
            class="mt-3 h-0.5 w-16 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30 sm:mt-4"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <!-- Wave into page content -->
    <div class="relative -mb-px leading-[0]" aria-hidden="true">
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        class="block h-6 w-full fill-white sm:h-7 lg:h-8"
      >
        <path d="M0,56 L0,28 C360,4 720,4 1080,28 C1260,40 1380,48 1440,52 L1440,56 Z" />
      </svg>
    </div>
  </section>
</template>
