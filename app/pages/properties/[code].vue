<script setup lang="ts">
import PropertyCard from '~/components/site/PropertyCard.vue'
import PropertyImageGalleryDialog from '~/components/PropertyImageGalleryDialog.vue'
import PropertyInterestDialog from '~/components/site/PropertyInterestDialog.vue'
import {
  formatPropertyPrice,
  propertyLocationLine,
  type PublicPropertyListItem,
  type PublicPropertyListResponse,
} from '~/types/public-property'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const code = computed(() => String(route.params.code))

const { data, error, pending } = await useFetch<{
  property: PublicPropertyListItem & { images?: { public_url?: string }[] }
}>(() => `/api/properties/${code.value}`, {
  ignoreResponseError: true,
})

const { data: relatedData } = await useFetch<PublicPropertyListResponse>('/api/properties', {
  query: { page_size: 8 },
  key: computed(() => `property-related-${code.value}`),
  default: () => ({ properties: [], total: 0, page: 1, page_size: 8, total_pages: 1 }),
})

const property = computed(() => data.value?.property)
const title = computed(
  () => property.value?.listing_title || property.value?.project_name || code.value,
)

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('pages.properties.title'), to: localePath('/services/properties') },
  { label: title.value },
])

useSiteSeo({
  title: () => title.value,
  description: () => {
    const p = property.value
    if (!p) return t('pages.properties.subtitle')
    const parts = [title.value, p.province, p.district].filter(Boolean)
    return parts.join(' · ')
  },
  image: () => property.value?.images?.[0]?.public_url ?? property.value?.cover_url ?? undefined,
  type: 'product',
  jsonLd: computed(() => {
    const p = property.value
    if (!p) return undefined
    const price = p.for_sale ? p.sale_price : p.rent_price
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title.value,
      sku: p.property_code,
      image: p.images?.[0]?.public_url ?? p.cover_url ?? undefined,
      offers: price
        ? {
            '@type': 'Offer',
            price,
            priceCurrency: 'THB',
            availability: 'https://schema.org/InStock',
          }
        : undefined,
    }
  }),
})

const activeImage = ref(0)
const galleryOpen = ref(false)
const inquiryOpen = ref(false)

watch(property, () => {
  activeImage.value = 0
})

const relatedProperties = computed(() =>
  (relatedData.value?.properties ?? [])
    .filter(p => p.property_code !== code.value)
    .slice(0, 4),
)

const categoryLabel = computed(() => {
  const type = property.value?.property_type
  return type ? t(`home.search.types.${type}`) : ''
})

const fullAddress = computed(() => {
  const p = property.value
  if (!p) return ''
  const parts = [
    p.house_number,
    p.address_line,
    p.soi ? `ซ.${p.soi}` : null,
    p.moo ? `ม.${p.moo}` : null,
    p.road ? `ถ.${p.road}` : null,
    p.subdistrict,
    p.district,
    p.province,
  ].filter(Boolean)
  return parts.join(' ')
})

type SpecItem = { label: string, value: string }

const specItems = computed((): SpecItem[] => {
  const p = property.value
  if (!p) return []

  const items: SpecItem[] = []

  if (categoryLabel.value) {
    items.push({ label: t('pages.properties.propertyType'), value: categoryLabel.value })
  }
  if (p.project_name) {
    items.push({ label: t('pages.properties.projectName'), value: p.project_name })
  }
  if (p.bedrooms != null) {
    items.push({ label: t('pages.properties.bedrooms'), value: String(p.bedrooms) })
  }
  if (p.bathrooms != null) {
    items.push({ label: t('pages.properties.bathrooms'), value: String(p.bathrooms) })
  }
  if (p.usable_area_sqm != null) {
    items.push({ label: t('pages.properties.usableArea'), value: `${p.usable_area_sqm} m²` })
  }
  if (p.land_area_sqm != null) {
    items.push({ label: t('pages.properties.landArea'), value: `${p.land_area_sqm} m²` })
  }
  if (p.parking_spaces != null) {
    items.push({ label: t('pages.properties.parking'), value: String(p.parking_spaces) })
  }
  if (p.floor_number != null) {
    items.push({ label: t('pages.properties.floor'), value: String(p.floor_number) })
  }
  if (p.floors_total != null) {
    items.push({ label: t('pages.properties.floorsTotal'), value: String(p.floors_total) })
  }
  if (p.facing_direction) {
    items.push({ label: t('pages.properties.facing'), value: p.facing_direction })
  }
  if (p.property_age_years != null) {
    items.push({
      label: t('pages.properties.age'),
      value: t('pages.properties.ageYears', { n: p.property_age_years }),
    })
  }
  if (p.for_rent && p.rent_deposit_months != null) {
    items.push({
      label: t('pages.properties.deposit'),
      value: t('pages.properties.depositMonths', { n: p.rent_deposit_months }),
    })
  }

  return items
})

function cardMode(item: PublicPropertyListItem): 'sale' | 'rent' {
  return item.for_sale ? 'sale' : 'rent'
}

function openGallery(index = activeImage.value) {
  activeImage.value = index
  galleryOpen.value = true
}
</script>

<template>
  <div>
    <section class="border-b border-slate-200/80 bg-slate-50 py-4">
      <div class="site-container">
        <SiteBreadcrumb :items="breadcrumbItems" />
      </div>
    </section>

    <section class="py-8 sm:py-10">
      <div class="site-container">
        <div v-if="pending" class="py-16 text-center text-slate-500">
          {{ t('pages.common.loading') }}
        </div>

        <div v-else-if="error || !property" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ t('pages.properties.notFound') }}
        </div>

        <template v-else>
          <div class="lg:grid lg:grid-cols-3 lg:items-start lg:gap-8 xl:gap-10">
            <!-- Gallery -->
            <div class="lg:col-span-2">
              <button
                type="button"
                class="group relative block w-full overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80"
                :aria-label="t('pages.properties.openGallery')"
                @click="openGallery()"
              >
                <div class="aspect-[4/3]">
                  <OptimizedImage
                    v-if="property.image_urls?.[activeImage]"
                    :src="property.image_urls[activeImage]"
                    :alt="title"
                    :width="768"
                    :height="576"
                    sizes="(max-width: 1024px) 100vw, 768px"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.01]"
                  />
                  <div
                    v-else
                    class="flex h-full items-center justify-center text-sm text-slate-400"
                  >
                    {{ t('pages.properties.noImage') }}
                  </div>
                </div>
                <span
                  v-if="property.image_urls?.length"
                  class="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                >
                  {{ t('pages.properties.photoCount', { n: property.image_urls.length }) }}
                </span>
              </button>

              <div
                v-if="property.image_urls?.length > 1"
                class="mt-3 flex gap-2 overflow-x-auto pb-1"
              >
                <button
                  v-for="(url, i) in property.image_urls"
                  :key="i"
                  type="button"
                  class="h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition"
                  :class="activeImage === i ? 'border-wp-navy' : 'border-transparent opacity-80 hover:opacity-100'"
                  @click="activeImage = i"
                >
                  <OptimizedImage
                    :src="url"
                    alt=""
                    :width="80"
                    :height="64"
                    sizes="80px"
                    class="h-full w-full object-cover"
                  />
                </button>
              </div>
            </div>

            <!-- Summary -->
            <aside class="mt-8 lg:sticky lg:top-24 lg:col-span-1 lg:mt-0">
              <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    {{ property.property_code }}
                  </span>
                  <span
                    v-if="property.for_sale"
                    class="rounded-full bg-wp-hero-blue px-2.5 py-0.5 text-xs font-medium text-white"
                  >
                    {{ t('common.sale') }}
                  </span>
                  <span
                    v-if="property.for_rent"
                    class="rounded-full bg-wp-navy px-2.5 py-0.5 text-xs font-medium text-white"
                  >
                    {{ t('common.rent') }}
                  </span>
                  <span
                    v-if="categoryLabel"
                    class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                  >
                    {{ categoryLabel }}
                  </span>
                </div>

                <h1 class="mt-4 text-xl font-medium leading-snug text-slate-900 sm:text-2xl">
                  {{ title }}
                </h1>
                <p class="mt-2 text-sm text-slate-500">
                  {{ propertyLocationLine(property) }}
                </p>

                <div class="mt-5 space-y-2 border-t border-slate-100 pt-5">
                  <p v-if="property.for_sale" class="text-sm text-slate-600">
                    <span class="font-medium text-slate-800">{{ t('common.sale') }}</span>
                    <span class="ml-2 text-lg font-bold text-wp-navy">
                      {{ t('home.properties.price', { price: formatPropertyPrice(property.sale_price) }) }}
                    </span>
                  </p>
                  <p v-if="property.for_rent" class="text-sm text-slate-600">
                    <span class="font-medium text-slate-800">{{ t('common.rent') }}</span>
                    <span class="ml-2 text-lg font-bold text-wp-navy">
                      {{ t('home.properties.price', { price: formatPropertyPrice(property.rent_price) }) }}
                    </span>
                  </p>
                </div>

                <div class="mt-5">
                  <button
                    type="button"
                    class="inline-flex w-full items-center justify-center rounded-xl bg-wp-navy px-5 py-2.5 text-sm font-medium text-white transition hover:bg-wp-navy-light"
                    @click="inquiryOpen = true"
                  >
                    {{ t('pages.contact.cta') }}
                  </button>
                </div>
              </div>
            </aside>
          </div>

          <!-- Specs -->
          <div v-if="specItems.length || fullAddress" class="mt-10 border-t border-slate-200 pt-10">
            <div class="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div v-if="specItems.length">
                <h2 class="text-lg font-medium text-wp-navy sm:text-xl">
                  {{ t('pages.properties.specsTitle') }}
                </h2>
                <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                  <div
                    v-for="item in specItems"
                    :key="item.label"
                    class="rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <dt class="text-xs text-slate-500">
                      {{ item.label }}
                    </dt>
                    <dd class="mt-1 text-sm font-medium text-slate-900">
                      {{ item.value }}
                    </dd>
                  </div>
                </dl>
              </div>

              <div v-if="fullAddress">
                <h2 class="text-lg font-medium text-wp-navy sm:text-xl">
                  {{ t('pages.properties.locationTitle') }}
                </h2>
                <p class="mt-4 rounded-xl bg-slate-50 px-4 py-4 text-sm leading-relaxed text-slate-700">
                  {{ fullAddress }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>

    <section
      v-if="relatedProperties.length"
      class="border-t border-slate-200 bg-slate-50 py-10 sm:py-12"
    >
      <div class="site-container">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
              {{ t('pages.properties.relatedTitle') }}
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              {{ t('pages.properties.relatedSubtitle') }}
            </p>
          </div>
          <NuxtLink
            :to="localePath('/services/properties')"
            class="text-sm font-medium text-wp-gold hover:underline"
          >
            {{ t('common.viewAll') }} →
          </NuxtLink>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PropertyCard
            v-for="item in relatedProperties"
            :key="item.id"
            :property="item"
            :mode="cardMode(item)"
          />
        </div>
      </div>
    </section>

    <PropertyImageGalleryDialog
      v-if="property"
      :open="galleryOpen"
      :property-code="property.property_code"
      :listing-title="property.listing_title"
      status="published"
      :image-urls="property.image_urls ?? []"
      :initial-index="activeImage"
      @close="galleryOpen = false"
    />

    <PropertyInterestDialog
      v-if="property"
      :open="inquiryOpen"
      :property="property"
      @close="inquiryOpen = false"
    />
  </div>
</template>
