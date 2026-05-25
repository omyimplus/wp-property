<script setup lang="ts">
import {
  LOAN_LIST_PAGE_SIZE,
  LOAN_STATUS_TABS,
  emptyLoanFilters,
  loanLocationText,
  loanOccupationLabel,
  loanStatusLabel,
  staffDisplayName,
  type LoanApplicationListFilters,
  type LoanApplicationListItem,
  type LoanApplicationStatus,
} from '~/types/loan-application'
import { formatThaiPrice } from '~/types/property'
import type { ThaiLocationValue } from '~/types/thai-location'

definePageMeta({ layout: 'admin', title: 'สินเชื่อ' })

const filters = reactive(emptyLoanFilters())
const draftFilters = reactive({
  min_debt: '',
  max_debt: '',
  province: '',
  district: '',
  subdistrict: '',
})
const filterDialogOpen = ref(false)
const loans = ref<LoanApplicationListItem[]>([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const total = ref(0)
const page = ref(1)
const totalPages = ref(1)
const actionId = ref<string | null>(null)
const detailLoan = ref<LoanApplicationListItem | null>(null)

const rangeLabel = computed(() => {
  if (total.value === 0) return 'ไม่พบรายการ'
  const from = (page.value - 1) * LOAN_LIST_PAGE_SIZE + 1
  const to = Math.min(page.value * LOAN_LIST_PAGE_SIZE, total.value)
  return `แสดง ${from}–${to} จาก ${total.value} รายการ`
})

const pageNumbers = computed(() => {
  const pages: number[] = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) {
    pages.push(i)
  }
  return pages
})

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

function buildQuery() {
  const q: Record<string, string> = {
    status: filters.status,
    page: String(page.value),
    page_size: String(LOAN_LIST_PAGE_SIZE),
  }
  if (filters.min_debt) q.min_debt = filters.min_debt
  if (filters.max_debt) q.max_debt = filters.max_debt
  if (filters.province) q.province = filters.province
  if (filters.district) q.district = filters.district
  if (filters.subdistrict) q.subdistrict = filters.subdistrict
  return q
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{
      loans: LoanApplicationListItem[]
      total: number
      page: number
      total_pages: number
    }>('/api/admin/loans', { query: buildQuery() })
    loans.value = res.loans
    total.value = res.total
    page.value = res.page
    totalPages.value = res.total_pages
    if (detailLoan.value) {
      const fresh = res.loans.find(l => l.id === detailLoan.value!.id)
      detailLoan.value = fresh ?? null
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

function setStatusTab(status: LoanApplicationStatus) {
  filters.status = status
  page.value = 1
  detailLoan.value = null
  load()
}

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  load()
}

function openDetail(row: LoanApplicationListItem) {
  detailLoan.value = row
}

function closeDetail() {
  detailLoan.value = null
}

function createdByText(row: LoanApplicationListItem) {
  if (row.created_source === 'customer_web') {
    return 'ลูกค้าส่งจากเว็บ'
  }
  return staffDisplayName(row.created_by_name, row.created_by_email)
}

function handledByText(row: LoanApplicationListItem) {
  if (!row.handled_by) return '—'
  return staffDisplayName(row.handled_by_name, row.handled_by_email)
}

function formatHandledAt(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

async function patchStatus(
  row: LoanApplicationListItem,
  status: LoanApplicationStatus,
  event?: Event,
) {
  event?.stopPropagation()
  const confirmMessages: Record<LoanApplicationStatus, string> = {
    pending_approval: `ย้อนกลับสถานะคำขอของ「${row.customer_name}」เป็นรอดำเนินการ?`,
    completed: `บันทึกว่าติดต่อ / ดำเนินการแล้วสำหรับ「${row.customer_name}」?`,
    rejected: `ไม่อนุมัติคำขอของ「${row.customer_name}」?`,
  }
  if (!confirm(confirmMessages[status])) return
  actionId.value = row.id
  try {
    await $fetch(`/api/admin/loans/${row.id}/status`, { method: 'PATCH', body: { status } })
    const successMessages: Record<LoanApplicationStatus, string> = {
      pending_approval: 'ย้อนกลับเป็นรอดำเนินการแล้ว',
      completed: 'บันทึกว่าดำเนินการแล้ว',
      rejected: 'ไม่อนุมัติแล้ว',
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

async function onDelete(row: LoanApplicationListItem, event?: Event) {
  event?.stopPropagation()
  if (row.status !== 'rejected') return
  if (!confirm(`ลบคำขอของ ${row.customer_name} ออกจากระบบถาวร?`)) return
  actionId.value = row.id
  try {
    await $fetch(`/api/admin/loans/${row.id}`, { method: 'DELETE' })
    successMessage.value = `ลบรายการของ ${row.customer_name} แล้ว`
    closeDetail()
    if (loans.value.length <= 1 && page.value > 1) page.value--
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'ลบไม่สำเร็จ'
  } finally {
    actionId.value = null
  }
}

const route = useRoute()
onMounted(() => {
  const st = route.query.status as string
  if (st === 'pending_approval' || st === 'rejected' || st === 'completed') {
    filters.status = st
  }
  load()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">สินเชื่อ</h2>
        <p class="mt-1 text-sm text-slate-500">คลิกแถวเพื่อดูรายละเอียด · ใช้ไอคอนติ๊ก/กากบาทเปลี่ยนสถานะ</p>
      </div>
      <NuxtLink
        to="/admin/loans/create"
        class="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
      >
        + รับคำขอสินเชื่อ
      </NuxtLink>
    </div>

    <div class="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
      <button
        v-for="st in LOAN_STATUS_TABS"
        :key="st.id"
        type="button"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition"
        :class="filters.status === st.id ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-50'"
        @click="setStatusTab(st.id)"
      >
        {{ st.label }}
      </button>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm hover:bg-slate-50"
        @click="filterDialogOpen = true"
      >
        ค้นหา / กรอง
      </button>
      <p class="text-sm text-slate-600">{{ rangeLabel }}</p>
    </div>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div v-if="loading" class="p-12 text-center text-slate-500">กำลังโหลด...</div>
      <div v-else-if="loans.length === 0" class="p-12 text-center text-slate-500">
        ไม่พบรายการ
      </div>
      <table v-else class="w-full min-w-[640px] text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">ชื่อ</th>
            <th class="px-4 py-3 font-medium">เบอร์โทร</th>
            <th class="px-4 py-3 font-medium">ไลน์ / ติดต่อ</th>
            <th class="px-4 py-3 font-medium text-right">หนี้ที่ต้องการปิด</th>
            <th v-if="filters.status !== 'pending_approval'" class="px-4 py-3 font-medium">
              ผู้จัดการ
            </th>
            <th class="w-28 px-4 py-3 font-medium text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="row in loans"
            :key="row.id"
            class="cursor-pointer text-slate-800 transition hover:bg-sky-50/50"
            @click="openDetail(row)"
          >
            <td class="px-4 py-3 font-medium">{{ row.customer_name }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.callback_phone }}</td>
            <td class="px-4 py-3">{{ row.callback_line }}</td>
            <td class="px-4 py-3 text-right font-medium tabular-nums">
              {{ formatThaiPrice(row.debt_amount) }}
            </td>
            <td
              v-if="filters.status !== 'pending_approval'"
              class="px-4 py-3 text-slate-600"
            >
              {{ handledByText(row) }}
            </td>
            <td class="px-4 py-3" @click.stop>
              <div class="flex items-center justify-center gap-1">
                <template v-if="row.status === 'pending_approval'">
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-green-700 hover:bg-green-50 disabled:opacity-40"
                    title="ติดต่อแล้ว / ดำเนินการแล้ว"
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
                    title="ไม่อนุมัติ"
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
                    title="ย้อนกลับเป็นรอดำเนินการ"
                    :disabled="actionId === row.id"
                    @click="patchStatus(row, 'pending_approval', $event)"
                  >
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a4 4 0 014 4v0M3 10l4-4M3 10l4 4" />
                    </svg>
                  </button>
                </template>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-sky-700 hover:bg-sky-50"
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

    <div
      v-if="!loading && total > 0"
      class="flex flex-wrap justify-center gap-2"
    >
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
        :class="pn === page ? 'bg-sky-700 text-white' : 'border border-slate-300'"
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

    <!-- กรอง -->
    <div
      v-if="filterDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="filterDialogOpen = false"
    >
      <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-semibold">กรองคำขอสินเชื่อ</h3>
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium">หนี้ต่ำสุด</label>
              <input v-model="draftFilters.min_debt" type="number" min="0" class="w-full rounded-lg border px-3 py-2 text-sm">
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">หนี้สูงสุด</label>
              <input v-model="draftFilters.max_debt" type="number" min="0" class="w-full rounded-lg border px-3 py-2 text-sm">
            </div>
          </div>
          <ThaiLocationSelect v-model="draftLocation" label-size="filter" />
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="filterDialogOpen = false">
            ยกเลิก
          </button>
          <button
            type="button"
            class="rounded-lg bg-sky-700 px-4 py-2 text-sm text-white"
            @click="filters.min_debt = draftFilters.min_debt; filters.max_debt = draftFilters.max_debt; filters.province = draftFilters.province; filters.district = draftFilters.district; filters.subdistrict = draftFilters.subdistrict; filterDialogOpen = false; page = 1; load()"
          >
            ค้นหา
          </button>
        </div>
      </div>
    </div>

    <!-- รายละเอียด -->
    <div
      v-if="detailLoan"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      @click.self="closeDetail"
    >
      <div
        class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-labelledby="loan-detail-title"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 id="loan-detail-title" class="text-lg font-semibold text-slate-900">
              {{ detailLoan.customer_name }}
            </h3>
            <div class="mt-1 flex flex-wrap items-center gap-2">
              <LoanApplicationStatusBadge :status="detailLoan.status" />
              <LoanCreatedSourceBadge :source="detailLoan.created_source" />
            </div>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="ปิด"
            @click="closeDetail"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <dl class="space-y-3 text-sm">
          <div class="grid grid-cols-[8rem_1fr] gap-2">
            <dt class="text-slate-500">เบอร์โทร</dt>
            <dd>{{ detailLoan.callback_phone }}</dd>
          </div>
          <div class="grid grid-cols-[8rem_1fr] gap-2">
            <dt class="text-slate-500">ไลน์ / ติดต่อ</dt>
            <dd>{{ detailLoan.callback_line }}</dd>
          </div>
          <div class="grid grid-cols-[8rem_1fr] gap-2">
            <dt class="text-slate-500">หนี้ที่ต้องการปิด</dt>
            <dd class="font-medium">{{ formatThaiPrice(detailLoan.debt_amount) }}</dd>
          </div>
          <div class="grid grid-cols-[8rem_1fr] gap-2">
            <dt class="text-slate-500">สถาบันเจ้าหนี้</dt>
            <dd>{{ detailLoan.creditor_count }} แห่ง</dd>
          </div>
          <div class="grid grid-cols-[8rem_1fr] gap-2">
            <dt class="text-slate-500">รายได้/เดือน</dt>
            <dd>{{ formatThaiPrice(detailLoan.monthly_income) }}</dd>
          </div>
          <div class="grid grid-cols-[8rem_1fr] gap-2">
            <dt class="text-slate-500">อาชีพ</dt>
            <dd>{{ loanOccupationLabel(detailLoan.occupation_kind, detailLoan.occupation_other) }}</dd>
          </div>
          <div class="grid grid-cols-[8rem_1fr] gap-2">
            <dt class="text-slate-500">พื้นที่อาศัย</dt>
            <dd>{{ loanLocationText(detailLoan) }}</dd>
          </div>
          <div class="grid grid-cols-[8rem_1fr] gap-2 border-t border-slate-100 pt-3">
            <dt class="text-slate-500">สร้างโดย</dt>
            <dd>
              {{ createdByText(detailLoan) }}
              <span v-if="detailLoan.created_source === 'admin' && detailLoan.created_by" class="block text-xs text-slate-400">
                user: {{ detailLoan.created_by }}
              </span>
            </dd>
          </div>
          <div
            v-if="detailLoan.handled_by"
            class="grid grid-cols-[8rem_1fr] gap-2"
          >
            <dt class="text-slate-500">จัดการโดย</dt>
            <dd>
              {{ handledByText(detailLoan) }}
              <span v-if="detailLoan.handled_at" class="block text-xs text-slate-400">
                {{ formatHandledAt(detailLoan.handled_at) }}
              </span>
            </dd>
          </div>
          <div class="grid grid-cols-[8rem_1fr] gap-2 text-xs text-slate-400">
            <dt>สถานะ</dt>
            <dd>{{ loanStatusLabel(detailLoan.status) }}</dd>
          </div>
        </dl>

        <div class="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <NuxtLink
            v-if="detailLoan.status === 'pending_approval'"
            :to="`/admin/loans/${detailLoan.id}/edit`"
            class="flex-1 rounded-lg border border-slate-300 py-2 text-center text-sm hover:bg-slate-50"
            @click="closeDetail"
          >
            แก้ไขข้อมูล
          </NuxtLink>
          <template v-if="detailLoan.status === 'pending_approval'">
            <button
              type="button"
              class="rounded-lg p-2 text-green-700 hover:bg-green-50 disabled:opacity-40"
              title="ติดต่อแล้ว"
              :disabled="actionId === detailLoan.id"
              @click="patchStatus(detailLoan, 'completed')"
            >
              <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-red-700 hover:bg-red-50 disabled:opacity-40"
              title="ไม่อนุมัติ"
              :disabled="actionId === detailLoan.id"
              @click="patchStatus(detailLoan, 'rejected')"
            >
              <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </template>
          <button
            v-else
            type="button"
            class="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-40"
            title="ย้อนกลับเป็นรอดำเนินการ"
            :disabled="actionId === detailLoan.id"
            @click="patchStatus(detailLoan, 'pending_approval')"
          >
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a4 4 0 014 4v0M3 10l4-4M3 10l4 4" />
            </svg>
            ย้อนกลับสถานะ
          </button>
          <button
            v-if="detailLoan.status === 'rejected'"
            type="button"
            class="w-full rounded-lg border border-red-300 bg-red-50 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
            :disabled="actionId === detailLoan.id"
            @click="onDelete(detailLoan)"
          >
            ลบออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
