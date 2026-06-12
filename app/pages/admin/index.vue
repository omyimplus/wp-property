<script setup lang="ts">
import {
  DASHBOARD_ALERT_TYPE_LABELS,
  type DashboardAlert,
  type DashboardSummary,
} from '~/types/dashboard'

definePageMeta({
  layout: 'admin',
  title: 'แดชบอร์ด',
})

const { profile, displayName, roleLabel } = useStaffProfile()

const summary = ref<DashboardSummary | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const lastUpdated = ref<Date | null>(null)

const statCards = computed(() => {
  const c = summary.value?.counts
  if (!c) return []
  return [
    {
      label: 'สินเชื่อ',
      sublabel: 'รอดำเนินการ',
      value: c.loans_pending,
      href: '/admin/loans?status=pending_approval',
      accent: 'sky',
    },
    {
      label: 'เช่าทรัพย์',
      sublabel: 'รอดำเนินการ',
      value: c.rentals_pending,
      href: '/admin/rentals?status=pending_approval',
      accent: 'emerald',
    },
    {
      label: 'ฝากขายทรัพย์',
      sublabel: 'รออนุมัติ',
      value: c.consignments_pending,
      href: '/admin/consignments?status=pending_approval',
      accent: 'violet',
    },
    {
      label: 'อสังหาริมทรัพย์',
      sublabel: 'รอเผยแพร่',
      value: c.properties_pending,
      href: '/admin/properties?status=pending_approval',
      accent: 'amber',
    },
    {
      label: 'สนใจซื้อ',
      sublabel: 'รอติดต่อ',
      value: c.property_inquiries_sale_pending,
      href: '/admin/property-inquiries/sale?status=pending_approval',
      accent: 'rose',
    },
    {
      label: 'สนใจเช่า',
      sublabel: 'รอติดต่อ',
      value: c.property_inquiries_rent_pending,
      href: '/admin/property-inquiries/rent?status=pending_approval',
      accent: 'pink',
    },
  ]
})

const hasUrgent = computed(() => (summary.value?.total_pending ?? 0) > 0)

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'เมื่อสักครู่'
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ชม.ที่แล้ว`
  const days = Math.floor(hours / 24)
  return `${days} วันที่แล้ว`
}

function alertBadgeClass(type: DashboardAlert['type']) {
  const map: Record<DashboardAlert['type'], string> = {
    loan: 'bg-sky-100 text-sky-900',
    rental: 'bg-emerald-100 text-emerald-900',
    consignment: 'bg-violet-100 text-violet-900',
    property: 'bg-amber-100 text-amber-900',
    property_inquiry: 'bg-rose-100 text-rose-900',
  }
  return map[type]
}

function cardRingClass(accent: string, count: number) {
  if (count <= 0) return 'border-slate-200'
  const rings: Record<string, string> = {
    sky: 'border-sky-300 ring-1 ring-sky-100',
    emerald: 'border-emerald-300 ring-1 ring-emerald-100',
    violet: 'border-violet-300 ring-1 ring-violet-100',
    amber: 'border-amber-300 ring-1 ring-amber-100',
    rose: 'border-rose-300 ring-1 ring-rose-100',
    pink: 'border-pink-300 ring-1 ring-pink-100',
  }
  return rings[accent] ?? 'border-slate-200'
}

async function loadSummary() {
  loading.value = true
  errorMessage.value = ''
  try {
    summary.value = await $fetch<DashboardSummary>('/api/admin/dashboard/summary')
    lastUpdated.value = new Date()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดแดชบอร์ดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  loadSummary()
  refreshTimer = setInterval(loadSummary, 60_000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">ยินดีต้อนรับสู่ระบบหลังบ้าน</h2>
        <p class="mt-2 max-w-xl text-slate-600">
          สรุปคำขอที่รอติดต่อกลับ — อัปเดตอัตโนมัติทุก 1 นาทีเมื่อเปิดหน้านี้
        </p>
        <p v-if="profile" class="mt-4 text-sm text-slate-500">
          เข้าสู่ระบบในฐานะ:
          <span class="font-medium text-slate-700">{{ displayName }}</span>
          <span v-if="roleLabel" class="text-slate-400"> ({{ roleLabel }})</span>
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        :disabled="loading"
        @click="loadSummary"
      >
        {{ loading ? 'กำลังโหลด...' : 'รีเฟรช' }}
      </button>
    </div>

    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
      {{ errorMessage }}
    </p>

    <!-- แจ้งเตือนหลัก -->
    <div
      v-else-if="!loading && hasUrgent"
      class="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 shadow-sm"
      role="alert"
      aria-live="polite"
    >
      <div class="flex flex-wrap items-start gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-lg" aria-hidden="true">
          !
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-amber-950">
            มี {{ summary!.total_pending }} รายการรอดำเนินการ
          </p>
          <p class="mt-1 text-sm text-amber-900">
            ติดต่อลูกค้ากลับผ่านเบอร์โทรหรือ Line ตามข้อมูลในคำขอ
          </p>
        </div>
      </div>
    </div>

    <div
      v-else-if="!loading && summary"
      class="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-900"
      role="status"
    >
      ไม่มีรายการค้าง — ทุกคำขอดำเนินการแล้ว
    </div>

    <div v-if="loading && !summary" class="py-8 text-center text-slate-500">
      กำลังโหลดสรุป...
    </div>

    <div v-else-if="summary" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        v-for="card in statCards"
        :key="card.label"
        :to="card.href"
        class="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
        :class="cardRingClass(card.accent, card.value)"
      >
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="text-xs text-slate-400">{{ card.sublabel }}</p>
        <p
          class="mt-2 text-3xl font-semibold tabular-nums"
          :class="card.value > 0 ? 'text-slate-900' : 'text-slate-400'"
        >
          {{ card.value }}
        </p>
        <p v-if="card.value > 0" class="mt-2 text-xs font-medium text-slate-600">
          ดูรายการ →
        </p>
      </NuxtLink>
    </div>

    <!-- รายการแจ้งเตือน -->
    <section
      v-if="summary && summary.alerts.length > 0"
      class="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
        <h3 class="font-semibold text-slate-900">รายการรอติดต่อกลับ</h3>
        <p v-if="lastUpdated" class="text-xs text-slate-400">
          อัปเดต {{ lastUpdated.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) }}
        </p>
      </div>
      <ul class="divide-y divide-slate-100">
        <li v-for="item in summary.alerts" :key="`${item.type}-${item.id}`">
          <NuxtLink
            :to="item.href"
            class="flex flex-wrap items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
          >
            <span
              class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="alertBadgeClass(item.type)"
            >
              {{ DASHBOARD_ALERT_TYPE_LABELS[item.type] }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-slate-900">{{ item.title }}</p>
              <p class="truncate text-sm text-slate-500">{{ item.subtitle }}</p>
            </div>
            <span class="shrink-0 text-xs text-slate-400">
              {{ formatRelativeTime(item.created_at) }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="rounded-xl border border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-600">
      <h3 class="font-medium text-slate-800">แนวทางแจ้งเตือน (ต่อไป)</h3>
      <ul class="mt-2 list-inside list-disc space-y-1">
        <li><strong>ตอนนี้:</strong> แดชบอร์ด + ตัวเลขค้าง — พนักงานเปิดหน้าแรกแล้วเห็นทันที</li>
        <li><strong>ขั้นถัดไป:</strong> แสดงจุดแดงที่เมนู sidebar เมื่อมีรายการรอ</li>
        <li><strong>ภายหลัง:</strong> แจ้ง Line / อีเมลเมื่อมีคำขอใหม่จากหน้าบ้าน</li>
      </ul>
    </section>
  </div>
</template>
