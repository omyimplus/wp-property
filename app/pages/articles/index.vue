<script setup lang="ts">
import { siteArticles } from '~/data/site-routes'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: () => t('pages.articles.title') })
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.articles.title')" :subtitle="t('pages.articles.subtitle')" />

    <section id="articles" class="py-12">
      <div class="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 sm:px-6">
        <article
          v-for="item in siteArticles"
          :key="item.id"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <NuxtLink :to="localePath(`/articles/${item.slug}`)">
            <div class="aspect-video overflow-hidden">
              <img
                :src="item.image"
                :alt="t(`home.articles.items.${item.id}.title`)"
                class="h-full w-full object-cover"
              >
            </div>
            <div class="p-5">
              <h2 class="text-base font-medium text-wp-navy sm:text-lg">
                {{ t(`home.articles.items.${item.id}.title`) }}
              </h2>
              <p class="mt-2 line-clamp-2 text-sm text-slate-600">
                {{ t(`home.articles.items.${item.id}.excerpt`) }}
              </p>
            </div>
          </NuxtLink>
        </article>
      </div>
    </section>
  </div>
</template>
