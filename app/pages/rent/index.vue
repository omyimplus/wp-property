<script setup lang="ts">
import { emptyRentalForm, type RentalRequestFormData } from '~/types/rental-request'
import type { PublicPropertyListResponse } from '~/types/public-property'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const form = ref<RentalRequestFormData>(emptyRentalForm())
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const { data: listings } = await useFetch<PublicPropertyListResponse>('/api/properties', {
  query: { listing: 'rent', page_size: 4 },
})

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch('/api/public/rentals', { method: 'POST', body: form.value })
    successMessage.value = t('pages.forms.rentalSuccess')
    form.value = emptyRentalForm()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? t('pages.forms.error')
  } finally {
    saving.value = false
  }
}

useStaticPageSeo('pages.rent.title', 'pages.rent.subtitle')
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.rent.title')" :subtitle="t('pages.rent.subtitle')" />

    <section class="bg-wp-navy py-10">
      <div class="site-container">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-xl font-medium text-white">
            {{ t('home.properties.listingRent') }}
          </h2>
          <NuxtLink
            :to="localePath('/services/properties?listing=rent')"
            class="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-900"
          >
            {{ t('common.viewAll') }}
          </NuxtLink>
        </div>
        <div v-if="listings?.properties.length" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PropertyCard
            v-for="property in listings.properties"
            :key="property.id"
            :property="property"
            mode="rent"
          />
        </div>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 class="text-xl font-medium text-wp-navy">
          {{ t('pages.rent.formTitle') }}
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          {{ t('pages.rent.adminNote') }}
        </p>
        <p v-if="successMessage" class="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
        <div class="mt-6">
          <RentalRequestForm v-model="form" :saving="saving" @submit="onSubmit" />
        </div>
      </div>
    </section>
  </div>
</template>
