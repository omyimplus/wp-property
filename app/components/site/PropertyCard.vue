<script setup lang="ts">
import {
  formatPropertyPostedAt,
  formatPropertyPrice,
  propertyLocationLine,
  propertyPricePerSqm,
  type PublicPropertyListItem,
} from '~/types/public-property'
import PropertyIcon from '~/components/icons/PropertyIcon.vue'
import type { PropertyIconName } from '~/data/property-icons'

const props = defineProps<{
  property: PublicPropertyListItem
  mode: 'sale' | 'rent'
}>()

const { t, locale } = useI18n()
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

const pricePerSqm = computed(() =>
  propertyPricePerSqm(price.value, props.property.usable_area_sqm),
)

const locationLine = computed(() =>
  propertyLocationLine(props.property, locale.value),
)

type SpecChip = { icon: PropertyIconName, label: string, suffix?: string, title: string }

/** ห้องนอน → ห้องน้ำ → ที่จอดรถ → พื้นที่ใช้สอย (แสดงครบ 4 ช่องเสมอ) */
const specChips = computed((): SpecChip[] => {
  const p = props.property
  const dash = '—'

  return [
    {
      icon: 'bedroom',
      label: p.bedrooms != null ? String(p.bedrooms) : dash,
      title: t('pages.properties.bedrooms'),
    },
    {
      icon: 'bathroom',
      label: p.bathrooms != null ? String(p.bathrooms) : dash,
      title: t('pages.properties.bathrooms'),
    },
    {
      icon: 'parking',
      label: p.parking_spaces != null ? String(p.parking_spaces) : dash,
      title: t('pages.properties.parking'),
    },
    {
      icon: 'usable_area',
      label: p.usable_area_sqm != null ? String(p.usable_area_sqm) : dash,
      title: t('pages.properties.usableArea'),
    },
  ]
})

const showNearTransit = computed(() =>
  props.property.nearby_facilities?.includes('near_transit'),
)

const excerpt = computed(() => {
  const text = props.property.project_description?.trim()
  if (!text) return ''
  return text.length > 80 ? `${text.slice(0, 80).trimEnd()}...` : text
})

const postedLabel = computed(() => {
  const posted = formatPropertyPostedAt(props.property.created_at, locale.value)
  if (!posted) return ''
  return t('home.properties.card.postedAt', posted)
})

const detailTo = computed(() =>
  localePath(`/properties/${props.property.property_code}`),
)
</script>

<template>
  <NuxtLink
    :to="detailTo"
    class="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
  >
    <div class="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
      <OptimizedImage
        v-if="property.cover_url"
        :src="property.cover_url"
        :alt="title"
        :width="400"
        :height="300"
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
        class="absolute inset-0 block h-full w-full max-w-none object-cover transition group-hover:scale-[1.02]"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
        {{ t('pages.properties.noImage') }}
      </div>
      <span class="absolute left-3 top-3 rounded-full bg-wp-hero-blue px-2.5 py-0.5 text-xs font-medium text-white">
        {{ mode === 'sale' ? t('common.sale') : t('common.rent') }}
      </span>
      <span class="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
        {{ property.property_code }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-1.5 p-3.5">
      <h3 class="line-clamp-2 h-10 shrink-0 overflow-hidden text-sm font-bold leading-5 text-slate-900">
        {{ title }}
      </h3>

      <div>
        <p class="text-base font-bold leading-tight text-wp-navy sm:text-lg">
          ฿{{ formatPropertyPrice(price) }}<span
            v-if="mode === 'rent'"
            class="text-xs font-medium text-slate-500"
          >{{ t('home.properties.card.perMonth') }}</span>
        </p>
        <p class="min-h-[0.875rem] text-[11px] leading-tight text-slate-500">
          <template v-if="pricePerSqm">
            ฿{{ pricePerSqm }} {{ t('home.properties.card.perSqm') }}
          </template>
        </p>
      </div>

      <p class="line-clamp-2 text-[10px] leading-snug text-slate-500 sm:text-[11px]">
        {{ locationLine || '—' }}
      </p>

      <div class="flex items-stretch overflow-hidden rounded-md bg-slate-50 ring-1 ring-inset ring-slate-200/70">
        <div
          v-for="(chip, index) in specChips"
          :key="chip.icon"
          class="flex min-w-0 flex-1 items-center justify-center gap-1 px-1 py-1.5 text-xs font-medium leading-none text-slate-600"
          :class="[
            index > 0 ? 'border-l border-slate-200/60' : '',
            chip.label === '—' ? 'text-slate-300' : '',
          ]"
          :title="chip.title"
        >
          <PropertyIcon
            :name="chip.icon"
            class="h-4 w-4 shrink-0 text-slate-400"
            :class="chip.label === '—' ? 'opacity-50' : ''"
            :stroke-width="1.5"
          />
          <span class="tabular-nums">{{ chip.label }}</span>
          <span
            v-if="chip.suffix"
            class="text-[9px] font-normal text-slate-400"
          >{{ chip.suffix }}</span>
        </div>
      </div>

      <div
        v-if="categoryLabel || showNearTransit || excerpt"
        class="flex flex-col gap-1"
      >
        <p
          v-if="categoryLabel"
          class="text-xs font-medium text-slate-600"
        >
          {{ categoryLabel }}
        </p>

        <p
          v-if="showNearTransit"
          class="flex items-center gap-1 text-[11px] text-emerald-700"
        >
          <PropertyIcon name="transit" class="h-3.5 w-3.5 shrink-0 text-emerald-500" :stroke-width="1.5" />
          {{ t('home.properties.card.nearTransit') }}
        </p>

        <p
          v-if="excerpt"
          class="line-clamp-1 text-[11px] leading-snug text-slate-500"
        >
          {{ excerpt }}
        </p>
      </div>

      <p
        v-if="postedLabel"
        class="mt-auto flex items-center gap-1 border-t border-slate-100 pt-2 text-[11px] leading-snug text-slate-400"
      >
        <PropertyIcon name="calendar" class="h-3.5 w-3.5 shrink-0 text-slate-400" :stroke-width="1.5" />
        {{ postedLabel }}
      </p>
    </div>
  </NuxtLink>
</template>
