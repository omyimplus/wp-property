<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
    <p class="font-medium text-slate-700">{{ title }}</p>
    <p class="mt-2 text-sm">กำลังพัฒนา — โมดูลนี้จะเชื่อมกับ Supabase ในขั้นถัดไป</p>
  </div>
</template>
