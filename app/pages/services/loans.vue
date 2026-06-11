<script setup lang="ts">
import { emptyLoanForm, type LoanApplicationFormData } from '~/types/loan-application'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const form = ref<LoanApplicationFormData>(emptyLoanForm())
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

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

useHead({ title: () => t('pages.loans.title') })
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.loans.title')" :subtitle="t('pages.loans.subtitle')" />

    <section class="py-10">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <p class="mb-6 text-sm text-slate-600">
          {{ t('pages.loans.adminNote') }}
        </p>
        <p v-if="successMessage" class="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
        <LoanApplicationForm v-model="form" :saving="saving" @submit="onSubmit" />
      </div>
    </section>
  </div>
</template>
