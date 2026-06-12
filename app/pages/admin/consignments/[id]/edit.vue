<script setup lang="ts">
import {
  propertyCustomerToFormData,
  type PropertyCustomer,
  type PropertyCustomerFormData,
  type PropertyCustomerImage,
} from '~/types/property-customer'

definePageMeta({ layout: 'admin', title: 'แก้ไขฝากขายทรัพย์' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const form = ref<PropertyCustomerFormData | null>(null)
const consignment = ref<PropertyCustomer | null>(null)
const images = ref<PropertyCustomerImage[]>([])
const loading = ref(true)
const saving = ref(false)
const approving = ref(false)
const errorMessage = ref('')
const successMessage = ref(route.query.created ? 'บันทึกฝากขายสำเร็จ' : '')

const isApproved = computed(() => Boolean(consignment.value?.property_id))
const isRejected = computed(() => consignment.value?.status === 'rejected')
const isReadonly = computed(() => isApproved.value || isRejected.value)
const deleting = ref(false)

useHead({
  title: computed(() => {
    if (isApproved.value) return 'ดูรายละเอียดฝากขายทรัพย์'
    if (isRejected.value) return 'รายการฝากขาย (ไม่อนุมัติ)'
    return 'แก้ไขฝากขายทรัพย์'
  }),
})

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ consignment: PropertyCustomer }>(
      `/api/admin/consignments/${id.value}`,
    )
    consignment.value = res.consignment
    form.value = propertyCustomerToFormData(res.consignment)
    images.value = res.consignment.images ?? []
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!form.value || isApproved.value) return
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch(`/api/admin/consignments/${id.value}`, {
      method: 'PATCH',
      body: form.value,
    })
    successMessage.value = 'บันทึกข้อมูลสำเร็จ'
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

async function onApprove() {
  if (!confirm('อนุมัติเข้าระบบอสังหาริมทรัพย์? ระบบจะสร้างทรัพย์และรหัส WP ใหม่')) return
  approving.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ property_code: string, property: { id: string } }>(
      `/api/admin/consignments/${id.value}/approve`,
      { method: 'POST' },
    )
    successMessage.value = `อนุมัติแล้ว — สร้างทรัพย์ ${res.property_code}`
    await navigateTo(`/admin/properties/${res.property.id}/edit?from=consignment`)
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'อนุมัติไม่สำเร็จ'
  } finally {
    approving.value = false
  }
}

async function onPermanentDelete() {
  if (!consignment.value || isApproved.value) return
  if (consignment.value.status !== 'rejected') {
    errorMessage.value = 'ลบออกจากระบบได้เฉพาะรายการ「ไม่อนุมัติ」'
    return
  }
  if (
    !confirm(
      `ลบ「${consignment.value.customer_name}」ออกจากระบบถาวร?\n\nจะลบข้อมูลและไฟล์รูปทั้งหมด`,
    )
  ) {
    return
  }
  deleting.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/consignments/${id.value}`, { method: 'DELETE' })
    await navigateTo('/admin/consignments?status=rejected')
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'ลบไม่สำเร็จ'
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-4">
    <NuxtLink to="/admin/consignments" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการฝากขาย
    </NuxtLink>

    <div
      v-if="isApproved && consignment?.property_code"
      class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
    >
      อนุมัติเข้าระบบแล้ว — รหัสทรัพย์
      <NuxtLink
        :to="`/admin/properties/${consignment.property_id}/edit`"
        class="font-semibold underline hover:no-underline"
      >
        {{ consignment.property_code }}
      </NuxtLink>
    </div>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <div v-if="loading" class="py-12 text-center text-slate-500">กำลังโหลด...</div>

    <template v-else-if="form">
      <div
        v-if="isReadonly && !isApproved"
        class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      >
        โหมดดูข้อมูล — รายการนี้ไม่อนุมัติแล้ว แก้ไขไม่ได้
      </div>

      <div
        v-else-if="isApproved"
        class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
      >
        โหมดดูข้อมูล — รายการอนุมัติแล้ว แก้ไขได้ที่หน้าทรัพย์ในระบบ
      </div>

      <div
        v-if="isRejected"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
      >
        รายการนี้ไม่อนุมัติ — สามารถลบออกจากระบบถาวร (ข้อมูล + ไฟล์รูป) ได้
      </div>

      <div v-if="!isApproved" class="flex flex-wrap justify-end gap-2">
        <button
          v-if="isRejected"
          type="button"
          class="rounded-lg border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60"
          :disabled="deleting || saving || approving"
          @click="onPermanentDelete"
        >
          {{ deleting ? 'กำลังลบ...' : 'ลบออกจากระบบ (ข้อมูล + รูป)' }}
        </button>
        <button
          v-if="!isRejected"
          type="button"
          class="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          :disabled="approving || saving || deleting"
          @click="onApprove"
        >
          {{ approving ? 'กำลังอนุมัติ...' : 'อนุมัติเข้าระบบ (สร้างรหัส WP)' }}
        </button>
      </div>

      <PropertyForm
        v-model="form"
        mode="consignment"
        :property-id="id"
        :images="images"
        :saving="saving"
        :readonly="isReadonly"
        @update:images="images = $event"
        @submit="onSubmit"
      />
    </template>
  </div>
</template>
