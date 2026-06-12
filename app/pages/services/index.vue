<script setup lang="ts">
import { services } from '~/data/home-content'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()

const serviceLinks: Record<string, string> = {
  debt: '/services/loans',
  rentBuy: '/rent',
  consign: '/consign',
}

useStaticPageSeo('pages.services.title', 'pages.services.subtitle')
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.services.title')" :subtitle="t('pages.services.subtitle')" />

    <section class="py-10 sm:py-12">
      <div class="site-container space-y-10 sm:space-y-14 lg:space-y-16">
        <article
          v-for="(service, index) in services"
          :id="service.key === 'consign' ? 'consign-buy' : undefined"
          :key="service.key"
          class="grid items-center gap-5 sm:gap-6 lg:grid-cols-4 lg:gap-8"
        >
          <!-- Image -->
          <div
            class="mx-auto w-full max-w-xs overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-200/80 lg:mx-0 lg:max-w-none lg:col-span-1"
            :class="index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'"
          >
            <div class="aspect-[4/3] overflow-hidden">
              <img
                :src="service.image"
                :alt="t(`home.services.${service.key}.title`)"
                class="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
              >
            </div>
          </div>

          <!-- Text -->
          <div
            class="min-w-0 lg:col-span-3"
            :class="index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'"
          >
            <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
              {{ t(`home.services.${service.key}.title`) }}
            </h2>
            <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
            <p class="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
              {{ t(`pages.services.${service.key}.detail`) }}
            </p>
            <NuxtLink
              :to="localePath(serviceLinks[service.key])"
              class="mt-5 inline-flex items-center rounded-xl border border-wp-hero-cta-mid bg-gradient-to-br from-wp-hero-navy to-wp-hero-cta-mid px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
            >
              {{ t('pages.common.learnMore') }} →
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
