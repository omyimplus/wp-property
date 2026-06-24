<script setup lang="ts">
import { emptyRentalForm, type RentalRequestFormData } from '~/types/rental-request'

definePageMeta({ layout: 'default' })

const { t, te } = useI18n()
const localePath = useLocalePath()

const form = ref<RentalRequestFormData>(emptyRentalForm())
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const breadcrumbs = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('pages.services.title'), to: localePath('/services') },
  { label: t('pages.rentBuyDetail.title') },
])

function stringList(key: string): string[] {
  const items: string[] = []
  for (let i = 0; te(`pages.rentBuyDetail.${key}.${i}`); i++) {
    items.push(t(`pages.rentBuyDetail.${key}.${i}`))
  }
  return items
}

const whyItems = computed(() => {
  const items: { title: string, description: string }[] = []
  for (let i = 0; te(`pages.rentBuyDetail.whyItems.${i}.title`); i++) {
    items.push({
      title: t(`pages.rentBuyDetail.whyItems.${i}.title`),
      description: t(`pages.rentBuyDetail.whyItems.${i}.description`),
    })
  }
  return items
})

const rentBenefits = computed(() => stringList('rentBenefits'))
const buyServices = computed(() => stringList('buyServices'))

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

useStaticPageSeo('pages.rentBuyDetail.title', 'pages.rentBuyDetail.subtitle')
</script>

<template>
  <div>
    <SitePageHero
      :title="t('pages.rentBuyDetail.title')"
      :subtitle="t('pages.rentBuyDetail.subtitle')"
      :breadcrumbs="breadcrumbs"
    />

    <SiteServiceDetailSplitLayout>
      <template #form-header>
        <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
          {{ t('pages.rentBuyDetail.ctaTitle') }}
        </h2>
        <p class="mt-2 text-sm text-slate-600 sm:text-[0.9375rem]">
          {{ t('pages.rentBuyDetail.ctaSubtitle') }}
        </p>
        <h3 class="mt-6 text-base font-medium text-wp-navy">
          {{ t('pages.rent.formTitle') }}
        </h3>
        <p v-if="successMessage" class="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </template>

      <template #form>
        <RentalRequestForm v-model="form" :show-status="false" :saving="saving" @submit="onSubmit" />
      </template>

      <template #content>
        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.rentBuyDetail.introTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <div class="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            <p>{{ t('pages.rentBuyDetail.introP1') }}</p>
            <p>{{ t('pages.rentBuyDetail.introP2') }}</p>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.rentBuyDetail.rentSectionTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            {{ t('pages.rentBuyDetail.rentIntro') }}
          </p>
          <h3 class="mt-6 text-base font-medium text-wp-navy">
            {{ t('pages.rentBuyDetail.rentBenefitsTitle') }}
          </h3>
          <ul class="mt-3 space-y-2.5">
            <li
              v-for="(item, index) in rentBenefits"
              :key="index"
              class="flex gap-2.5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wp-gold" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
          <p class="mt-5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            {{ t('pages.rentBuyDetail.rentOutro') }}
          </p>
        </div>

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.rentBuyDetail.buySectionTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            {{ t('pages.rentBuyDetail.buyIntro') }}
          </p>
          <h3 class="mt-6 text-base font-medium text-wp-navy">
            {{ t('pages.rentBuyDetail.buyServicesTitle') }}
          </h3>
          <ul class="mt-3 space-y-2.5">
            <li
              v-for="(item, index) in buyServices"
              :key="index"
              class="flex gap-2.5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wp-hero-blue" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
          <p class="mt-5 rounded-xl border border-wp-gold/30 bg-wp-gold/5 px-4 py-3 text-sm leading-relaxed text-slate-700">
            {{ t('pages.rentBuyDetail.buyOutro') }}
          </p>
        </div>

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.rentBuyDetail.whyTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <ul class="mt-6 space-y-4">
            <li
              v-for="(item, index) in whyItems"
              :key="index"
              class="flex gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-4"
            >
              <span
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-wp-hero-blue/10 text-wp-hero-blue"
                aria-hidden="true"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="font-medium text-wp-navy">
                  {{ item.title }}
                </p>
                <p class="mt-1 text-sm leading-relaxed text-slate-600">
                  {{ item.description }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </template>
    </SiteServiceDetailSplitLayout>
  </div>
</template>
