<script setup lang="ts">
import PropertyCard from '~/components/site/PropertyCard.vue'
import PropertyTypeCategoryGrid from '~/components/site/PropertyTypeCategoryGrid.vue'
import { parsePriceRangeKey, type PublicPropertyListResponse } from '~/types/public-property'

const props = defineProps<{
  basePath: string
}>()

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

const listingPath = computed(() => localePath(props.basePath))

const listing = computed(() => {
  const v = route.query.listing
  return v === 'rent' ? 'rent' : 'sale'
})

const searchType = ref((route.query.property_type as string) || '')
const searchPrice = ref((route.query.price as string) || '')
const searchKeyword = ref((route.query.keyword as string) || '')
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

watch(
  () => route.query,
  (q) => {
    searchType.value = (q.property_type as string) || ''
    searchPrice.value = (q.price as string) || ''
    searchKeyword.value = (q.keyword as string) || ''
  },
)

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

const { data, pending, error } = await useFetch<PublicPropertyListResponse>('/api/properties', {
  key: 'property-listing',
  query: queryParams,
  watch: [queryParams],
  default: () => ({ properties: [], total: 0, page: 1, page_size: 12, total_pages: 1 }),
})

function buildQuery(overrides: {
  listing?: 'sale' | 'rent'
  property_type?: string
  price?: string
  keyword?: string
} = {}) {
  const listingVal = overrides.listing ?? listing.value
  const typeVal = overrides.property_type !== undefined ? overrides.property_type : searchType.value
  const priceVal = overrides.price !== undefined ? overrides.price : searchPrice.value
  const keywordVal = overrides.keyword !== undefined ? overrides.keyword : searchKeyword.value

  return {
    listing: listingVal,
    ...(typeVal ? { property_type: typeVal } : {}),
    ...(priceVal ? { price: priceVal } : {}),
    ...(keywordVal ? { keyword: keywordVal } : {}),
  }
}

function applySearch() {
  navigateTo({
    path: listingPath.value,
    query: buildQuery(),
  })
}

function setListing(mode: 'sale' | 'rent') {
  navigateTo({
    path: listingPath.value,
    query: buildQuery({ listing: mode }),
  })
}

function filterByType(propertyType: string) {
  const nextType = searchType.value === propertyType ? '' : propertyType
  navigateTo({
    path: listingPath.value,
    query: buildQuery({ property_type: nextType }),
  })
}
</script>

<template>
  <section class="bg-wp-navy pb-12 pt-6">
    <div class="site-container">
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

      <PropertyTypeCategoryGrid
        :active-property-type="searchType"
        @select="filterByType"
      />

      <div v-if="pending" class="mt-8 text-center text-white/80">
        {{ t('pages.common.loading') }}
      </div>
      <div v-else-if="error" class="mt-8 rounded-xl bg-red-500/15 p-8 text-center text-sm text-red-100">
        {{ t('home.properties.loadError') }}
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
</template>
