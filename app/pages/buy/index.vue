<script setup lang="ts">
import { emptySaleForm, type SaleRequestFormData } from '~/types/sale-request'
import type { PublicPropertyListResponse } from '~/types/public-property'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const form = ref<SaleRequestFormData>(emptySaleForm())
const saving = ref(false)
const errorMessage = ref('')
const showSuccessDialog = ref(false)

const { data: listings } = await useFetch<PublicPropertyListResponse>('/api/properties', {
  key: 'buy-interest-listings',
  query: { listing: 'sale', page_size: 4 },
  default: () => ({ properties: [], total: 0, page: 1, page_size: 4, total_pages: 1 }),
})

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/public/sales', { method: 'POST', body: form.value })
    form.value = emptySaleForm()
    showSuccessDialog.value = true
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? t('pages.forms.error')
  } finally {
    saving.value = false
  }
}

useStaticPageSeo('pages.buy.title', 'pages.buy.subtitle')
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.buy.title')" :subtitle="t('pages.buy.subtitle')" />

    <section class="bg-wp-navy py-10">
      <div class="site-container">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-xl font-medium text-white">
            {{ t('home.properties.listingSale') }}
          </h2>
          <NuxtLink
            :to="localePath('/services/properties?listing=sale')"
            class="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-900"
          >
            {{ t('common.viewAll') }}
          </NuxtLink>
        </div>
        <ClientOnly>
          <div v-if="listings?.properties.length" class="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="property in listings.properties"
              :key="property.id"
              class="h-full"
            >
              <PropertyCard
                :property="property"
                mode="sale"
              />
            </div>
          </div>
        </ClientOnly>
      </div>
    </section>

    <section class="py-10">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 class="text-xl font-medium text-wp-navy">
          {{ t('pages.buy.formTitle') }}
        </h2>
        <p v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
        <div class="mt-6">
          <SaleRequestForm v-model="form" :show-status="false" :saving="saving" @submit="onSubmit" />
        </div>
      </div>
    </section>

    <SiteFormSubmitSuccessDialog :open="showSuccessDialog" @close="showSuccessDialog = false" />
  </div>
</template>
