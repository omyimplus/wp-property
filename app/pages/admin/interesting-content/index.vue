<script setup lang="ts">
import {
  INTERESTING_CONTENT_STATUS_TABS,
  interestingContentStatusLabel,
  type InterestingContentListItem,
  type InterestingContentStatus,
} from '~/types/interesting-content'

definePageMeta({ layout: 'admin', title: 'คอนเทนต์ที่น่าสนใจ' })

const statusFilter = ref<InterestingContentStatus | 'all'>('all')
const items = ref<InterestingContentListItem[]>([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const actionId = ref<string | null>(null)

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const query: Record<string, string> = {}
    if (statusFilter.value !== 'all') {
      query.status = statusFilter.value
    }
    const res = await $fetch<{ items: InterestingContentListItem[], total: number }>(
      '/api/admin/interesting-content',
      { query },
    )
    items.value = res.items
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

function setTab(id: InterestingContentStatus | 'all') {
  statusFilter.value = id
  load()
}

async function onDelete(row: InterestingContentListItem) {
  if (!confirm(`ลบ「${row.title}」ถาวร?`)) return
  actionId.value = row.id
  try {
    await $fetch(`/api/admin/interesting-content/${row.id}`, { method: 'DELETE' })
    successMessage.value = 'ลบแล้ว'
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'ลบไม่สำเร็จ'
  } finally {
    actionId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">คอนเทนต์ที่น่าสนใจ</h2>
        <p class="mt-1 text-sm text-slate-500">จัดการการ์ดบนหน้าแรก — รูป + เนื้อหา rich text</p>
      </div>
      <NuxtLink
        to="/admin/interesting-content/create"
        class="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
      >
        + เพิ่มคอนเทนต์
      </NuxtLink>
    </div>

    <div class="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
      <button
        v-for="tab in INTERESTING_CONTENT_STATUS_TABS"
        :key="tab.id"
        type="button"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition"
        :class="statusFilter === tab.id ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-50'"
        @click="setTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div v-if="loading" class="p-12 text-center text-slate-500">กำลังโหลด...</div>
      <div v-else-if="items.length === 0" class="p-12 text-center text-slate-500">ไม่พบรายการ</div>
      <table v-else class="w-full min-w-[640px] text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">รูป</th>
            <th class="px-4 py-3 font-medium">หัวข้อ</th>
            <th class="px-4 py-3 font-medium">สถานะ</th>
            <th class="px-4 py-3 font-medium text-center">ลำดับ</th>
            <th class="px-4 py-3 font-medium text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="row in items" :key="row.id" class="text-slate-800">
            <td class="px-4 py-3">
              <img
                v-if="row.cover_url"
                :src="row.cover_url"
                alt=""
                class="h-14 w-10 rounded object-cover"
              >
              <span v-else class="text-slate-400">—</span>
            </td>
            <td class="px-4 py-3 font-medium">{{ row.title }}</td>
            <td class="px-4 py-3">{{ interestingContentStatusLabel(row.status) }}</td>
            <td class="px-4 py-3 text-center tabular-nums">{{ row.sort_order }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <NuxtLink
                  :to="`/admin/interesting-content/${row.id}/edit`"
                  class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  แก้ไข
                </NuxtLink>
                <button
                  type="button"
                  class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-40"
                  :disabled="actionId === row.id"
                  @click="onDelete(row)"
                >
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
