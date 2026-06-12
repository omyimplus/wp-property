<script setup lang="ts">
import PropertyTypeCategoryGrid from '~/components/site/PropertyTypeCategoryGrid.vue'
import { parsePriceRangeKey } from '~/types/public-property'

const { t } = useI18n()
const localePath = useLocalePath()

const listingMode = ref<'sale' | 'rent'>('sale')
const searchType = ref('')
const searchPrice = ref('')
const searchKeyword = ref('')

function onSearch() {
  const range = parsePriceRangeKey(searchPrice.value)
  navigateTo({
    path: localePath('/services/properties'),
    query: {
      listing: listingMode.value,
      ...(searchType.value ? { property_type: searchType.value } : {}),
      ...(searchPrice.value ? { price: searchPrice.value } : {}),
      ...(searchKeyword.value ? { keyword: searchKeyword.value } : {}),
      ...(range.min ? { min_price: String(range.min) } : {}),
      ...(range.max ? { max_price: String(range.max) } : {}),
    },
  })
}

function searchByType(propertyType: string) {
  navigateTo({
    path: localePath('/services/properties'),
    query: { listing: listingMode.value, property_type: propertyType },
  })
}

const fieldClass =
  'h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-wp-navy/40 focus:ring-1 focus:ring-wp-navy/20'
</script>

<template>
  <section class="bg-wp-navy pb-10 pt-4 sm:pb-14 sm:pt-6">
    <div class="site-container">
      <div class="mx-auto max-w-4xl lg:max-w-5xl">
      <div class="relative">
        <!-- Tabs -->
        <div class="relative z-10 flex items-end">
          <button
            type="button"
            class="rounded-t-xl px-9 py-2 text-base transition"
            :class="listingMode === 'sale'
              ? 'bg-white font-bold text-slate-900'
              : 'bg-[#e9ecef] font-normal text-slate-900'"
            @click="listingMode = 'sale'"
          >
            {{ t('common.sale') }}
          </button>
          <button
            type="button"
            class="rounded-t-xl px-9 py-2 text-base transition"
            :class="listingMode === 'rent'
              ? 'bg-white font-bold text-slate-900'
              : 'bg-[#e9ecef] font-normal text-slate-900'"
            @click="listingMode = 'rent'"
          >
            {{ t('common.rent') }}
          </button>
        </div>

        <!-- Search box -->
        <div class="relative -mt-px rounded-b-xl rounded-tr-xl rounded-tl-none bg-white p-4 shadow-sm sm:p-5">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
            <div class="relative lg:w-[22%] lg:shrink-0">
              <select
                v-model="searchType"
                :class="fieldClass"
                class="pr-9"
              >
                <option value="">{{ t('home.search.typePlaceholder') }}</option>
                <option value="house">{{ t('home.search.types.house') }}</option>
                <option value="condo">{{ t('home.search.types.condo') }}</option>
                <option value="townhouse">{{ t('home.search.types.townhouse') }}</option>
                <option value="commercial">{{ t('home.search.types.commercial') }}</option>
                <option value="apartment">{{ t('home.search.types.apartment') }}</option>
              </select>
              <svg
                class="pointer-events-none absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-slate-900"
                viewBox="0 0 10 6"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M0 0l5 6 5-6z" />
              </svg>
            </div>

            <div class="relative lg:w-[18%] lg:shrink-0">
              <select
                v-model="searchPrice"
                :class="fieldClass"
                class="pr-9"
              >
                <option value="">{{ t('home.search.pricePlaceholder') }}</option>
                <option value="1-2">{{ t('home.search.prices.1-2') }}</option>
                <option value="2-5">{{ t('home.search.prices.2-5') }}</option>
                <option value="5+">{{ t('home.search.prices.5+') }}</option>
              </select>
              <svg
                class="pointer-events-none absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-slate-900"
                viewBox="0 0 10 6"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M0 0l5 6 5-6z" />
              </svg>
            </div>

            <div class="relative lg:min-w-0 lg:flex-1">
              <svg
                class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchKeyword"
                type="search"
                :placeholder="t('home.search.keywordPlaceholder')"
                :class="fieldClass"
                class="pl-10"
              >
            </div>

            <button
              type="button"
              class="h-11 shrink-0 rounded-xl bg-wp-navy px-12 text-base font-medium text-white transition hover:bg-wp-navy-light lg:min-w-[7.5rem] lg:px-14"
              @click="onSearch"
            >
              {{ t('common.search') }}
            </button>
          </div>
        </div>
      </div>

        <PropertyTypeCategoryGrid @select="searchByType" />
      </div>
    </div>
  </section>
</template>
