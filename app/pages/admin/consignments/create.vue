<script setup lang="ts">
import {
  emptyPropertyCustomerForm,
  type PropertyCustomerFormData,
  type PropertyCustomerImage,
} from '~/types/property-customer'

definePageMeta({ layout: 'admin', title: 'รับฝากขายทรัพย์' })

const form = ref<PropertyCustomerFormData>(emptyPropertyCustomerForm())
const consignmentId = ref<string | null>(null)
const images = ref<PropertyCustomerImage[]>([])
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const created = ref(false)
const propertyFormRef = ref<{ scrollToImages?: () => void } | null>(null)

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { consignment } = await $fetch<{ consignment: { id: string } }>(
      '/api/admin/consignments',
      { method: 'POST', body: form.value },
    )
    consignmentId.value = consignment.id
    created.value = true
    successMessage.value = 'บันทึกฝากขายสำเร็จ — อัปโหลดรูปได้ด้านล่าง (ยังไม่มีรหัส WP จนกว่าจะอนุมัติ)'
    await nextTick()
    propertyFormRef.value?.scrollToImages?.()
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
    <NuxtLink to="/admin/consignments" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการฝากขาย
    </NuxtLink>

    <p class="text-sm text-slate-600">
      บันทึกรายการฝากขายแทนลูกค้า — ข้อมูลทรัพย์เหมือนหน้าเพิ่มอสังหาริมทรัพย์ (ยังไม่สร้างรหัส WP)
    </p>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <PropertyForm
      ref="propertyFormRef"
      v-model="form"
      mode="consignment"
      :property-id="consignmentId"
      :images="images"
      :saving="saving"
      @update:images="images = $event"
      @submit="onSubmit"
    >
      <template v-if="created" #actions>
        <NuxtLink
          :to="`/admin/consignments/${consignmentId}/edit`"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          ไปหน้าแก้ไข
        </NuxtLink>
      </template>
    </PropertyForm>
  </div>
</template>
