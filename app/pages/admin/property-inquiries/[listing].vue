<script setup lang="ts">
import {
  PROPERTY_INQUIRY_LIST_PAGE_SIZE,
  PROPERTY_INQUIRY_LISTING_TABS,
  PROPERTY_INQUIRY_STATUS_TABS,
  emptyPropertyInquiryFilters,
  propertyInquiryHeadline,
  propertyInquiryListingLabel,
  propertyInquiryStatusLabel,
  type PropertyInquiryListItem,
  type PropertyInquiryListingType,
  type PropertyInquiryStatus,
} from '~/types/property-inquiry'
import { staffDisplayName } from '~/types/rental-request'

const route = useRoute()
const listing = computed(() => {
  const value = String(route.params.listing)
  return value === 'rent' ? 'rent' : 'sale' satisfies PropertyInquiryListingType
})

definePageMeta({ layout: 'admin' })

useHead({
  title: () => (listing.value === 'rent' ? 'สนใจเช่า' : 'สนใจซื้อ'),
})

const filters = reactive(emptyPropertyInquiryFilters(listing.value))
const inquiries = ref<PropertyInquiryListItem[]>([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const total = ref(0)
const page = ref(1)
const totalPages = ref(1)
const actionId = ref<string | null>(null)
const detailInquiry = ref<PropertyInquiryListItem | null>(null)

watch(listing, (next) => {
  filters.listing = next
  filters.status = 'pending_approval'
  page.value = 1
  detailInquiry.value = null
  load()
})

const pageTitle = computed(() =>
  listing.value === 'rent' ? 'สนใจเช่า' : 'สนใจซื้อ',
)

const rangeLabel = computed(() => {
  if (total.value === 0) return 'ไม่พบรายการ'
  const from = (page.value - 1) * PROPERTY_INQUIRY_LIST_PAGE_SIZE + 1
  const to = Math.min(page.value * PROPERTY_INQUIRY_LIST_PAGE_SIZE, total.value)
  return `แสดง ${from}–${to} จาก ${total.value} รายการ`
})

const pageNumbers = computed(() => {
  const pages: number[] = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) {
    pages.push(i)
  }
  return pages
})

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{
      inquiries: PropertyInquiryListItem[]
      total: number
      page: number
      total_pages: number
    }>('/api/admin/property-inquiries', {
      query: {
        listing: filters.listing,
        status: filters.status,
        page: String(page.value),
        page_size: String(PROPERTY_INQUIRY_LIST_PAGE_SIZE),
      },
    })
    inquiries.value = res.inquiries
    total.value = res.total
    page.value = res.page
    totalPages.value = res.total_pages
    if (detailInquiry.value) {
      detailInquiry.value = res.inquiries.find(i => i.id === detailInquiry.value!.id) ?? null
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

function setStatusTab(status: PropertyInquiryStatus) {
  filters.status = status
  page.value = 1
  detailInquiry.value = null
  load()
}

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  load()
}

function openDetail(row: PropertyInquiryListItem) {
  detailInquiry.value = row
}

function closeDetail() {
  detailInquiry.value = null
}

function handledByText(row: PropertyInquiryListItem) {
  if (!row.handled_by) return '—'
  return staffDisplayName(row.handled_by_name, row.handled_by_email)
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

async function patchStatus(
  row: PropertyInquiryListItem,
  status: PropertyInquiryStatus,
  event?: Event,
) {
  event?.stopPropagation()
  const confirmMessages: Record<PropertyInquiryStatus, string> = {
    pending_approval: `ย้อนกลับสถานะของ「${row.customer_name}」เป็นรอติดต่อ?`,
    completed: `บันทึกว่าติดต่อแล้วสำหรับ「${row.customer_name}」?`,
    rejected: `ปิดคำขอของ「${row.customer_name}」?`,
  }
  if (!confirm(confirmMessages[status])) return
  actionId.value = row.id
  try {
    await $fetch(`/api/admin/property-inquiries/${row.id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    const successMessages: Record<PropertyInquiryStatus, string> = {
      pending_approval: 'ย้อนกลับเป็นรอติดต่อแล้ว',
      completed: 'บันทึกว่าติดต่อแล้ว',
      rejected: 'ปิดคำขอแล้ว',
    }
    successMessage.value = successMessages[status]
    if (filters.status !== status) {
      filters.status = status
      page.value = 1
    }
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'อัปเดตไม่สำเร็จ'
  } finally {
    actionId.value = null
  }
}

async function onDelete(row: PropertyInquiryListItem, event?: Event) {
  event?.stopPropagation()
  if (row.status !== 'rejected') return
  if (!confirm(`ลบคำขอของ ${row.customer_name} ออกจากระบบถาวร?`)) return
  actionId.value = row.id
  try {
    await $fetch(`/api/admin/property-inquiries/${row.id}`, { method: 'DELETE' })
    successMessage.value = `ลบรายการของ ${row.customer_name} แล้ว`
    closeDetail()
    if (inquiries.value.length <= 1 && page.value > 1) page.value--
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'ลบไม่สำเร็จ'
  } finally {
    actionId.value = null
  }
}

onMounted(() => {
  const st = route.query.status as string
  if (st === 'pending_approval' || st === 'rejected' || st === 'completed') {
    filters.status = st
  }
  filters.listing = listing.value
  load()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">{{ pageTitle }}</h2>
        <p class="mt-1 text-sm text-slate-500">
          คำขอจากเว็บไซต์เมื่อลูกค้ากดติดต่อสอบถาม — ประเภท{{ propertyInquiryListingLabel(listing) }}
        </p>
      </div>
      <div class="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
        <NuxtLink
          v-for="tab in PROPERTY_INQUIRY_LISTING_TABS"
          :key="tab.id"
          :to="`/admin/property-inquiries/${tab.id}`"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition"
          :class="listing === tab.id ? 'bg-wp-navy text-white' : 'text-slate-600 hover:bg-slate-50'"
        >
          {{ tab.label }}
        </NuxtLink>
      </div>
    </div>

    <div class="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
      <button
        v-for="st in PROPERTY_INQUIRY_STATUS_TABS"
        :key="st.id"
        type="button"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition"
        :class="filters.status === st.id ? 'bg-wp-navy text-white' : 'text-slate-600 hover:bg-slate-50'"
        @click="setStatusTab(st.id)"
      >
        {{ st.label }}
      </button>
    </div>

    <p class="text-sm text-slate-600">{{ rangeLabel }}</p>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div v-if="loading" class="p-12 text-center text-slate-500">กำลังโหลด...</div>
      <div v-else-if="inquiries.length === 0" class="p-12 text-center text-slate-500">
        ไม่พบรายการ
      </div>
      <table v-else class="w-full min-w-[760px] text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">วันที่</th>
            <th class="px-4 py-3 font-medium">ทรัพย์</th>
            <th class="px-4 py-3 font-medium">ลูกค้า</th>
            <th class="px-4 py-3 font-medium">ติดต่อ</th>
            <th v-if="filters.status !== 'pending_approval'" class="px-4 py-3 font-medium">ผู้จัดการ</th>
            <th class="w-28 px-4 py-3 text-center font-medium">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="row in inquiries"
            :key="row.id"
            class="cursor-pointer text-slate-800 transition hover:bg-slate-50"
            @click="openDetail(row)"
          >
            <td class="px-4 py-3 whitespace-nowrap text-slate-600">
              {{ formatDateTime(row.created_at) }}
            </td>
            <td class="px-4 py-3">
              <p class="font-medium">{{ propertyInquiryHeadline(row) }}</p>
              <p class="mt-0.5 text-xs text-slate-500">{{ propertyInquiryStatusLabel(row.status) }}</p>
            </td>
            <td class="px-4 py-3 font-medium">{{ row.customer_name }}</td>
            <td class="px-4 py-3">
              <p>{{ row.callback_phone }}</p>
              <p class="text-xs text-slate-500">{{ row.callback_line }}</p>
            </td>
            <td v-if="filters.status !== 'pending_approval'" class="px-4 py-3 text-slate-600">
              {{ handledByText(row) }}
            </td>
            <td class="px-4 py-3" @click.stop>
              <div class="flex items-center justify-center gap-1">
                <template v-if="row.status === 'pending_approval'">
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-green-700 hover:bg-green-50 disabled:opacity-40"
                    title="ติดต่อแล้ว"
                    :disabled="actionId === row.id"
                    @click="patchStatus(row, 'completed', $event)"
                  >
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-40"
                    title="ปิด"
                    :disabled="actionId === row.id"
                    @click="patchStatus(row, 'rejected', $event)"
                  >
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    title="ย้อนกลับเป็นรอติดต่อ"
                    :disabled="actionId === row.id"
                    @click="patchStatus(row, 'pending_approval', $event)"
                  >
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a4 4 0 014 4v0M3 10l4-4M3 10l4 4" />
                    </svg>
                  </button>
                  <button
                    v-if="row.status === 'rejected'"
                    type="button"
                    class="rounded-lg p-1.5 text-red-700 hover:bg-red-50 disabled:opacity-40"
                    title="ลบถาวร"
                    :disabled="actionId === row.id"
                    @click="onDelete(row, $event)"
                  >
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </template>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-wp-navy hover:bg-slate-100"
                  title="ดูรายละเอียด"
                  @click="openDetail(row)"
                >
                  <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && total > 0" class="flex flex-wrap justify-center gap-2">
      <button
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
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
        :class="pn === page ? 'bg-wp-navy text-white' : 'border border-slate-300'"
        @click="goToPage(pn)"
      >
        {{ pn }}
      </button>
      <button
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
        :disabled="page >= totalPages"
        @click="goToPage(page + 1)"
      >
        ถัดไป
      </button>
    </div>

    <div
      v-if="detailInquiry"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      @click.self="closeDetail"
    >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">รายละเอียดคำขอ</h3>
            <p class="mt-1 text-sm text-slate-500">{{ formatDateTime(detailInquiry.created_at) }}</p>
          </div>
          <button type="button" class="text-sm text-slate-500 hover:text-slate-800" @click="closeDetail">
            ปิด
          </button>
        </div>

        <dl class="mt-5 space-y-3 text-sm">
          <div>
            <dt class="text-slate-500">ประเภท</dt>
            <dd>{{ propertyInquiryListingLabel(detailInquiry.listing_type) }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">ทรัพย์</dt>
            <dd class="font-medium text-slate-900">{{ propertyInquiryHeadline(detailInquiry) }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">ลูกค้า</dt>
            <dd>{{ detailInquiry.customer_name }}</dd>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <dt class="text-slate-500">โทร</dt>
              <dd>{{ detailInquiry.callback_phone }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Line / ติดต่อ</dt>
              <dd>{{ detailInquiry.callback_line }}</dd>
            </div>
          </div>
          <div v-if="detailInquiry.note">
            <dt class="text-slate-500">ข้อความ</dt>
            <dd class="whitespace-pre-wrap text-slate-800">{{ detailInquiry.note }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">สถานะ</dt>
            <dd>{{ propertyInquiryStatusLabel(detailInquiry.status) }}</dd>
          </div>
          <div v-if="detailInquiry.handled_at">
            <dt class="text-slate-500">จัดการโดย</dt>
            <dd>{{ handledByText(detailInquiry) }} · {{ formatDateTime(detailInquiry.handled_at) }}</dd>
          </div>
        </dl>

        <div class="mt-6 flex flex-wrap gap-2">
          <a
            v-if="detailInquiry.property_url"
            :href="detailInquiry.property_url"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            ดูหน้าทรัพย์
          </a>
          <NuxtLink
            v-if="detailInquiry.property_id"
            :to="`/admin/properties/${detailInquiry.property_id}/edit`"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            แก้ไขทรัพย์
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
