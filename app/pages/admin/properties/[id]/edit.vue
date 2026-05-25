<script setup lang="ts">
import {
  emptyPropertyForm,
  propertyToFormData,
  type Property,
  type PropertyFormData,
  type PropertyImage,
} from '~/types/property'

definePageMeta({ layout: 'admin', title: 'แก้ไขอสังหาริมทรัพย์' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const form = ref<PropertyFormData>(emptyPropertyForm())
const images = ref<PropertyImage[]>([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref(route.query.created ? 'สร้างทรัพย์สำเร็จ — อัปโหลดรูปได้ที่ส่วนรูปภาพด้านล่าง' : '')

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { property } = await $fetch<{ property: Property }>(`/api/admin/properties/${id.value}`)
    form.value = propertyToFormData(property)
    images.value = property.images ?? []
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch(`/api/admin/properties/${id.value}`, {
      method: 'PATCH',
      body: form.value,
    })
    successMessage.value = 'บันทึกข้อมูลสำเร็จ'
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

onMounted(load)
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

    <div v-if="loading" class="py-12 text-center text-slate-500">กำลังโหลด...</div>

    <PropertyForm
      v-else
      v-model="form"
      :property-id="id"
      :images="images"
      :saving="saving"
      code-readonly
      @update:images="images = $event"
      @submit="onSubmit"
    />
  </div>
</template>
