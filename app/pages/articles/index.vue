<script setup lang="ts">
import type { ArticleListItem } from '~/types/article'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()

const { data, pending, error } = await useFetch<{ items: ArticleListItem[] }>('/api/articles')

useStaticPageSeo('pages.articles.title', 'pages.articles.subtitle')
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.articles.title')" :subtitle="t('pages.articles.subtitle')" />

    <section id="articles" class="py-12">
      <div class="site-container">
        <div v-if="pending" class="py-12 text-center text-slate-500">
          {{ t('pages.common.loading') }}
        </div>

        <p v-else-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ t('pages.articles.loadError') }}
        </p>

        <p v-else-if="!data?.items.length" class="py-12 text-center text-slate-500">
          {{ t('pages.articles.empty') }}
        </p>

        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="item in data.items"
            :key="item.id"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <NuxtLink :to="localePath(`/articles/${item.slug}`)">
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
              <div class="p-5">
                <h2 class="text-base font-medium text-wp-navy sm:text-lg">
                  {{ item.title }}
                </h2>
                <p v-if="item.excerpt" class="mt-2 line-clamp-2 text-sm text-slate-600">
                  {{ item.excerpt }}
                </p>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
