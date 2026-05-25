<script setup lang="ts">
import {
  PROPERTY_CUSTOMER_LIST_PAGE_SIZE,
  PROPERTY_CUSTOMER_STATUS_TABS,
  emptyPropertyCustomerFilters,
  propertyCustomerHeadline,
  type ListingTab,
  type PropertyCustomer,
  type PropertyCustomerListFilters,
  type PropertyCustomerStatus,
} from '~/types/property-customer'
import { formatThaiPrice, PROPERTY_TYPES, propertyTypeLabel } from '~/types/property'
import type { ThaiLocationValue } from '~/types/thai-location'

definePageMeta({ layout: 'admin', title: 'ฝากขายทรัพย์' })

type ConsignmentItem = PropertyCustomer & {
  image_count?: number
  cover_url?: string | null
  image_urls?: string[]
}

type FilterFields = Omit<PropertyCustomerListFilters, 'listing' | 'status'>

const tabs: { id: ListingTab; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'sale', label: 'ขาย' },
  { id: 'rent', label: 'เช่า' },
]

const filters = reactive(emptyPropertyCustomerFilters())
const draftFilters = reactive<FilterFields>({
  property_type: '',
  min_price: '',
  max_price: '',
  province: '',
  district: '',
  subdistrict: '',
})
const filterDialogOpen = ref(false)
const consignments = ref<ConsignmentItem[]>([])
const loading = ref(true)
const errorMessage = ref('')
const total = ref(0)
const page = ref(1)
const totalPages = ref(1)

const rejectingId = ref<string | null>(null)
const approvingId = ref<string | null>(null)
const statusSuccessMessage = ref('')

function buildQueryParams() {
  const q: Record<string, string> = {
    listing: filters.listing,
    status: filters.status,
    page: String(page.value),
    page_size: String(PROPERTY_CUSTOMER_LIST_PAGE_SIZE),
  }
  if (filters.property_type) q.property_type = filters.property_type
  if (filters.min_price) q.min_price = filters.min_price
  if (filters.max_price) q.max_price = filters.max_price
  if (filters.province) q.province = filters.province
  if (filters.district) q.district = filters.district
  if (filters.subdistrict) q.subdistrict = filters.subdistrict
  return q
}

const rangeLabel = computed(() => {
  if (total.value === 0) return 'ไม่พบรายการฝากขาย'
  const from = (page.value - 1) * PROPERTY_CUSTOMER_LIST_PAGE_SIZE + 1
  const to = Math.min(page.value * PROPERTY_CUSTOMER_LIST_PAGE_SIZE, total.value)
  return `แสดง ${from}–${to} จาก ${total.value} รายการ`
})

const pageNumbers = computed(() => {
  const n = totalPages.value
  const current = page.value
  const pages: number[] = []
  for (let i = Math.max(1, current - 2); i <= Math.min(n, current + 2); i++) {
    pages.push(i)
  }
  return pages
})

const priceFilterLabel = computed(() => {
  if (filters.listing === 'rent') return 'ราคาเช่า / เดือน'
  if (filters.listing === 'sale') return 'ราคาขาย'
  return 'ราคา (ขายหรือเช่า)'
})

const activeFilterCount = computed(() => {
  let n = 0
  if (filters.property_type) n++
  if (filters.min_price || filters.max_price) n++
  if (filters.province || filters.district || filters.subdistrict) n++
  return n
})

const activeFilterSummary = computed(() => {
  const parts: string[] = []
  if (filters.property_type) parts.push(propertyTypeLabel(filters.property_type))
  if (filters.min_price || filters.max_price) {
    const min = filters.min_price ? formatThaiPrice(Number(filters.min_price)) : '—'
    const max = filters.max_price ? formatThaiPrice(Number(filters.max_price)) : '—'
    parts.push(`${priceFilterLabel.value}: ${min} – ${max}`)
  }
  const loc = [filters.subdistrict, filters.district, filters.province].filter(Boolean)
  if (loc.length) parts.push(loc.join(' '))
  return parts
})

function locationText(p: ConsignmentItem) {
  const parts = [p.subdistrict, p.district, p.province].filter(Boolean)
  return parts.length ? parts.join(' · ') : '—'
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{
      consignments: ConsignmentItem[]
      total: number
      page: number
      total_pages: number
    }>('/api/admin/consignments', { query: buildQueryParams() })
    consignments.value = res.consignments
    total.value = res.total
    page.value = res.page
    totalPages.value = res.total_pages
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดรายการไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

function setListingTab(tab: ListingTab) {
  filters.listing = tab
  page.value = 1
  load()
}

function setStatusTab(status: PropertyCustomerStatus) {
  filters.status = status
  page.value = 1
  load()
}

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  load()
}

function openFilterDialog() {
  draftFilters.property_type = filters.property_type
  draftFilters.min_price = filters.min_price
  draftFilters.max_price = filters.max_price
  draftFilters.province = filters.province
  draftFilters.district = filters.district
  draftFilters.subdistrict = filters.subdistrict
  filterDialogOpen.value = true
}

function closeFilterDialog() {
  filterDialogOpen.value = false
}

function applyFiltersFromDialog() {
  filters.property_type = draftFilters.property_type
  filters.min_price = draftFilters.min_price
  filters.max_price = draftFilters.max_price
  filters.province = draftFilters.province
  filters.district = draftFilters.district
  filters.subdistrict = draftFilters.subdistrict
  filterDialogOpen.value = false
  page.value = 1
  load()
}

function resetDraftFilters() {
  draftFilters.property_type = ''
  draftFilters.min_price = ''
  draftFilters.max_price = ''
  draftFilters.province = ''
  draftFilters.district = ''
  draftFilters.subdistrict = ''
}

const draftLocation = computed<ThaiLocationValue>({
  get: () => ({
    province: draftFilters.province,
    district: draftFilters.district,
    subdistrict: draftFilters.subdistrict,
  }),
  set: (loc) => {
    draftFilters.province = loc.province
    draftFilters.district = loc.district
    draftFilters.subdistrict = loc.subdistrict
  },
})

function clearAppliedFilters() {
  resetDraftFilters()
  filters.property_type = ''
  filters.min_price = ''
  filters.max_price = ''
  filters.province = ''
  filters.district = ''
  filters.subdistrict = ''
  page.value = 1
  load()
}

async function onReject(p: ConsignmentItem) {
  if (p.property_id || p.status === 'rejected') return
  if (!confirm(`ไม่อนุมัติรายการของ「${p.customer_name}」?`)) return
  rejectingId.value = p.id
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/consignments/${p.id}/status`, {
      method: 'PATCH',
      body: { status: 'rejected' },
    })
    statusSuccessMessage.value = `ไม่อนุมัติรายการของ ${p.customer_name} แล้ว — สามารถลบออกจากระบบได้`
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'อัปเดตสถานะไม่สำเร็จ'
  } finally {
    rejectingId.value = null
  }
}

async function onApprove(p: ConsignmentItem) {
  if (!confirm(`อนุมัติ「${propertyCustomerHeadline(p)}」เข้าระบบ? จะสร้างรหัส WP ใหม่`)) return
  approvingId.value = p.id
  errorMessage.value = ''
  try {
    const res = await $fetch<{ property_code: string, property: { id: string } }>(
      `/api/admin/consignments/${p.id}/approve`,
      { method: 'POST' },
    )
    statusSuccessMessage.value = `อนุมัติแล้ว — สร้างทรัพย์ ${res.property_code}`
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'อนุมัติไม่สำเร็จ'
  } finally {
    approvingId.value = null
  }
}

async function onDelete(p: ConsignmentItem) {
  if (p.property_id) {
    errorMessage.value = 'รายการอนุมัติแล้ว — ลบได้ที่หน้าอสังหาริมทรัพย์'
    return
  }
  if (p.status !== 'rejected') {
    errorMessage.value = 'ลบออกจากระบบได้เฉพาะรายการ「ไม่อนุมัติ」'
    return
  }
  if (
    !confirm(
      `ลบ「${p.customer_name}」ออกจากระบบถาวร?\n\nจะลบข้อมูลฝากขายและไฟล์รูปทั้งหมด — กู้คืนไม่ได้`,
    )
  ) {
    return
  }
  try {
    await $fetch(`/api/admin/consignments/${p.id}`, { method: 'DELETE' })
    statusSuccessMessage.value = `ลบรายการของ ${p.customer_name} ออกจากระบบแล้ว`
    if (consignments.value.length <= 1 && page.value > 1) page.value--
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'ลบไม่สำเร็จ'
  }
}

const route = useRoute()

onMounted(() => {
  const st = route.query.status as string
  if (st === 'pending_approval' || st === 'rejected' || st === 'approved') {
    filters.status = st
  }
  load()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">ฝากขายทรัพย์</h2>
        <p class="mt-1 text-sm text-slate-500">
          เก็บในระบบแยกจากอสังหาริมทรัพย์ — อนุมัติแล้วจึงสร้างรหัส WP
        </p>
      </div>
      <NuxtLink
        to="/admin/consignments/create"
        class="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800"
      >
        + รับฝากขาย
      </NuxtLink>
    </div>

    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="rounded-md px-4 py-2 text-sm font-medium transition"
            :class="filters.listing === tab.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'"
            @click="setListingTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          @click="openFilterDialog"
        >
          <span>ค้นหา</span>
          <span
            v-if="activeFilterCount > 0"
            class="rounded-full bg-violet-600 px-2 py-0.5 text-xs text-white"
          >
            {{ activeFilterCount }}
          </span>
        </button>
      </div>

      <div class="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
        <button
          v-for="st in PROPERTY_CUSTOMER_STATUS_TABS"
          :key="st.id"
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition"
          :class="filters.status === st.id
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-50'"
          @click="setStatusTab(st.id)"
        >
          {{ st.label }}
        </button>
      </div>
    </div>

    <p class="text-sm text-slate-600">{{ rangeLabel }}</p>

    <div
      v-if="activeFilterSummary.length"
      class="flex flex-wrap items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-900"
    >
      <span class="font-medium">กรอง:</span>
      <span
        v-for="(chip, i) in activeFilterSummary"
        :key="i"
        class="rounded-full bg-white/80 px-2.5 py-0.5 text-xs"
      >
        {{ chip }}
      </span>
      <button type="button" class="text-xs underline" @click="clearAppliedFilters">
        ล้างตัวกรอง
      </button>
    </div>

    <p v-if="statusSuccessMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ statusSuccessMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <div v-if="loading" class="py-12 text-center text-slate-500">กำลังโหลด...</div>

    <div
      v-else-if="consignments.length === 0"
      class="rounded-xl border border-dashed border-violet-200 bg-white py-12 text-center text-slate-500"
    >
      ไม่พบรายการฝากขาย
    </div>

    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <article
        v-for="p in consignments"
        :key="p.id"
        class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div class="border-b border-violet-100 bg-violet-50/60 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-wide text-violet-700">ลูกค้า</p>
          <p class="font-semibold text-slate-900">{{ p.customer_name }}</p>
          <p class="text-sm text-slate-600">
            {{ p.customer_phone }}
            <span v-if="p.customer_line"> · Line {{ p.customer_line }}</span>
          </p>
        </div>

        <div class="flex gap-4 p-4">
          <div class="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            <img
              v-if="p.cover_url"
              :src="p.cover_url"
              :alt="propertyCustomerHeadline(p)"
              class="h-full w-full object-cover"
            >
            <div v-else class="flex h-full items-center justify-center text-xs text-slate-400">
              ไม่มีรูป
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex flex-wrap gap-2">
              <PropertyCustomerStatusBadge :status="p.status" />
              <span
                v-if="p.property_code"
                class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
              >
                {{ p.property_code }}
              </span>
            </div>
            <p class="font-semibold text-slate-900">{{ propertyCustomerHeadline(p) }}</p>
            <p class="text-sm text-slate-500">
              {{ propertyTypeLabel(p.property_type) }}
            </p>
            <p class="text-xs text-slate-400">{{ locationText(p) }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-2 border-t border-slate-100 px-4 py-3">
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              :to="`/admin/consignments/${p.id}/edit`"
              class="flex-1 rounded-lg border border-slate-300 py-1.5 text-center text-sm hover:bg-slate-50"
            >
              {{ p.property_id ? 'ดูรายการ' : 'แก้ไข' }}
            </NuxtLink>
            <button
              v-if="!p.property_id && p.status !== 'rejected'"
              type="button"
              class="flex-1 rounded-lg bg-emerald-700 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
              :disabled="approvingId === p.id"
              @click="onApprove(p)"
            >
              {{ approvingId === p.id ? 'กำลังอนุมัติ...' : 'อนุมัติเข้าระบบ' }}
            </button>
            <button
              v-if="!p.property_id && p.status !== 'rejected'"
              type="button"
              class="flex-1 rounded-lg border border-red-300 bg-red-50 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60"
              :disabled="rejectingId === p.id"
              @click="onReject(p)"
            >
              {{ rejectingId === p.id ? 'กำลังบันทึก...' : 'ไม่อนุมัติ' }}
            </button>
          </div>
          <NuxtLink
            v-if="p.property_id"
            :to="`/admin/properties/${p.property_id}/edit`"
            class="w-full rounded-lg border border-emerald-200 py-1.5 text-center text-sm text-emerald-800 hover:bg-emerald-50"
          >
            เปิดทรัพย์ในระบบ
          </NuxtLink>
          <button
            v-if="!p.property_id && p.status === 'rejected'"
            type="button"
            class="w-full rounded-lg border border-red-300 bg-red-50 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
            @click="onDelete(p)"
          >
            ลบออกจากระบบ (ข้อมูล + รูป)
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="!loading && total > 0"
      class="flex flex-wrap justify-center gap-2 pt-2"
    >
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
        :disabled="page <= 1"
        @click="goToPage(page - 1)"
      >
        ก่อนหน้า
      </button>
      <button
        v-for="pn in pageNumbers"
        :key="pn"
        type="button"
        class="min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm"
        :class="pn === page ? 'bg-violet-700 text-white' : 'border border-slate-300'"
        @click="goToPage(pn)"
      >
        {{ pn }}
      </button>
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="goToPage(page + 1)"
      >
        ถัดไป
      </button>
    </div>

    <div
      v-if="filterDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="closeFilterDialog"
    >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-semibold">ค้นหา / กรอง</h3>
        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium">ประเภททรัพย์</label>
            <select v-model="draftFilters.property_type" class="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">ทั้งหมด</option>
              <option v-for="t in PROPERTY_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <ThaiLocationSelect v-model="draftLocation" label-size="filter" />
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="closeFilterDialog">
            ยกเลิก
          </button>
          <button
            type="button"
            class="rounded-lg bg-violet-700 px-4 py-2 text-sm text-white"
            @click="applyFiltersFromDialog"
          >
            ค้นหา
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
