<script setup lang="ts">
import { emptyPropertyForm, type PropertyFormData, type PropertyImage } from '~/types/property'

definePageMeta({ layout: 'admin', title: 'เพิ่มอสังหาริมทรัพย์' })

const form = ref<PropertyFormData>(emptyPropertyForm())
const propertyId = ref<string | null>(null)
const images = ref<PropertyImage[]>([])
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const created = ref(false)
const propertyFormRef = ref<{ scrollToImages?: () => void } | null>(null)

onMounted(async () => {
  try {
    const { property_code } = await $fetch<{ property_code: string }>(
      '/api/admin/properties/next-code',
    )
    form.value.property_code = property_code
  } catch {
    form.value.property_code = 'WP-0001'
  }
})

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { property } = await $fetch<{ property: { id: string, property_code: string } }>(
      '/api/admin/properties',
      { method: 'POST', body: form.value },
    )
    propertyId.value = property.id
    form.value.property_code = property.property_code
    created.value = true
    successMessage.value = `บันทึกสำเร็จ — รหัส ${property.property_code} กำลังอัปโหลดรูปที่เลือกไว้ (ถ้ามี)`
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
    <NuxtLink to="/admin/properties" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการทรัพย์
    </NuxtLink>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <PropertyForm
      ref="propertyFormRef"
      v-model="form"
      :property-id="propertyId"
      :images="images"
      :saving="saving"
      code-readonly
      @update:images="images = $event"
      @submit="onSubmit"
    >
      <template v-if="created" #actions>
        <NuxtLink
          :to="`/admin/properties/${propertyId}/edit`"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          ไปหน้าแก้ไข
        </NuxtLink>
      </template>
    </PropertyForm>
  </div>
</template>
