<script setup lang="ts">
import {
  emptyPropertyCustomerForm,
  type PropertyCustomerFormData,
  type PropertyCustomerImage,
} from '~/types/property-customer'

definePageMeta({ layout: 'default' })

const { t, te } = useI18n()
const localePath = useLocalePath()

const form = ref<PropertyCustomerFormData>(emptyPropertyCustomerForm())
const consignmentId = ref<string | null>(null)
const images = ref<PropertyCustomerImage[]>([])
const saving = ref(false)
const errorMessage = ref('')
const showSuccessDialog = ref(false)

const breadcrumbs = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('pages.services.title'), to: localePath('/services') },
  { label: t('pages.consignDetail.title') },
])

function stringList(key: string): string[] {
  const items: string[] = []
  for (let i = 0; te(`pages.consignDetail.${key}.${i}`); i++) {
    items.push(t(`pages.consignDetail.${key}.${i}`))
  }
  return items
}

const whyItems = computed(() => {
  const items: { title: string, description: string }[] = []
  for (let i = 0; te(`pages.consignDetail.whyItems.${i}.title`); i++) {
    items.push({
      title: t(`pages.consignDetail.whyItems.${i}.title`),
      description: t(`pages.consignDetail.whyItems.${i}.description`),
    })
  }
  return items
})

const saleHelps = computed(() => stringList('saleHelps'))
const saleSuitable = computed(() => stringList('saleSuitable'))
const rentServices = computed(() => stringList('rentServices'))
const rentAdvantages = computed(() => stringList('rentAdvantages'))

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  try {
    const { consignment } = await $fetch<{ consignment: { id: string } }>(
      '/api/public/consignments',
      { method: 'POST', body: form.value },
    )
    consignmentId.value = consignment.id
    form.value = emptyPropertyCustomerForm()
    showSuccessDialog.value = true
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? t('pages.forms.error')
  } finally {
    saving.value = false
  }
}

useStaticPageSeo('pages.consignDetail.title', 'pages.consignDetail.subtitle')
</script>

<template>
  <div>
    <SitePageHero
      :title="t('pages.consignDetail.title')"
      :subtitle="t('pages.consignDetail.subtitle')"
      :breadcrumbs="breadcrumbs"
    />

    <SiteServiceDetailSplitLayout>
      <template #form-header>
        <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
          {{ t('pages.consignDetail.ctaTitle') }}
        </h2>
        <p class="mt-2 text-sm text-slate-600 sm:text-[0.9375rem]">
          {{ t('pages.consignDetail.ctaSubtitle') }}
        </p>
        <p v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </template>

      <template #form>
        <PropertyForm
          v-model="form"
          mode="consignment"
          :property-id="consignmentId"
          :images="images"
          :show-images="false"
          :show-status="false"
          :saving="saving"
          @update:images="images = $event"
          @submit="onSubmit"
        />
      </template>

      <template #content>
        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.consignDetail.introTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <div class="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            <p>{{ t('pages.consignDetail.introP1') }}</p>
            <p>{{ t('pages.consignDetail.introP2') }}</p>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.consignDetail.saleSectionTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            {{ t('pages.consignDetail.saleIntro') }}
          </p>
          <h3 class="mt-6 text-base font-medium text-wp-navy">
            {{ t('pages.consignDetail.saleHelpsTitle') }}
          </h3>
          <ul class="mt-3 space-y-2.5">
            <li
              v-for="(item, index) in saleHelps"
              :key="index"
              class="flex gap-2.5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wp-gold" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
          <h3 class="mt-6 text-base font-medium text-wp-navy">
            {{ t('pages.consignDetail.saleSuitableTitle') }}
          </h3>
          <ul class="mt-3 space-y-2.5">
            <li
              v-for="(item, index) in saleSuitable"
              :key="index"
              class="flex gap-2.5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wp-hero-blue" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
        </div>

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.consignDetail.rentSectionTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <p class="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            {{ t('pages.consignDetail.rentIntro') }}
          </p>
          <h3 class="mt-6 text-base font-medium text-wp-navy">
            {{ t('pages.consignDetail.rentServicesTitle') }}
          </h3>
          <ul class="mt-3 space-y-2.5">
            <li
              v-for="(item, index) in rentServices"
              :key="index"
              class="flex gap-2.5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wp-gold" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
          <h3 class="mt-6 text-base font-medium text-wp-navy">
            {{ t('pages.consignDetail.rentAdvantagesTitle') }}
          </h3>
          <ul class="mt-3 space-y-2.5">
            <li
              v-for="(item, index) in rentAdvantages"
              :key="index"
              class="flex gap-2.5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
        </div>

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.consignDetail.whyTitle') }}
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
          <p class="mt-6 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            {{ t('pages.consignDetail.closingP1') }}
          </p>
          <p class="mt-3 text-sm font-medium leading-relaxed text-wp-navy sm:text-[0.9375rem]">
            {{ t('pages.consignDetail.closingP2') }}
          </p>
        </div>
      </template>
    </SiteServiceDetailSplitLayout>

    <SiteFormSubmitSuccessDialog :open="showSuccessDialog" @close="showSuccessDialog = false" />
  </div>
</template>
