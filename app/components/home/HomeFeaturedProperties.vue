<script setup lang="ts">
import { recommendedRentListings, recommendedSaleListings } from '~/data/home-content'
import type { PublicPropertyListResponse } from '~/types/public-property'

const { t } = useI18n()
const localePath = useLocalePath()

const { data: saleData } = await useFetch<PublicPropertyListResponse>('/api/properties', {
  query: { listing: 'sale', page_size: 4 },
})

const { data: rentData } = await useFetch<PublicPropertyListResponse>('/api/properties', {
  query: { listing: 'rent', page_size: 4 },
})

const saleList = computed(() =>
  saleData.value?.properties?.length
    ? saleData.value.properties
    : null,
)

const rentList = computed(() =>
  rentData.value?.properties?.length
    ? rentData.value.properties
    : null,
)

function featureIconClass() {
  return 'h-4 w-4 text-slate-400'
}
</script>

<template>
  <section id="properties" class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-2xl font-medium text-white sm:text-3xl">
          {{ t('home.properties.title') }}
        </h2>
        <NuxtLink
          :to="localePath('/properties')"
          class="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          {{ t('common.viewAll') }}
        </NuxtLink>
      </div>

      <!-- Sale listings -->
      <div class="mt-8">
        <span class="inline-block rounded-full bg-wp-hero-blue px-5 py-1.5 text-sm font-medium text-white">
          {{ t('home.properties.listingSale') }}
        </span>
        <div v-if="saleList" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PropertyCard
            v-for="property in saleList"
            :key="property.id"
            :property="property"
            mode="sale"
          />
        </div>
        <div v-else class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="property in recommendedSaleListings"
            :key="property.id"
            class="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <div class="relative aspect-[4/3] overflow-hidden">
              <img
                :src="property.image"
                :alt="t('home.properties.card.title')"
                class="h-full w-full object-cover"
              >
              <span class="absolute left-3 top-3 rounded-full bg-wp-hero-blue px-2.5 py-0.5 text-xs font-medium text-white">
                {{ t('common.sale') }}
              </span>
              <span class="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
                {{ property.code }}
              </span>
            </div>
            <div class="p-4">
              <h3 class="truncate text-sm font-bold text-slate-900 sm:text-base">
                {{ t('home.properties.card.title') }}
              </h3>
              <p class="mt-1.5 truncate text-xs text-slate-500 sm:text-sm">
                {{ t('home.properties.card.location') }}
              </p>
              <p class="mt-2 text-sm font-bold text-slate-900">
                {{ t('home.properties.price', { price: property.price }) }}
              </p>
              <div class="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span class="flex items-center gap-1.5">
                  <svg :class="featureIconClass()" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 10h18M5 10V8a2 2 0 012-2h10a2 2 0 012 2v2M5 10v10h14V10" />
                  </svg>
                  {{ t('home.properties.beds', { n: property.beds }) }}
                </span>
                <span class="flex items-center gap-1.5">
                  <svg :class="featureIconClass()" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18V6a2 2 0 012-2h14a2 2 0 012 2v4" />
                  </svg>
                  {{ t('home.properties.baths', { n: property.baths }) }}
                </span>
                <span class="flex items-center gap-1.5">
                  <svg :class="featureIconClass()" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {{ t('home.properties.parking', { n: property.parking }) }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Rent listings -->
      <div class="mt-10">
        <span class="inline-block rounded-full bg-wp-hero-blue px-5 py-1.5 text-sm font-medium text-white">
          {{ t('home.properties.listingRent') }}
        </span>
        <div v-if="rentList" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PropertyCard
            v-for="property in rentList"
            :key="property.id"
            :property="property"
            mode="rent"
          />
        </div>
        <div v-else class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="property in recommendedRentListings"
            :key="property.id"
            class="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <div class="relative aspect-[4/3] overflow-hidden">
              <img
                :src="property.image"
                :alt="t('home.properties.card.title')"
                class="h-full w-full object-cover"
              >
              <span class="absolute left-3 top-3 rounded-full bg-wp-hero-blue px-2.5 py-0.5 text-xs font-medium text-white">
                {{ t('common.rent') }}
              </span>
              <span class="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
                {{ property.code }}
              </span>
            </div>
            <div class="p-4">
              <h3 class="truncate text-sm font-bold text-slate-900 sm:text-base">
                {{ t('home.properties.card.title') }}
              </h3>
              <p class="mt-1.5 truncate text-xs text-slate-500 sm:text-sm">
                {{ t('home.properties.card.location') }}
              </p>
              <p class="mt-2 text-sm font-bold text-slate-900">
                {{ t('home.properties.price', { price: property.price }) }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
