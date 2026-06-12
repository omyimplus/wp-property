<script setup lang="ts">
import type { InterestingContentListItem } from '~/types/interesting-content'

const props = withDefaults(
  defineProps<{
    item: Pick<InterestingContentListItem, 'id' | 'title' | 'excerpt' | 'cover_url'>
    to: string
    variant?: 'home' | 'list'
  }>(),
  { variant: 'list' },
)

const coverFallback = '/images/content/content-1.png'
</script>

<template>
  <NuxtLink
    :to="to"
    class="group block w-full overflow-hidden transition"
    :class="
      variant === 'home'
        ? 'aspect-[3/4] rounded-2xl bg-slate-100'
        : 'rounded-2xl bg-white shadow-sm hover:shadow-md'
    "
    :aria-label="item.title"
  >
    <div
      v-if="variant === 'list'"
      class="aspect-[3/4] overflow-hidden bg-slate-100"
    >
      <img
        :src="item.cover_url || coverFallback"
        :alt="item.title"
        class="h-full w-full object-cover transition group-hover:scale-[1.02]"
      >
    </div>
    <img
      v-else
      :src="item.cover_url || coverFallback"
      :alt="item.title"
      class="h-full w-full object-cover transition group-hover:scale-[1.02]"
    >

    <div v-if="variant === 'list'" class="p-4">
      <h2 class="font-medium text-wp-navy">{{ item.title }}</h2>
      <p v-if="item.excerpt" class="mt-1 line-clamp-2 text-sm text-slate-600">
        {{ item.excerpt }}
      </p>
    </div>
  </NuxtLink>
</template>
