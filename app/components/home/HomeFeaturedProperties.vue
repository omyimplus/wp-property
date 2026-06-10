<script setup lang="ts">
import { recommendedRentListings, recommendedSaleListings } from '~/data/home-content'

const { t } = useI18n()

function featureIconClass() {
  return 'h-4 w-4 text-slate-400'
}
</script>

<template>
  <section id="properties" class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <h2 class="text-2xl font-medium text-white sm:text-3xl">
        {{ t('home.properties.title') }}
      </h2>

      <!-- Sale listings -->
      <div class="mt-8">
        <span class="inline-block rounded-full bg-wp-hero-blue px-5 py-1.5 text-sm font-medium text-white">
          {{ t('home.properties.listingSale') }}
        </span>
        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 14v3m8-3v3M5 9h14v10a1 1 0 01-1 1H6a1 1 0 01-1-1V9z" />
                  </svg>
                  {{ t('home.properties.baths', { n: property.baths }) }}
                </span>
                <span class="flex items-center gap-1.5">
                  <svg :class="featureIconClass()" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 17h14M7 13l1.5-4h7L17 13M6 17v2h12v-2" />
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
        <span class="inline-block rounded-full bg-orange-500 px-5 py-1.5 text-sm font-medium text-white">
          {{ t('home.properties.listingRent') }}
        </span>
        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <span class="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-medium text-white">
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
              <div class="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span class="flex items-center gap-1.5">
                  <svg :class="featureIconClass()" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 10h18M5 10V8a2 2 0 012-2h10a2 2 0 012 2v2M5 10v10h14V10" />
                  </svg>
                  {{ t('home.properties.beds', { n: property.beds }) }}
                </span>
                <span class="flex items-center gap-1.5">
                  <svg :class="featureIconClass()" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 14v3m8-3v3M5 9h14v10a1 1 0 01-1 1H6a1 1 0 01-1-1V9z" />
                  </svg>
                  {{ t('home.properties.baths', { n: property.baths }) }}
                </span>
                <span class="flex items-center gap-1.5">
                  <svg :class="featureIconClass()" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 17h14M7 13l1.5-4h7L17 13M6 17v2h12v-2" />
                  </svg>
                  {{ t('home.properties.parking', { n: property.parking }) }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
