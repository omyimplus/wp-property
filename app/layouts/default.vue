<script setup lang="ts">
const navLinks = [
  { label: 'หน้าแรก', to: '/' },
  { label: 'เกี่ยวกับเรา', to: '#' },
  { label: 'บริการสินเชื่อ', to: '#' },
  { label: 'อสังหาริมทรัพย์', to: '#' },
  { label: 'ระบบสินเชื่อและทรัพย์', to: '#' },
  { label: 'ติดต่อเรา', to: '#' },
]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white shadow-sm">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <NuxtLink to="/" class="text-lg font-semibold tracking-tight text-slate-900">
          WP Property
        </NuxtLink>
        <nav class="flex flex-wrap gap-1 text-sm">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.label"
            :to="link.to"
            class="rounded-md px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            active-class="bg-slate-100 font-medium text-slate-900"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
      <p>&copy; {{ new Date().getFullYear() }} WP Property. สินเชื่อและอสังหาริมทรัพย์</p>
    </footer>
  </div>
</template>
