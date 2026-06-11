<script setup lang="ts">
import {
  formatPropertyPrice,
  propertyLocationLine,
  type PublicPropertyListItem,
} from '~/types/public-property'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const code = computed(() => String(route.params.code))

const { data, error } = await useFetch<{ property: PublicPropertyListItem & { images?: { public_url?: string }[] } }>(
  () => `/api/properties/${code.value}`,
)

const property = computed(() => data.value?.property)
const title = computed(
  () => property.value?.listing_title || property.value?.project_name || code.value,
)

useHead({ title: () => title.value })

const activeImage = ref(0)
watch(property, () => { activeImage.value = 0 })
</script>

<template>
  <div>
    <SitePageHero :title="title" :subtitle="property ? propertyLocationLine(property) : ''" />

    <section class="py-10">
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <NuxtLink :to="localePath('/properties')" class="text-sm text-slate-500 hover:text-slate-800">
          ← {{ t('pages.properties.back') }}
        </NuxtLink>

        <div v-if="error" class="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ t('pages.properties.notFound') }}
        </div>

        <div v-else-if="property" class="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <div class="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
              <img
                v-if="property.image_urls?.[activeImage]"
                :src="property.image_urls[activeImage]"
                :alt="title"
                class="h-full w-full object-cover"
              >
            </div>
            <div v-if="property.image_urls?.length > 1" class="mt-3 flex gap-2 overflow-x-auto">
              <button
                v-for="(url, i) in property.image_urls"
                :key="i"
                type="button"
                class="h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2"
                :class="activeImage === i ? 'border-wp-navy' : 'border-transparent'"
                @click="activeImage = i"
              >
                <img :src="url" alt="" class="h-full w-full object-cover">
              </button>
            </div>
          </div>

          <div>
            <p class="text-sm font-medium text-wp-gold">
              {{ property.property_code }}
            </p>
            <h2 class="mt-2 text-2xl font-medium text-slate-900">
              {{ title }}
            </h2>
            <p class="mt-4 text-lg font-bold text-slate-900">
              <template v-if="property.for_sale">
                {{ t('common.sale') }}: {{ t('home.properties.price', { price: formatPropertyPrice(property.sale_price) }) }}
              </template>
              <template v-if="property.for_sale && property.for_rent"> · </template>
              <template v-if="property.for_rent">
                {{ t('common.rent') }}: {{ t('home.properties.price', { price: formatPropertyPrice(property.rent_price) }) }}
              </template>
            </p>

            <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div v-if="property.bedrooms != null">
                <dt class="text-slate-500">{{ t('home.properties.beds', { n: '' }).replace(' ', '') }}</dt>
                <dd class="font-medium">{{ property.bedrooms }}</dd>
              </div>
              <div v-if="property.bathrooms != null">
                <dt class="text-slate-500">{{ t('home.properties.baths', { n: '' }).replace(' ', '') }}</dt>
                <dd class="font-medium">{{ property.bathrooms }}</dd>
              </div>
              <div v-if="property.usable_area_sqm != null">
                <dt class="text-slate-500">{{ t('pages.properties.usableArea') }}</dt>
                <dd class="font-medium">{{ property.usable_area_sqm }} m²</dd>
              </div>
              <div v-if="property.land_area_sqm != null">
                <dt class="text-slate-500">{{ t('pages.properties.landArea') }}</dt>
                <dd class="font-medium">{{ property.land_area_sqm }} m²</dd>
              </div>
            </dl>

            <div class="mt-8 flex flex-wrap gap-3">
              <NuxtLink
                :to="localePath('/contact')"
                class="rounded-xl bg-wp-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-wp-navy-light"
              >
                {{ t('pages.contact.cta') }}
              </NuxtLink>
              <NuxtLink
                :to="localePath('/services/loans')"
                class="rounded-xl border border-wp-navy px-6 py-2.5 text-sm font-medium text-wp-navy"
              >
                {{ t('pages.services.loanCta') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
