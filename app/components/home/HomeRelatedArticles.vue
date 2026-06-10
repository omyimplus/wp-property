<script setup lang="ts">
import { articles } from '~/data/home-content'

const { t } = useI18n()
</script>

<template>
  <section id="articles" class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-2xl font-medium text-white sm:text-3xl">
          {{ t('home.articles.title') }}
        </h2>
        <button
          type="button"
          class="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          {{ t('common.viewAll') }}
        </button>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in articles"
          :key="item.id"
          class="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <div class="aspect-video overflow-hidden">
            <img
              :src="item.image"
              :alt="t(`home.articles.items.${item.id}.title`)"
              class="h-full w-full object-cover"
            >
          </div>
          <div class="p-4 sm:p-5">
            <h3 class="truncate text-base font-medium text-wp-navy sm:text-lg">
              {{ t(`home.articles.items.${item.id}.title`) }}
            </h3>
            <p class="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              {{ t(`home.articles.items.${item.id}.excerpt`) }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
