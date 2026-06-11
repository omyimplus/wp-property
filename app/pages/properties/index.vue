<script setup lang="ts">
import { parsePriceRangeKey, type PublicPropertyListResponse } from '~/types/public-property'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const listing = computed(() => {
  const v = route.query.listing
  return v === 'rent' ? 'rent' : 'sale'
})

const searchType = ref((route.query.property_type as string) || '')
const searchPrice = ref((route.query.price as string) || '')
const searchKeyword = ref((route.query.keyword as string) || '')
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const queryParams = computed(() => {
  const range = parsePriceRangeKey(searchPrice.value)
  return {
    listing: listing.value,
    property_type: searchType.value || undefined,
    min_price: range.min,
    max_price: range.max,
    keyword: searchKeyword.value || undefined,
    page: page.value,
    page_size: 12,
  }
})

const { data, pending, refresh } = await useFetch<PublicPropertyListResponse>('/api/properties', {
  query: queryParams,
  watch: [queryParams],
})

function applySearch() {
  navigateTo({
    path: localePath('/properties'),
    query: {
      listing: listing.value,
      ...(searchType.value ? { property_type: searchType.value } : {}),
      ...(searchPrice.value ? { price: searchPrice.value } : {}),
      ...(searchKeyword.value ? { keyword: searchKeyword.value } : {}),
    },
  })
}

function setListing(mode: 'sale' | 'rent') {
  navigateTo({
    path: localePath('/properties'),
    query: {
      listing: mode,
      ...(searchType.value ? { property_type: searchType.value } : {}),
      ...(searchPrice.value ? { price: searchPrice.value } : {}),
      ...(searchKeyword.value ? { keyword: searchKeyword.value } : {}),
    },
  })
}

useHead({ title: () => t('pages.properties.title') })
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.properties.title')" :subtitle="t('pages.properties.subtitle')" />

    <section class="bg-wp-navy pb-12 pt-6">
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-t-xl px-6 py-2 text-sm transition"
            :class="listing === 'sale' ? 'bg-white font-bold text-slate-900' : 'bg-white/20 text-white'"
            @click="setListing('sale')"
          >
            {{ t('common.sale') }}
          </button>
          <button
            type="button"
            class="rounded-t-xl px-6 py-2 text-sm transition"
            :class="listing === 'rent' ? 'bg-white font-bold text-slate-900' : 'bg-white/20 text-white'"
            @click="setListing('rent')"
          >
            {{ t('common.rent') }}
          </button>
        </div>

        <div class="rounded-b-xl rounded-tr-xl bg-white p-4 sm:p-5">
          <form class="flex flex-col gap-3 lg:flex-row" @submit.prevent="applySearch">
            <select v-model="searchType" class="h-11 rounded-lg border border-slate-200 px-3 text-sm">
              <option value="">{{ t('home.search.typePlaceholder') }}</option>
              <option value="house">{{ t('home.search.types.house') }}</option>
              <option value="condo">{{ t('home.search.types.condo') }}</option>
              <option value="townhouse">{{ t('home.search.types.townhouse') }}</option>
              <option value="commercial">{{ t('home.search.types.commercial') }}</option>
              <option value="apartment">{{ t('home.search.types.apartment') }}</option>
            </select>
            <select v-model="searchPrice" class="h-11 rounded-lg border border-slate-200 px-3 text-sm">
              <option value="">{{ t('home.search.pricePlaceholder') }}</option>
              <option value="1-2">{{ t('home.search.prices.1-2') }}</option>
              <option value="2-5">{{ t('home.search.prices.2-5') }}</option>
              <option value="5+">{{ t('home.search.prices.5+') }}</option>
            </select>
            <input
              v-model="searchKeyword"
              type="search"
              :placeholder="t('home.search.keywordPlaceholder')"
              class="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
            >
            <button type="submit" class="h-11 rounded-xl bg-wp-navy px-8 text-sm font-medium text-white">
              {{ t('common.search') }}
            </button>
          </form>
        </div>

        <div v-if="pending" class="mt-8 text-center text-white/80">
          {{ t('pages.common.loading') }}
        </div>
        <div v-else-if="!data?.properties.length" class="mt-8 rounded-xl bg-white/10 p-8 text-center text-white">
          {{ t('pages.properties.empty') }}
        </div>
        <div v-else class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <PropertyCard
            v-for="property in data.properties"
            :key="property.id"
            :property="property"
            :mode="listing"
          />
        </div>

        <p v-if="data?.total" class="mt-6 text-center text-sm text-white/70">
          {{ t('pages.properties.resultCount', { count: data.total }) }}
        </p>
      </div>
    </section>
  </div>
</template>
