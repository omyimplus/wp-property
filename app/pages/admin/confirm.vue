<script setup lang="ts">
definePageMeta({
  layout: 'admin-guest',
})

const { ensureStaffSession } = useAdminAuth()
const status = ref<'loading' | 'ok' | 'error'>('loading')

onMounted(async () => {
  const ok = await ensureStaffSession()
  if (ok) {
    status.value = 'ok'
    await navigateTo('/admin')
    return
  }

  status.value = 'error'
  await navigateTo('/admin/login?error=unauthorized')
})
</script>

<template>
  <div class="text-center text-slate-600">
    <p v-if="status === 'loading'">กำลังยืนยันการเข้าสู่ระบบ...</p>
    <p v-else-if="status === 'error'">ไม่สามารถยืนยันตัวตนได้ กำลังนำกลับไปหน้าเข้าสู่ระบบ...</p>
  </div>
</template>
