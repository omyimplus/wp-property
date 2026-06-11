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

useHead({ title: () => t('pages.services.title') })
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.services.title')" :subtitle="t('pages.services.subtitle')" />

    <section class="py-12">
      <div class="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 sm:px-6">
        <article
          v-for="service in services"
          :id="service.key === 'consign' ? 'consign-buy' : undefined"
          :key="service.key"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <img :src="service.image" :alt="t(`home.services.${service.key}.title`)" class="aspect-[4/3] w-full object-cover">
          <div class="p-5">
            <h2 class="text-lg font-medium text-wp-navy">
              {{ t(`home.services.${service.key}.title`) }}
            </h2>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">
              {{ t(`home.services.${service.key}.description`) }}
            </p>
            <NuxtLink
              :to="localePath(serviceLinks[service.key])"
              class="mt-4 inline-block text-sm font-medium text-wp-gold hover:underline"
            >
              {{ t('pages.common.learnMore') }} →
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
