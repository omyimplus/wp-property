<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  title: 'แดชบอร์ด',
})

const { profile, displayName, roleLabel } = useStaffProfile()
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-900">ยินดีต้อนรับสู่ระบบหลังบ้าน</h2>
      <p class="mt-2 text-slate-600">
        แดชบอร์ดสำหรับพนักงาน ติดตามคำขอสินเชื่อ เช่าทรัพย์ ฝากขาย และอสังหาริมทรัพย์จากหน้าบ้าน
      </p>
      <p v-if="profile" class="mt-4 text-sm text-slate-500">
        เข้าสู่ระบบในฐานะ:
        <span class="font-medium text-slate-700">{{ displayName }}</span>
        <span v-if="roleLabel" class="text-slate-400"> ({{ roleLabel }})</span>
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in [
          { label: 'สินเชื่อ', value: '—' },
          { label: 'เช่าทรัพย์', value: '—' },
          { label: 'ฝากขายทรัพย์', value: '—' },
          { label: 'อสังหาริมทรัพย์', value: '—' },
        ]"
        :key="card.label"
        class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ card.value }}</p>
      </div>
    </div>
  </div>
</template>
