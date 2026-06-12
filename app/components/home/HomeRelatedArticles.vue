<script setup lang="ts">
import type { ArticleListItem } from '~/types/article'

const { t } = useI18n()
const localePath = useLocalePath()

const { data, pending } = await useFetch<{ items: ArticleListItem[] }>('/api/articles', {
  query: { limit: 3 },
})
</script>

<template>
  <section id="articles" class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8">
    <div class="site-container">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-2xl font-medium text-white sm:text-3xl">
          {{ t('home.articles.title') }}
        </h2>
        <NuxtLink
          :to="localePath('/articles')"
          class="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          {{ t('common.viewAll') }}
        </NuxtLink>
      </div>

      <div v-if="pending" class="mt-8 py-8 text-center text-sm text-white/70">
        {{ t('pages.common.loading') }}
      </div>

      <div
        v-else-if="data?.items.length"
        class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="item in data.items"
          :key="item.id"
          :to="localePath(`/articles/${item.slug}`)"
          class="block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
        >
          <div class="aspect-video overflow-hidden bg-slate-100">
            <OptimizedImage
              v-if="item.cover_url"
              :src="item.cover_url"
              :alt="item.title"
              :width="400"
              :height="225"
              :aspect-ratio="16 / 9"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="p-4 sm:p-5">
            <h3 class="truncate text-base font-medium text-wp-navy sm:text-lg">
              {{ item.title }}
            </h3>
            <p v-if="item.excerpt" class="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              {{ item.excerpt }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
