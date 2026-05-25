<script setup lang="ts">
import {
  PROPERTY_LIST_PAGE_SIZE,
  PROPERTY_STATUSES,
  PROPERTY_SOURCE_FILTER_OPTIONS,
  PROPERTY_STATUS_TABS,
  PROPERTY_TYPES,
  propertySourceLabel,
  propertyStatusLabel,
  emptyPropertyFilters,
  formatThaiPrice,
  propertyListingHeadline,
  propertyTypeLabel,
  type ListingTab,
  type Property,
  type PropertyListFilters,
  type PropertySourceFilter,
  type PropertyStatus,
} from '~/types/property'
import type { ThaiLocationValue } from '~/types/thai-location'

definePageMeta({ layout: 'admin', title: 'อสังหาริมทรัพย์' })

type PropertyListItem = Property & {
  image_count?: number
  cover_url?: string | null
  image_urls?: string[]
}

const galleryOpen = ref(false)
const galleryProperty = ref<PropertyListItem | null>(null)
const galleryStartIndex = ref(0)

const statusDialogOpen = ref(false)
const statusTarget = ref<PropertyListItem | null>(null)
const newStatus = ref<PropertyStatus>('pending_approval')
const statusSaving = ref(false)
const statusSuccessMessage = ref('')
type FilterFields = Omit<PropertyListFilters, 'listing' | 'status' | 'property_source'>

const tabs: { id: ListingTab; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'sale', label: 'ขาย' },
  { id: 'rent', label: 'เช่า' },
]

const filters = reactive(emptyPropertyFilters())
const draftFilters = reactive<FilterFields>({
  property_type: '',
  min_price: '',
  max_price: '',
  province: '',
  district: '',
  subdistrict: '',
})
const filterDialogOpen = ref(false)
const properties = ref<PropertyListItem[]>([])
const loading = ref(true)
const errorMessage = ref('')
const total = ref(0)
const page = ref(1)
const totalPages = ref(1)

function openGallery(p: PropertyListItem, startIndex = 0) {
  if (!p.image_urls?.length) return
  galleryProperty.value = p
  galleryStartIndex.value = startIndex
  galleryOpen.value = true
}

function closeGallery() {
  galleryOpen.value = false
  galleryProperty.value = null
}

function buildQueryParams() {
  const q: Record<string, string> = {
    listing: filters.listing,
    status: filters.status,
    page: String(page.value),
    page_size: String(PROPERTY_LIST_PAGE_SIZE),
  }
  if (filters.property_type) q.property_type = filters.property_type
  if (filters.min_price) q.min_price = filters.min_price
  if (filters.max_price) q.max_price = filters.max_price
  if (filters.province) q.province = filters.province
  if (filters.district) q.district = filters.district
  if (filters.subdistrict) q.subdistrict = filters.subdistrict
  if (filters.property_source) q.property_source = filters.property_source
  return q
}

const rangeLabel = computed(() => {
  if (total.value === 0) return 'ไม่พบรายการ'
  const from = (page.value - 1) * PROPERTY_LIST_PAGE_SIZE + 1
  const to = Math.min(page.value * PROPERTY_LIST_PAGE_SIZE, total.value)
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

function locationText(p: PropertyListItem) {
  const parts = [p.subdistrict, p.district, p.province].filter(Boolean)
  return parts.length ? parts.join(' · ') : '—'
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{
      properties: PropertyListItem[]
      total: number
      page: number
      total_pages: number
    }>('/api/admin/properties', {
      query: buildQueryParams(),
    })
    properties.value = res.properties
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

function setStatusTab(status: PropertyStatus) {
  filters.status = status
  page.value = 1
  load()
}

function setSourceFilter(source: PropertySourceFilter) {
  filters.property_source = source
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
  filters.property_source = ''
  filters.property_type = ''
  filters.min_price = ''
  filters.max_price = ''
  filters.province = ''
  filters.district = ''
  filters.subdistrict = ''
  page.value = 1
  load()
}

function openStatusDialog(p: PropertyListItem) {
  statusTarget.value = p
  newStatus.value = p.status
  statusDialogOpen.value = true
}

function closeStatusDialog() {
  statusDialogOpen.value = false
  statusTarget.value = null
}

async function saveStatus() {
  if (!statusTarget.value) return
  statusSaving.value = true
  errorMessage.value = ''
  statusSuccessMessage.value = ''
  try {
    await $fetch(`/api/admin/properties/${statusTarget.value.id}/status`, {
      method: 'PATCH',
      body: { status: newStatus.value },
    })
    statusSuccessMessage.value = `อัปเดตสถานะ ${statusTarget.value.property_code} เป็น「${propertyStatusLabel(newStatus.value)}」แล้ว`
    closeStatusDialog()
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'อัปเดตสถานะไม่สำเร็จ'
  } finally {
    statusSaving.value = false
  }
}

async function onDelete(p: PropertyListItem) {
  if (!confirm(`ลบทรัพย์ ${p.property_code} และรูปทั้งหมด?`)) return
  try {
    await $fetch(`/api/admin/properties/${p.id}`, { method: 'DELETE' })
    if (properties.value.length <= 1 && page.value > 1) page.value--
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'ลบไม่สำเร็จ'
  }
}

const priceFilterLabel = computed(() => {
  if (filters.listing === 'rent') return 'ราคาเช่า / เดือน'
  if (filters.listing === 'sale') return 'ราคาขาย'
  return 'ราคา (ขายหรือเช่า)'
})

const activeFilterCount = computed(() => {
  let n = 0
  if (filters.property_source) n++
  if (filters.property_type) n++
  if (filters.min_price || filters.max_price) n++
  if (filters.province || filters.district || filters.subdistrict) n++
  return n
})

const activeFilterSummary = computed(() => {
  const parts: string[] = []
  if (filters.property_source) {
    parts.push(propertySourceLabel(filters.property_source))
  }
  if (filters.property_type) {
    parts.push(propertyTypeLabel(filters.property_type))
  }
  if (filters.min_price || filters.max_price) {
    const min = filters.min_price ? formatThaiPrice(Number(filters.min_price)) : '—'
    const max = filters.max_price ? formatThaiPrice(Number(filters.max_price)) : '—'
    parts.push(`${priceFilterLabel.value}: ${min} – ${max}`)
  }
  const loc = [filters.subdistrict, filters.district, filters.province].filter(Boolean)
  if (loc.length) parts.push(loc.join(' '))
  return parts
})

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">อสังหาริมทรัพย์</h2>
        <p class="mt-1 text-sm text-slate-500">แยกรายการขายและเช่า · กดค้นหาเพื่อกรองข้อมูล</p>
      </div>
      <NuxtLink
        to="/admin/properties/create"
        class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        + เพิ่มทรัพย์
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
          class="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white"
        >
          {{ activeFilterCount }}
        </span>
      </button>
      </div>

      <div class="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
        <button
          v-for="st in PROPERTY_STATUS_TABS"
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

      <div class="flex flex-wrap gap-1 rounded-lg border border-violet-100 bg-violet-50/50 p-1">
        <button
          v-for="opt in PROPERTY_SOURCE_FILTER_OPTIONS"
          :key="opt.value || 'all'"
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition"
          :class="filters.property_source === opt.value
            ? 'bg-violet-700 text-white'
            : 'text-violet-800 hover:bg-white/80'"
          @click="setSourceFilter(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <p class="text-sm text-slate-600">
      {{ rangeLabel }}
    </p>

    <div
      v-if="activeFilterSummary.length"
      class="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
    >
      <span class="font-medium">กรอง:</span>
      <span
        v-for="(chip, i) in activeFilterSummary"
        :key="i"
        class="rounded-full bg-white/80 px-2.5 py-0.5 text-xs"
      >
        {{ chip }}
      </span>
      <button
        type="button"
        class="text-xs underline hover:no-underline"
        @click="clearAppliedFilters"
      >
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
      v-else-if="properties.length === 0"
      class="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500"
    >
      ไม่พบทรัพย์ตามเงื่อนไข
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="p in properties"
        :key="p.id"
        class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div class="relative aspect-video bg-slate-100">
          <button
            v-if="p.image_urls?.length"
            type="button"
            class="block h-full w-full cursor-zoom-in"
            @click="openGallery(p, 0)"
          >
            <img
              :src="p.cover_url!"
              :alt="propertyListingHeadline(p)"
              class="h-full w-full object-cover transition hover:opacity-95"
            >
          </button>
          <div
            v-else
            class="flex h-full items-center justify-center text-sm text-slate-400"
          >
            ไม่มีรูป
          </div>
        </div>
        <div class="p-4">
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap gap-1">
              <PropertyStatusBadge :status="p.status" />
              <PropertySourceBadge :source="p.property_source ?? 'system'" />
            </div>
            <div class="flex shrink-0 flex-wrap gap-1">
              <span
                v-if="p.for_sale"
                class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
              >
                ขาย
              </span>
              <span
                v-if="p.for_rent"
                class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
              >
                เช่า
              </span>
            </div>
          </div>
          <p class="font-semibold leading-snug text-slate-900">
            {{ propertyListingHeadline(p) }}
          </p>
          <p class="mt-0.5 text-sm text-slate-500">
            {{ propertyTypeLabel(p.property_type) }}
            <span v-if="p.project_name"> · {{ p.project_name }}</span>
          </p>
          <p class="mt-1 text-xs text-slate-400">{{ locationText(p) }}</p>
          <div class="mt-2 space-y-0.5 text-sm">
            <p v-if="p.for_sale && filters.listing !== 'rent'" class="font-medium text-amber-800">
              ขาย {{ formatThaiPrice(p.sale_price) }}
            </p>
            <p v-if="p.for_rent && filters.listing !== 'sale'" class="font-medium text-emerald-800">
              เช่า {{ formatThaiPrice(p.rent_price) }}/เดือน
              <span v-if="p.rent_deposit_months" class="text-slate-500">
                · มัดจำ {{ p.rent_deposit_months }} เดือน
              </span>
            </p>
          </div>
          <p class="mt-1 text-xs text-slate-400">
            {{ p.image_count ?? 0 }} รูป
            <span v-if="p.image_urls?.length"> · คลิกรูปเพื่อดูสไลด์</span>
          </p>
          <div class="mt-3 flex flex-col gap-2">
            <div class="flex gap-2">
              <NuxtLink
                :to="`/admin/properties/${p.id}/edit`"
                class="flex-1 rounded-lg border border-slate-300 py-1.5 text-center text-sm hover:bg-slate-50"
              >
                แก้ไข
              </NuxtLink>
              <button
                type="button"
                class="flex-1 rounded-lg border border-amber-300 bg-amber-50 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
                @click="openStatusDialog(p)"
              >
                อัปเดตสถานะ
              </button>
            </div>
            <button
              type="button"
              class="w-full rounded-lg border border-red-200 py-1.5 text-sm text-red-700 hover:bg-red-50"
              @click="onDelete(p)"
            >
              ลบ
            </button>
          </div>
        </div>
      </article>
    </div>

    <div
      v-if="!loading && total > 0"
      class="flex flex-wrap items-center justify-center gap-2 pt-2"
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
        v-for="p in pageNumbers"
        :key="p"
        type="button"
        class="min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm"
        :class="p === page
          ? 'bg-slate-900 font-medium text-white'
          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'"
        @click="goToPage(p)"
      >
        {{ p }}
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

    <!-- Dialog อัปเดตสถานะ -->
    <div
      v-if="statusDialogOpen && statusTarget"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="closeStatusDialog"
    >
      <div
        class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-labelledby="status-dialog-title"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 id="status-dialog-title" class="text-lg font-semibold text-slate-900">
            อัปเดตสถานะทรัพย์
          </h3>
          <button
            type="button"
            class="rounded-md p-1 text-slate-400 hover:bg-slate-100"
            aria-label="ปิด"
            @click="closeStatusDialog"
          >
            ✕
          </button>
        </div>

        <p class="text-sm font-medium text-slate-900">
          {{ propertyListingHeadline(statusTarget) }}
        </p>
        <p class="mt-2 text-sm text-slate-500">
          สถานะปัจจุบัน:
          <span class="ml-1 inline-flex align-middle">
            <PropertyStatusBadge :status="statusTarget.status" />
          </span>
        </p>

        <div class="mt-4">
          <label class="mb-1 block text-sm font-medium text-slate-700">สถานะใหม่</label>
          <select
            v-model="newStatus"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option v-for="s in PROPERTY_STATUSES" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            :disabled="statusSaving"
            @click="closeStatusDialog"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            :disabled="statusSaving || newStatus === statusTarget.status"
            @click="saveStatus"
          >
            {{ statusSaving ? 'กำลังบันทึก...' : 'บันทึกสถานะ' }}
          </button>
        </div>
      </div>
    </div>

    <PropertyImageGalleryDialog
      v-if="galleryProperty"
      :open="galleryOpen"
      :property-code="galleryProperty.property_code"
      :listing-title="galleryProperty.listing_title"
      :status="galleryProperty.status"
      :image-urls="galleryProperty.image_urls ?? []"
      :initial-index="galleryStartIndex"
      @close="closeGallery"
    />

    <!-- Dialog ตัวกรอง -->
    <div
      v-if="filterDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="closeFilterDialog"
    >
      <div
        class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-labelledby="filter-dialog-title"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 id="filter-dialog-title" class="text-lg font-semibold text-slate-900">
            ค้นหา / กรองทรัพย์
          </h3>
          <button
            type="button"
            class="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="ปิด"
            @click="closeFilterDialog"
          >
            ✕
          </button>
        </div>

        <p class="mb-4 text-sm text-slate-500">
          แท็บ {{ tabs.find(t => t.id === filters.listing)?.label }} — กรองเพิ่มด้านล่าง
        </p>

        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">ประเภททรัพย์</label>
            <select
              v-model="draftFilters.property_type"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">ทั้งหมด</option>
              <option v-for="t in PROPERTY_TYPES" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ priceFilterLabel }} ต่ำสุด
              </label>
              <input
                v-model="draftFilters.min_price"
                type="number"
                min="0"
                placeholder="ไม่จำกัด"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ priceFilterLabel }} สูงสุด
              </label>
              <input
                v-model="draftFilters.max_price"
                type="number"
                min="0"
                placeholder="ไม่จำกัด"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
            </div>
          </div>

          <div>
            <p class="mb-2 text-sm font-medium text-slate-700">ที่ตั้ง (ไม่บังคับ)</p>
            <ThaiLocationSelect
              v-model="draftLocation"
              label-size="filter"
            />
          </div>
        </div>

        <div class="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            @click="resetDraftFilters"
          >
            ล้างในฟอร์ม
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            @click="closeFilterDialog"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            @click="applyFiltersFromDialog"
          >
            ค้นหา
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
