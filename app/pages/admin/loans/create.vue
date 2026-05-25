<script setup lang="ts">
import { emptyLoanForm, type LoanApplicationFormData } from '~/types/loan-application'

definePageMeta({ layout: 'admin', title: 'รับคำขอสินเชื่อ' })

const form = ref<LoanApplicationFormData>(emptyLoanForm())
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { loan } = await $fetch<{ loan: { id: string } }>('/api/admin/loans', {
      method: 'POST',
      body: form.value,
    })
    successMessage.value = 'บันทึกคำขอสินเชื่อสำเร็จ'
    await navigateTo(`/admin/loans/${loan.id}/edit?created=1`)
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <NuxtLink to="/admin/loans" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการสินเชื่อ
    </NuxtLink>
    <p class="text-sm text-slate-600">
      บันทึกคำขอสินเชื่อแทนลูกค้า (สำหรับทดสอบหรือกรอกให้โดยตรง)
    </p>
    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>
    <LoanApplicationForm v-model="form" :saving="saving" @submit="onSubmit" />
  </div>
</template>
