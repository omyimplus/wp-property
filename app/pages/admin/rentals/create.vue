<script setup lang="ts">
import { emptyRentalForm, type RentalRequestFormData } from '~/types/rental-request'

definePageMeta({ layout: 'admin', title: 'รับคำขอเช่า' })

const form = ref<RentalRequestFormData>(emptyRentalForm())
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { rental } = await $fetch<{ rental: { id: string } }>('/api/admin/rentals', {
      method: 'POST',
      body: form.value,
    })
    successMessage.value = 'บันทึกคำขอเช่าสำเร็จ'
    await navigateTo(`/admin/rentals/${rental.id}/edit?created=1`)
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
    <NuxtLink to="/admin/rentals" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการเช่าทรัพย์
    </NuxtLink>
    <p class="text-sm text-slate-600">
      บันทึกคำขอเช่าแทนลูกค้า (สำหรับทดสอบหรือกรอกให้โดยตรง)
    </p>
    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>
    <RentalRequestForm v-model="form" :saving="saving" @submit="onSubmit" />
  </div>
</template>
