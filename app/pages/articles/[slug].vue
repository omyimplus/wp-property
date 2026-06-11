<script setup lang="ts">
import { siteArticles } from '~/data/site-routes'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const article = computed(() =>
  siteArticles.find(a => a.slug === route.params.slug),
)

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found' })
}

useHead({ title: () => t(`home.articles.items.${article.value!.id}.title`) })
</script>

<template>
  <div v-if="article">
    <SitePageHero
      :title="t(`home.articles.items.${article.id}.title`)"
      :subtitle="t('pages.articles.published')"
    />

    <article class="py-10">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <NuxtLink :to="localePath('/articles')" class="text-sm text-slate-500 hover:text-slate-800">
          ← {{ t('pages.articles.back') }}
        </NuxtLink>
        <img
          :src="article.image"
          :alt="t(`home.articles.items.${article.id}.title`)"
          class="mt-6 aspect-video w-full rounded-2xl object-cover"
        >
        <p class="mt-6 text-sm leading-relaxed text-slate-700 sm:text-base">
          {{ t(`home.articles.items.${article.id}.excerpt`) }}
        </p>
        <p class="mt-4 text-sm leading-relaxed text-slate-600">
          {{ t('pages.articles.placeholderBody') }}
        </p>
      </div>
    </article>
  </div>
</template>
