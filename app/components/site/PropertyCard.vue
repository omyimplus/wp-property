<script setup lang="ts">
import {
  formatPropertyPrice,
  propertyLocationLine,
  type PublicPropertyListItem,
} from '~/types/public-property'

const props = defineProps<{
  property: PublicPropertyListItem
  mode: 'sale' | 'rent'
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const price = computed(() =>
  props.mode === 'sale' ? props.property.sale_price : props.property.rent_price,
)

const title = computed(
  () => props.property.listing_title || props.property.project_name || props.property.property_code,
)

const categoryLabel = computed(() => {
  const type = props.property.property_type
  if (!type) return ''
  return t(`home.search.types.${type}`)
})

const detailTo = computed(() =>
  localePath(`/properties/${props.property.property_code}`),
)
</script>

<template>
  <NuxtLink
    :to="detailTo"
    class="group block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
      <img
        v-if="property.cover_url"
        :src="property.cover_url"
        :alt="title"
        class="h-full w-full object-cover transition group-hover:scale-[1.02]"
      >
      <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">
        {{ t('pages.properties.noImage') }}
      </div>
      <span class="absolute left-3 top-3 rounded-full bg-wp-hero-blue px-2.5 py-0.5 text-xs font-medium text-white">
        {{ mode === 'sale' ? t('common.sale') : t('common.rent') }}
      </span>
      <span class="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
        {{ property.property_code }}
      </span>
      <span
        v-if="categoryLabel"
        class="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-medium text-slate-700 shadow-sm"
      >
        {{ categoryLabel }}
      </span>
    </div>
    <div class="p-4">
      <h3 class="truncate text-sm font-bold text-slate-900 sm:text-base">
        {{ title }}
      </h3>
      <p class="mt-1.5 truncate text-xs text-slate-500 sm:text-sm">
        {{ propertyLocationLine(property) || '—' }}
      </p>
      <p class="mt-2 text-sm font-bold text-slate-900">
        {{ t('home.properties.price', { price: formatPropertyPrice(price) }) }}
      </p>
      <div class="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span v-if="property.bedrooms != null">
          {{ t('home.properties.beds', { n: property.bedrooms }) }}
        </span>
        <span v-if="property.bathrooms != null">
          {{ t('home.properties.baths', { n: property.bathrooms }) }}
        </span>
        <span v-if="property.parking_spaces != null">
          {{ t('home.properties.parking', { n: property.parking_spaces }) }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
