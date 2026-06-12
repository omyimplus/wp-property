<script setup lang="ts">
import HomePropertyCarousel from '~/components/home/HomePropertyCarousel.vue'
import type { PublicPropertyListResponse } from '~/types/public-property'

const { t } = useI18n()
const localePath = useLocalePath()

const HOME_LIMIT = 6

const {
  data: saleData,
  pending: salePending,
  error: saleError,
} = await useFetch<PublicPropertyListResponse>('/api/properties', {
  key: 'home-properties-sale',
  query: { listing: 'sale', page_size: HOME_LIMIT },
  default: () => ({ properties: [], total: 0, page: 1, page_size: HOME_LIMIT, total_pages: 1 }),
})

const {
  data: rentData,
  pending: rentPending,
  error: rentError,
} = await useFetch<PublicPropertyListResponse>('/api/properties', {
  key: 'home-properties-rent',
  query: { listing: 'rent', page_size: HOME_LIMIT },
  default: () => ({ properties: [], total: 0, page: 1, page_size: HOME_LIMIT, total_pages: 1 }),
})

const saleList = computed(() => saleData.value?.properties ?? [])
const rentList = computed(() => rentData.value?.properties ?? [])
const loading = computed(() => salePending.value || rentPending.value)
const fetchFailed = computed(() => Boolean(saleError.value || rentError.value))
</script>

<template>
  <section id="properties" class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8">
    <div class="site-container">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-2xl font-medium text-white sm:text-3xl">
          {{ t('home.properties.title') }}
        </h2>
        <NuxtLink
          :to="localePath('/services/properties')"
          class="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          {{ t('common.viewAll') }}
        </NuxtLink>
      </div>

      <p v-if="loading" class="mt-8 text-center text-sm text-white/70">
        {{ t('pages.common.loading') }}
      </p>
      <p v-else-if="fetchFailed" class="mt-8 rounded-xl bg-red-500/15 px-4 py-3 text-center text-sm text-red-100">
        {{ t('home.properties.loadError') }}
      </p>

      <template v-else>
        <div class="mt-8">
          <span class="inline-block rounded-full bg-wp-hero-blue px-5 py-1.5 text-sm font-medium text-white">
            {{ t('home.properties.listingSale') }}
          </span>
          <HomePropertyCarousel
            v-if="saleList.length"
            class="mt-4"
            :properties="saleList"
            mode="sale"
          />
          <p v-else class="mt-4 rounded-xl bg-white/10 px-4 py-6 text-center text-sm text-white/70">
            {{ t('home.properties.emptySale') }}
          </p>
        </div>

        <div class="mt-10">
          <span class="inline-block rounded-full bg-wp-hero-blue px-5 py-1.5 text-sm font-medium text-white">
            {{ t('home.properties.listingRent') }}
          </span>
          <HomePropertyCarousel
            v-if="rentList.length"
            class="mt-4"
            :properties="rentList"
            mode="rent"
          />
          <p v-else class="mt-4 rounded-xl bg-white/10 px-4 py-6 text-center text-sm text-white/70">
            {{ t('home.properties.emptyRent') }}
          </p>
        </div>
      </template>
    </div>
  </section>
</template>
