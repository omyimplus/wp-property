<script setup lang="ts">
import { emptyLoanForm, type LoanApplicationFormData } from '~/types/loan-application'

definePageMeta({ layout: 'default' })

const { t, te } = useI18n()
const localePath = useLocalePath()

const form = ref<LoanApplicationFormData>(emptyLoanForm())
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const breadcrumbs = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('pages.services.title'), to: localePath('/services') },
  { label: t('pages.debtDetail.title') },
])

function stringList(key: string): string[] {
  const items: string[] = []
  for (let i = 0; te(`pages.debtDetail.${key}.${i}`); i++) {
    items.push(t(`pages.debtDetail.${key}.${i}`))
  }
  return items
}

const benefitItems = computed(() => {
  const items: { title: string, description: string }[] = []
  for (let i = 0; te(`pages.debtDetail.benefits.${i}.title`); i++) {
    items.push({
      title: t(`pages.debtDetail.benefits.${i}.title`),
      description: t(`pages.debtDetail.benefits.${i}.description`),
    })
  }
  return items
})

const suitableItems = computed(() => stringList('suitableItems'))
const exampleItems = computed(() => stringList('exampleItems'))
const summaryItems = computed(() => stringList('summaryItems'))
const considerationItems = computed(() => stringList('considerationItems'))

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch('/api/public/loans', { method: 'POST', body: form.value })
    successMessage.value = t('pages.forms.loanSuccess')
    form.value = emptyLoanForm()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? t('pages.forms.error')
  } finally {
    saving.value = false
  }
}

useStaticPageSeo('pages.debtDetail.title', 'pages.debtDetail.subtitle')
</script>

<template>
  <div>
    <SitePageHero
      :title="t('pages.debtDetail.title')"
      :subtitle="t('pages.debtDetail.subtitle')"
      :breadcrumbs="breadcrumbs"
    />

    <SiteServiceDetailSplitLayout>
      <template #form-header>
        <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
          {{ t('pages.loans.title') }}
        </h2>
        <p class="mt-2 text-sm text-slate-600 sm:text-[0.9375rem]">
          {{ t('pages.loans.subtitle') }}
        </p>
        <p v-if="successMessage" class="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </template>

      <template #form>
        <LoanApplicationForm v-model="form" :show-status="false" :saving="saving" @submit="onSubmit" />
      </template>

      <template #content>
        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.debtDetail.introTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <div class="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            <p>{{ t('pages.debtDetail.introP1') }}</p>
            <p>{{ t('pages.debtDetail.introP2') }}</p>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.debtDetail.benefitsTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <ul class="mt-6 space-y-4">
            <li
              v-for="(item, index) in benefitItems"
              :key="index"
              class="flex gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-4"
            >
              <span
                class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
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

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.debtDetail.suitableTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <ul class="mt-5 space-y-2.5">
            <li
              v-for="(item, index) in suitableItems"
              :key="index"
              class="flex gap-2.5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wp-gold" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
        </div>

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.debtDetail.collateralTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <div class="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
            <p>{{ t('pages.debtDetail.collateralP1') }}</p>
            <p>{{ t('pages.debtDetail.collateralP2') }}</p>
          </div>
          <div class="mt-6 rounded-xl border border-wp-gold/30 bg-wp-gold/5 p-4 sm:p-5">
            <p class="text-sm font-medium text-wp-navy">
              {{ t('pages.debtDetail.exampleTitle') }}
            </p>
            <ul class="mt-3 space-y-2">
              <li
                v-for="(item, index) in exampleItems"
                :key="index"
                class="flex gap-2 text-sm text-slate-700"
              >
                <span class="text-wp-gold" aria-hidden="true">•</span>
                {{ item }}
              </li>
            </ul>
            <p class="mt-4 text-sm font-medium leading-relaxed text-wp-navy">
              {{ t('pages.debtDetail.exampleTotal') }}
            </p>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-medium text-wp-navy sm:text-2xl">
            {{ t('pages.debtDetail.summaryTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <ul class="mt-5 space-y-2.5">
            <li
              v-for="(item, index) in summaryItems"
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
            {{ t('pages.debtDetail.considerationsTitle') }}
          </h2>
          <div class="mt-2.5 h-0.5 w-10 rounded-full bg-gradient-to-r from-wp-gold to-wp-gold/30" aria-hidden="true" />
          <ol class="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
            <li v-for="(item, index) in considerationItems" :key="index">
              {{ item }}
            </li>
          </ol>
          <p class="mt-5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
            {{ t('pages.debtDetail.considerationsOutro') }}
          </p>
        </div>
      </template>
    </SiteServiceDetailSplitLayout>
  </div>
</template>
