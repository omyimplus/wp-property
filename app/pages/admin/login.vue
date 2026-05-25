<script setup lang="ts">
import { authMessageFromQuery } from '~/utils/auth-messages'

definePageMeta({
  layout: 'admin-guest',
})

const route = useRoute()
const { signInWithEmail, ensureStaffSession } = useAdminAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref(authMessageFromQuery(route.query.error as string | undefined) ?? '')

onMounted(async () => {
  if (await ensureStaffSession()) {
    await navigateTo('/admin')
  }
})

async function onSubmit() {
  errorMessage.value = ''
  loading.value = true

  const { ok, error } = await signInWithEmail(email.value, password.value)

  loading.value = false

  if (!ok) {
    errorMessage.value = error ?? 'เข้าสู่ระบบไม่สำเร็จ'
    return
  }

  await navigateTo('/admin')
}
</script>

<template>
  <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
    <div class="mb-8 text-center">
      <h1 class="text-xl font-semibold text-slate-900">เข้าสู่ระบบหลังบ้าน</h1>
      <p class="mt-1 text-sm text-slate-500">สำหรับพนักงาน WP Property — เชื่อมต่อ Supabase Auth</p>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label for="email" class="mb-1 block text-sm font-medium text-slate-700">อีเมล</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-amber-500 focus:border-amber-500 focus:ring-2"
          placeholder="name@company.com"
        >
      </div>

      <div>
        <label for="password" class="mb-1 block text-sm font-medium text-slate-700">รหัสผ่าน</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-amber-500 focus:border-amber-500 focus:ring-2"
        >
      </div>

      <p
        v-if="errorMessage"
        class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>
    </form>

    <p class="mt-6 text-center text-xs text-slate-400">
      <NuxtLink to="/" class="underline hover:text-slate-600">กลับหน้าเว็บไซต์</NuxtLink>
    </p>
  </div>
</template>
