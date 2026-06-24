<script setup lang="ts">
import PropertyCard from '~/components/site/PropertyCard.vue'
import PropertyFacilitySection from '~/components/site/PropertyFacilitySection.vue'
import PropertyIcon from '~/components/icons/PropertyIcon.vue'
import { specItemIcon } from '~/utils/property-spec-icons'
import PropertyImageGalleryDialog from '~/components/PropertyImageGalleryDialog.vue'
import PropertyInterestDialog from '~/components/site/PropertyInterestDialog.vue'
import {
  IN_UNIT_FACILITIES,
  NEARBY_FACILITIES,
  resolveFacilityOptions,
} from '~/data/property-facilities'
import type { PropertyIconName } from '~/data/property-icons'
import {
  formatPropertyPrice,
  propertyPricePerSqm,
  type PublicPropertyListItem,
  type PublicPropertyListResponse,
} from '~/types/public-property'
import {
  formatPropertyStreetAddress,
  googleMapsEmbedUrl,
  googleMapsPinUrl,
  hasMapCoordinates,
} from '~/utils/property-address'

definePageMeta({ layout: 'default' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { lineAddUrl, phoneHref } = useSiteContact()
const code = computed(() => String(route.params.code))

const { data, error, pending } = await useFetch<{
  property: PublicPropertyListItem & { images?: { public_url?: string }[] }
}>(() => `/api/properties/${code.value}`, {
  ignoreResponseError: true,
})

const { data: relatedData } = await useFreshFetch<PublicPropertyListResponse>('/api/properties', {
  query: { page_size: 8 },
  key: computed(() => `property-related-${code.value}`),
  default: () => ({ properties: [], total: 0, page: 1, page_size: 8, total_pages: 1 }),
})

const property = computed(() => data.value?.property)

const listingTitle = computed(() => {
  const p = property.value
  if (!p) return code.value
  return p.listing_title?.trim() || p.property_code
})

const projectLine = computed(() => {
  const p = property.value
  if (!p?.project_name?.trim()) return ''
  const name = p.project_name.trim()
  const location = [p.district, p.province].filter(Boolean).join(', ')
  return location ? `${name}, ${location}` : name
})

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('pages.properties.title'), to: localePath('/services/properties') },
  { label: listingTitle.value },
])

useSiteSeo({
  title: () => listingTitle.value,
  description: () => {
    const p = property.value
    if (!p) return t('pages.properties.subtitle')
    const parts = [listingTitle.value, p.province, p.district].filter(Boolean)
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
      name: listingTitle.value,
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
const descriptionExpanded = ref(false)
const addressNoteExpanded = ref(false)

watch(property, () => {
  activeImage.value = 0
  descriptionExpanded.value = false
  addressNoteExpanded.value = false
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

const streetAddress = computed(() => {
  const p = property.value
  if (!p) return ''
  return formatPropertyStreetAddress(p)
})

const projectDescription = computed(() => property.value?.project_description?.trim() ?? '')

const addressAdditionalNote = computed(() => property.value?.address_line?.trim() ?? '')

const salePricePerSqm = computed(() =>
  propertyPricePerSqm(property.value?.sale_price, property.value?.usable_area_sqm),
)

const rentPricePerSqm = computed(() =>
  propertyPricePerSqm(property.value?.rent_price, property.value?.usable_area_sqm),
)

type HighlightChip = { key: string, icon: PropertyIconName | undefined, label: string }

const highlightChips = computed((): HighlightChip[] => {
  const p = property.value
  if (!p) return []

  const chips: HighlightChip[] = []

  if (p.bedrooms != null) {
    chips.push({
      key: 'bed',
      icon: specItemIcon('bed'),
      label: t('pages.properties.detail.bedroomsShort', { n: p.bedrooms }),
    })
  }
  if (p.bathrooms != null) {
    chips.push({
      key: 'bath',
      icon: specItemIcon('bath'),
      label: t('pages.properties.detail.bathroomsShort', { n: p.bathrooms }),
    })
  }
  if (p.usable_area_sqm != null) {
    chips.push({
      key: 'usable',
      icon: specItemIcon('usable'),
      label: t('pages.properties.detail.areaShort', { n: p.usable_area_sqm }),
    })
  }

  return chips
})

const postedDateLabel = computed(() => {
  const iso = property.value?.created_at
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale.value.startsWith('th') ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

type SpecItem = { key: string, label: string, value: string }

const specItems = computed((): SpecItem[] => {
  const p = property.value
  if (!p) return []

  const items: SpecItem[] = []

  if (categoryLabel.value) {
    items.push({
      key: 'type',
      label: t('pages.properties.propertyType'),
      value: categoryLabel.value,
    })
  }

  const listingParts: string[] = []
  if (p.for_sale) listingParts.push(t('common.sale'))
  if (p.for_rent) listingParts.push(t('common.rent'))
  if (listingParts.length) {
    items.push({
      key: 'listing',
      label: t('pages.properties.listingType'),
      value: listingParts.join(' / '),
    })
  }

  if (p.bedrooms != null) {
    items.push({ key: 'bed', label: t('pages.properties.bedrooms'), value: String(p.bedrooms) })
  }
  if (p.bathrooms != null) {
    items.push({ key: 'bath', label: t('pages.properties.bathrooms'), value: String(p.bathrooms) })
  }
  if (p.parking_spaces != null) {
    items.push({
      key: 'parking',
      label: t('pages.properties.parking'),
      value: String(p.parking_spaces),
    })
  }
  if (p.usable_area_sqm != null) {
    items.push({
      key: 'usable',
      label: t('pages.properties.usableArea'),
      value: `${p.usable_area_sqm} m²`,
    })
  }
  if (p.land_area_sqm != null) {
    items.push({
      key: 'land',
      label: t('pages.properties.landArea'),
      value: `${p.land_area_sqm} m²`,
    })
  }
  if (p.floor_number != null) {
    items.push({ key: 'floor', label: t('pages.properties.floor'), value: String(p.floor_number) })
  }
  if (p.floors_total != null) {
    items.push({
      key: 'floors',
      label: t('pages.properties.floorsTotal'),
      value: String(p.floors_total),
    })
  }
  if (p.facing_direction) {
    items.push({
      key: 'facing',
      label: t('pages.properties.facing'),
      value: p.facing_direction,
    })
  }
  if (p.property_age_years != null) {
    items.push({
      key: 'age',
      label: t('pages.properties.age'),
      value: t('pages.properties.ageYears', { n: p.property_age_years }),
    })
  }
  if (p.for_rent && p.rent_deposit_months != null) {
    items.push({
      key: 'deposit',
      label: t('pages.properties.deposit'),
      value: t('pages.properties.depositMonths', { n: p.rent_deposit_months }),
    })
  }

  return items
})

const specColumns = computed(() => {
  const items = specItems.value
  if (!items.length) return [[], []] as [SpecItem[], SpecItem[]]
  const mid = Math.ceil(items.length / 2)
  return [items.slice(0, mid), items.slice(mid)] as [SpecItem[], SpecItem[]]
})

const inUnitFacilities = computed(() =>
  resolveFacilityOptions(property.value?.facilities, IN_UNIT_FACILITIES),
)

const nearbyFacilities = computed(() =>
  resolveFacilityOptions(property.value?.nearby_facilities, NEARBY_FACILITIES),
)

const descriptionPreview = computed(() => previewLongText(projectDescription.value, descriptionExpanded.value))

const addressNotePreview = computed(() => previewLongText(addressAdditionalNote.value, addressNoteExpanded.value))

function previewLongText(text: string, expanded: boolean, limit = 400): string {
  if (!text) return ''
  if (expanded || text.length <= limit) return text
  return `${text.slice(0, limit).trimEnd()}...`
}

const canExpandDescription = computed(() => projectDescription.value.length > 400)

const canExpandAddressNote = computed(() => addressAdditionalNote.value.length > 400)

const showMap = computed(() =>
  hasMapCoordinates(property.value?.latitude, property.value?.longitude),
)

const mapEmbedUrl = computed(() => {
  const p = property.value
  if (!p || !hasMapCoordinates(p.latitude, p.longitude)) return ''
  return googleMapsEmbedUrl(p.latitude!, p.longitude!)
})

const mapLinkUrl = computed(() => {
  const p = property.value
  if (!p || !hasMapCoordinates(p.latitude, p.longitude)) return ''
  return googleMapsPinUrl(p.latitude!, p.longitude!)
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
      <div v-if="pending" class="site-container py-16 text-center text-slate-500">
        {{ t('pages.common.loading') }}
      </div>

      <div
        v-else-if="error || !property"
        class="site-container rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ t('pages.properties.notFound') }}
      </div>

      <div v-else class="site-container space-y-6 sm:space-y-8">
        <SitePropertyDetailGallery
          :image-urls="property.image_urls ?? []"
          :alt="listingTitle"
          @open="openGallery"
        />

        <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-10">
          <div class="min-w-0 space-y-8 sm:space-y-10">
            <header class="space-y-4">
              <div
                class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 sm:text-sm"
              >
                <span>
                  <span class="text-slate-400">{{ t('pages.properties.listingCode') }}</span>
                  <span class="ml-1 font-semibold text-red-600">{{ property.property_code }}</span>
                </span>
                <span
                  v-if="postedDateLabel"
                  class="hidden text-slate-300 sm:inline"
                  aria-hidden="true"
                >·</span>
                <span v-if="postedDateLabel">
                  <span class="text-slate-400">{{ t('pages.properties.postedAt') }}</span>
                  <span class="ml-1 font-medium text-slate-700">{{ postedDateLabel }}</span>
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
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
              </div>

              <h1 class="text-2xl font-semibold leading-snug text-slate-900 sm:text-3xl">
                {{ listingTitle }}
              </h1>

              <p
                v-if="projectLine"
                class="text-base font-medium text-slate-700 sm:text-lg"
              >
                {{ projectLine }}
              </p>

              <p
                v-if="streetAddress"
                class="text-sm leading-relaxed text-slate-600 sm:text-base"
              >
                {{ streetAddress }}
              </p>

              <div class="space-y-3 border-t border-slate-100 pt-4">
                <div v-if="property.for_sale && property.sale_price != null">
                  <p class="text-2xl font-bold text-wp-navy sm:text-3xl">
                    ฿{{ formatPropertyPrice(property.sale_price) }}
                  </p>
                  <p
                    v-if="salePricePerSqm"
                    class="mt-0.5 text-sm text-slate-500"
                  >
                    {{ t('pages.properties.pricePerSqm', { price: salePricePerSqm }) }}
                  </p>
                </div>
                <div
                  v-if="property.for_rent && property.rent_price != null"
                  :class="property.for_sale ? 'border-t border-slate-100 pt-3' : ''"
                >
                  <p class="text-2xl font-bold text-wp-navy sm:text-3xl">
                    ฿{{ formatPropertyPrice(property.rent_price) }}
                    <span class="text-base font-medium text-slate-500">{{ t('home.properties.card.perMonth') }}</span>
                  </p>
                  <p
                    v-if="rentPricePerSqm"
                    class="mt-0.5 text-sm text-slate-500"
                  >
                    {{ t('pages.properties.pricePerSqm', { price: rentPricePerSqm }) }}
                  </p>
                </div>
              </div>

              <ul
                v-if="highlightChips.length"
                class="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4"
              >
                <li
                  v-for="chip in highlightChips"
                  :key="chip.key"
                  class="flex items-center gap-2 text-sm text-slate-700"
                >
                  <PropertyIcon
                    v-if="chip.icon"
                    :name="chip.icon"
                    class="h-5 w-5 shrink-0 text-slate-500"
                    :stroke-width="1.5"
                  />
                  <span>{{ chip.label }}</span>
                </li>
              </ul>
            </header>

            <section
              v-if="specItems.length"
              class="border-t border-slate-200 pt-8"
            >
                <h2 class="text-lg font-medium text-wp-navy sm:text-xl">
                  {{ t('pages.properties.specsTitle') }}
                </h2>
                <div class="mt-4 grid gap-6 sm:grid-cols-2 sm:gap-0">
                  <dl
                    v-for="(column, colIndex) in specColumns"
                    :key="colIndex"
                    class="space-y-3"
                    :class="colIndex === 0 ? 'sm:border-r sm:border-slate-200 sm:pr-6' : 'sm:pl-6'"
                  >
                    <div
                      v-for="item in column"
                      :key="item.key"
                      class="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5"
                    >
                      <dt class="flex min-w-0 items-center gap-3 text-sm text-slate-500">
                        <PropertyIcon
                          v-if="specItemIcon(item.key)"
                          :name="specItemIcon(item.key)!"
                          class="h-8 w-8 shrink-0 text-slate-400"
                          :stroke-width="1.5"
                        />
                        <span>{{ item.label }}</span>
                      </dt>
                      <dd class="shrink-0 text-right text-sm font-medium text-slate-900">
                        {{ item.value }}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              <!-- 6–7 สิ่งอำนวยความสะดวก -->
              <div v-if="inUnitFacilities.length || nearbyFacilities.length">
                <PropertyFacilitySection
                  :title="t('propertyFacilities.inUnitTitle')"
                  :items="inUnitFacilities"
                  expand-label-key="propertyFacilities.expandInUnit"
                />
                <PropertyFacilitySection
                  :title="t('propertyFacilities.nearbyTitle')"
                  :items="nearbyFacilities"
                  expand-label-key="propertyFacilities.expandNearby"
                />
              </div>

              <!-- แผนที่ -->
              <section
                v-if="showMap"
                class="border-t border-slate-200 pt-8"
              >
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <h2 class="text-lg font-medium text-wp-navy sm:text-xl">
                    {{ t('pages.properties.mapSectionTitle') }}
                  </h2>
                  <a
                    :href="mapLinkUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm font-medium text-wp-gold hover:underline"
                  >
                    {{ t('pages.properties.detail.viewOnMap') }} →
                  </a>
                </div>
                <div class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <iframe
                    :src="mapEmbedUrl"
                    class="h-72 w-full sm:h-80"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    :title="t('pages.properties.mapSectionTitle')"
                  />
                </div>
              </section>

              <!-- รายละเอียดโครงการ -->
              <section
                v-if="projectDescription"
                class="border-t border-slate-200 pt-8"
              >
                <h2 class="text-lg font-medium text-wp-navy sm:text-xl">
                  {{ t('pages.properties.projectDescriptionTitle') }}
                </h2>
                <p class="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                  {{ descriptionPreview }}
                </p>
                <button
                  v-if="canExpandDescription"
                  type="button"
                  class="mt-3 text-sm font-medium text-wp-gold hover:underline"
                  @click="descriptionExpanded = !descriptionExpanded"
                >
                  {{
                    descriptionExpanded
                      ? t('pages.properties.projectDescriptionLess')
                      : t('pages.properties.projectDescriptionMore')
                  }}
                </button>
              </section>

              <!-- รายละเอียดเพิ่มเติม — section สุดท้าย -->
              <section
                v-if="addressAdditionalNote"
                class="border-t border-slate-200 pt-8"
              >
                <h2 class="text-lg font-medium text-wp-navy sm:text-xl">
                  {{ t('pages.properties.additionalDescriptionTitle') }}
                </h2>
                <p class="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                  {{ addressNotePreview }}
                </p>
                <button
                  v-if="canExpandAddressNote"
                  type="button"
                  class="mt-3 text-sm font-medium text-wp-gold hover:underline"
                  @click="addressNoteExpanded = !addressNoteExpanded"
                >
                  {{
                    addressNoteExpanded
                      ? t('pages.properties.additionalNoteLess')
                      : t('pages.properties.additionalNoteMore')
                  }}
                </button>
              </section>
          </div>

          <aside class="mt-8 lg:sticky lg:top-24 lg:mt-0">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wp-navy text-sm font-semibold text-white">
                  WP
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-slate-900">
                    {{ t('pages.properties.detail.agentName') }}
                  </p>
                  <p class="truncate text-xs text-slate-500">
                    {{ t('pages.properties.detail.companyName') }}
                  </p>
                </div>
              </div>

              <a
                :href="lineAddUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
              >
                <SiteSocialIcon name="line" class="h-5 w-5" />
                Line
              </a>

              <button
                type="button"
                class="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                @click="inquiryOpen = true"
              >
                {{ t('pages.properties.detail.contactOther') }}
              </button>

              <a
                :href="phoneHref"
                class="mt-3 block text-center text-sm font-medium text-wp-navy hover:underline"
              >
                {{ t('footer.phoneLabel') }} : {{ t('footer.phone') }}
              </a>

              <p class="mt-4 text-xs leading-relaxed text-slate-500">
                {{ t('pages.properties.detail.contactDisclaimer') }}
              </p>
            </div>
          </aside>
        </div>
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

        <div class="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="item in relatedProperties"
            :key="item.id"
            class="h-full"
          >
            <PropertyCard
              :property="item"
              :mode="cardMode(item)"
            />
          </div>
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
