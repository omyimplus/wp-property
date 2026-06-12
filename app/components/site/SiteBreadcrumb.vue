<script setup lang="ts">
export type BreadcrumbItem = {
  label: string
  to?: string
}

const props = withDefaults(defineProps<{
  items: BreadcrumbItem[]
  variant?: 'default' | 'light'
}>(), {
  variant: 'default',
})
</script>

<template>
  <nav
    aria-label="Breadcrumb"
    class="text-sm"
    :class="variant === 'light' ? 'text-white/55' : 'text-slate-500'"
  >
    <ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="inline-flex min-w-0 max-w-full items-center gap-1.5"
      >
        <span
          v-if="index > 0"
          aria-hidden="true"
          :class="variant === 'light' ? 'text-white/30' : 'text-slate-300'"
        >
          /
        </span>
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="truncate transition"
          :class="variant === 'light'
            ? 'text-white/80 hover:text-white'
            : 'hover:text-slate-800'"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="truncate"
          :class="variant === 'light' ? 'text-white' : 'text-slate-700'"
          aria-current="page"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
