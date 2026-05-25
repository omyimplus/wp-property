<script setup lang="ts">
import {
  rentalCreatedSourceLabel,
  rentalDesiredAreaText,
  rentalToFormData,
  staffDisplayName,
  type RentalRequestListItem,
  type RentalRequestFormData,
} from '~/types/rental-request'

definePageMeta({ layout: 'admin', title: 'แก้ไขคำขอเช่า' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const form = ref<RentalRequestFormData | null>(null)
const rental = ref<RentalRequestListItem | null>(null)
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')
const successMessage = ref(route.query.created ? 'บันทึกคำขอเช่าสำเร็จ' : '')

const isRejected = computed(() => rental.value?.status === 'rejected')
const isCompleted = computed(() => rental.value?.status === 'completed')
const readonly = computed(() => isRejected.value || isCompleted.value)

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ rental: RentalRequestListItem }>(`/api/admin/rentals/${id.value}`)
    rental.value = res.rental
    form.value = rentalToFormData(res.rental)
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!form.value || readonly.value) return
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch(`/api/admin/rentals/${id.value}`, { method: 'PATCH', body: form.value })
    successMessage.value = 'บันทึกข้อมูลสำเร็จ'
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

async function setStatus(status: 'rejected' | 'completed' | 'pending_approval') {
  const labels = {
    rejected: 'ไม่อนุมัติ',
    completed: 'ดำเนินการแล้ว',
    pending_approval: 'รอดำเนินการ (ย้อนกลับ)',
  }
  if (!confirm(`ตั้งสถานะ「${labels[status]}」สำหรับ ${rental.value?.customer_name}?`)) return
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/rentals/${id.value}/status`, { method: 'PATCH', body: { status } })
    if (status === 'pending_approval') {
      await load()
      successMessage.value = 'ย้อนกลับเป็นรอดำเนินการแล้ว — แก้ไขข้อมูลได้'
    } else {
      await navigateTo(`/admin/rentals?status=${status}`)
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'อัปเดตสถานะไม่สำเร็จ'
  }
}

async function onDelete() {
  if (!rental.value || rental.value.status !== 'rejected') return
  if (!confirm(`ลบคำขอของ ${rental.value.customer_name} ออกจากระบบถาวร?`)) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/rentals/${id.value}`, { method: 'DELETE' })
    await navigateTo('/admin/rentals?status=rejected')
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
    <NuxtLink to="/admin/rentals" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการเช่าทรัพย์
    </NuxtLink>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <div v-if="loading" class="py-12 text-center text-slate-500">กำลังโหลด...</div>

    <template v-else-if="form && rental">
      <div class="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
        <p>
          <span class="font-medium text-slate-900">แหล่งที่มา:</span>
          {{ rentalCreatedSourceLabel(rental.created_source) }}
          <LoanCreatedSourceBadge :source="rental.created_source" class="ml-2 inline-flex align-middle" />
        </p>
        <p class="mt-1">
          <span class="font-medium text-slate-900">สร้างโดย:</span>
          {{
            rental.created_source === 'customer_web'
              ? 'ลูกค้าส่งจากเว็บ'
              : staffDisplayName(rental.created_by_name, rental.created_by_email)
          }}
          <span v-if="rental.created_by" class="text-xs text-slate-400">({{ rental.created_by }})</span>
        </p>
        <p v-if="rental.handled_by" class="mt-1">
          <span class="font-medium text-slate-900">จัดการโดย:</span>
          {{ staffDisplayName(rental.handled_by_name, rental.handled_by_email) }}
          <span v-if="rental.handled_at" class="text-xs text-slate-400">
            · {{ new Date(rental.handled_at).toLocaleString('th-TH') }}
          </span>
        </p>
        <p class="mt-1 text-slate-600">
          พื้นที่ต้องการเช่า: {{ rentalDesiredAreaText(rental) }}
        </p>
      </div>

      <div
        v-if="rental.status !== 'pending_approval'"
        class="flex flex-wrap justify-end gap-2"
      >
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
          title="ย้อนกลับเป็นรอดำเนินการ"
          @click="setStatus('pending_approval')"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a4 4 0 014 4v0M3 10l4-4M3 10l4 4" />
          </svg>
          ย้อนกลับสถานะ
        </button>
      </div>

      <div
        v-if="rental.status === 'pending_approval'"
        class="flex flex-wrap justify-end gap-2"
      >
        <button
          type="button"
          class="rounded-lg p-2 text-red-700 hover:bg-red-50"
          title="ไม่อนุมัติ"
          @click="setStatus('rejected')"
        >
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          type="button"
          class="rounded-lg p-2 text-green-700 hover:bg-green-50"
          title="ติดต่อแล้ว / ดำเนินการแล้ว"
          @click="setStatus('completed')"
        >
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div
        v-if="isRejected"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
      >
        <span>รายการนี้ไม่อนุมัติ — ลบออกจากระบบได้</span>
        <button
          type="button"
          class="rounded-lg border border-red-400 bg-white px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-50 disabled:opacity-60"
          :disabled="deleting"
          @click="onDelete"
        >
          {{ deleting ? 'กำลังลบ...' : 'ลบออกจากระบบ' }}
        </button>
      </div>

      <RentalRequestForm
        v-model="form"
        :saving="saving"
        :readonly="readonly"
        @submit="onSubmit"
      />
    </template>
  </div>
</template>
