<script setup lang="ts">
import type { ArticleListItem } from '~/types/article'
import { absoluteSiteUrl } from '~/utils/site-url'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => String(route.params.slug))

const { data, error, pending } = await useFetch<{ item: ArticleListItem }>(
  () => `/api/articles/${slug.value}`,
)

const article = computed(() => data.value?.item)

if (!pending.value && (error.value || !article.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found' })
}

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('pages.articles.title'), to: localePath('/articles') },
  ...(article.value ? [{ label: article.value.title }] : []),
])

useSiteSeo({
  title: () => article.value?.title ?? t('pages.articles.title'),
  description: () => article.value?.excerpt ?? t('pages.articles.subtitle'),
  image: () => article.value?.cover_url ?? undefined,
  type: 'article',
  jsonLd: computed(() => (article.value
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.value.title,
        description: article.value.excerpt ?? undefined,
        image: article.value.cover_url ?? undefined,
        mainEntityOfPage: absoluteSiteUrl(config.public.siteUrl, route.path),
      }
    : undefined)),
})
</script>

<template>
  <article class="py-8 sm:py-10">
    <div class="site-container">
      <SiteBreadcrumb :items="breadcrumbItems" />

      <div v-if="pending" class="mt-8 text-slate-500">
        {{ t('pages.common.loading') }}
      </div>

      <div v-else-if="error" class="mt-8 text-red-600">
        {{ t('pages.articles.notFound') }}
      </div>

      <template v-else-if="article">
        <figure class="mt-6">
          <img
            v-if="article.cover_url"
            :src="article.cover_url"
            :alt="article.title"
            class="aspect-video w-full rounded-2xl object-cover"
          >
          <figcaption class="mt-4 sm:mt-5">
            <h1 class="text-2xl font-medium leading-snug text-slate-900 sm:text-3xl">
              {{ article.title }}
            </h1>
            <p v-if="article.excerpt" class="mt-2 text-base leading-relaxed text-slate-600">
              {{ article.excerpt }}
            </p>
          </figcaption>
        </figure>

        <div
          v-if="article.body_html"
          class="rich-content prose prose-slate mt-8 max-w-none sm:mt-10"
          v-html="article.body_html"
        />

        <NuxtLink
          :to="localePath('/articles')"
          class="mt-8 inline-block text-sm text-slate-500 hover:text-slate-800"
        >
          ← {{ t('pages.articles.back') }}
        </NuxtLink>
      </template>
    </div>
  </article>
</template>
