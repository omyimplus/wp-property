<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'site-admin',
  },
})

const route = useRoute()
const { profile, displayName, roleLabel, fetchProfile } = useStaffProfile()
const { signOut } = useAdminAuth()

const { totalPending, refreshPendingCounts, pendingForNav } = useDashboardPending()

const navItems = [
  { label: 'แดชบอร์ด', to: '/admin', icon: '◉' },
  { label: 'สินเชื่อ', to: '/admin/loans', icon: '◇' },
  { label: 'เช่าทรัพย์', to: '/admin/rentals', icon: '◇' },
  { label: 'ฝากขายทรัพย์', to: '/admin/consignments', icon: '◇' },
  { label: 'อสังหาริมทรัพย์', to: '/admin/properties', icon: '◇' },
  { label: 'ผู้ใช้งาน', to: '/admin/users', icon: '◇' },
]

let pendingTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (!profile.value) {
    fetchProfile()
  }
  refreshPendingCounts()
  pendingTimer = setInterval(refreshPendingCounts, 60_000)
})

onUnmounted(() => {
  if (pendingTimer) clearInterval(pendingTimer)
})
</script>

<template>
  <div class="flex min-h-screen bg-slate-100">
    <aside class="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-slate-100">
      <div class="border-b border-slate-700 px-4 py-5">
        <NuxtLink to="/admin" class="block text-sm font-semibold tracking-wide">
          WP Property
        </NuxtLink>
        <p class="mt-1 text-xs text-slate-400">ระบบหลังบ้าน</p>
      </div>

      <nav class="flex-1 space-y-0.5 p-3 text-sm">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          active-class="bg-slate-800 text-white"
        >
          <span class="text-xs opacity-60">{{ item.icon }}</span>
          <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
          <span
            v-if="pendingForNav(item.to) > 0"
            class="shrink-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-900"
            :title="`รอดำเนินการ ${pendingForNav(item.to)} รายการ`"
          >
            {{ pendingForNav(item.to) > 99 ? '99+' : pendingForNav(item.to) }}
          </span>
        </NuxtLink>
      </nav>

      <div class="border-t border-slate-700 p-3">
        <p class="truncate px-3 text-sm text-slate-200" :title="displayName">
          {{ displayName }}
        </p>
        <p v-if="roleLabel" class="truncate px-3 text-xs text-slate-400">
          {{ roleLabel }}
        </p>
        <button
          type="button"
          class="mt-2 w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          @click="signOut"
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
        <h1 class="text-lg font-semibold text-slate-900">
          {{ route.meta.title ?? 'แดชบอร์ด' }}
        </h1>
        <NuxtLink
          v-if="totalPending > 0 && route.path !== '/admin'"
          to="/admin"
          class="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-950 hover:bg-amber-200"
          role="alert"
        >
          {{ totalPending }} รายการรอดำเนินการ
        </NuxtLink>
      </header>

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
