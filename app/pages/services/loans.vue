<script setup lang="ts">
import { emptyLoanForm, type LoanApplicationFormData } from '~/types/loan-application'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const form = ref<LoanApplicationFormData>(emptyLoanForm())
const saving = ref(false)
const errorMessage = ref('')
const showSuccessDialog = ref(false)

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/public/loans', { method: 'POST', body: form.value })
    form.value = emptyLoanForm()
    showSuccessDialog.value = true
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? t('pages.forms.error')
  } finally {
    saving.value = false
  }
}

useStaticPageSeo('pages.loans.title', 'pages.loans.subtitle')
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.loans.title')" :subtitle="t('pages.loans.subtitle')" />

    <section class="py-10">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <p v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
        <LoanApplicationForm v-model="form" :saving="saving" @submit="onSubmit" />
      </div>
    </section>

    <SiteFormSubmitSuccessDialog :open="showSuccessDialog" @close="showSuccessDialog = false" />
  </div>
</template>
