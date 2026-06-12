<script setup lang="ts">
import type { CustomerReviewListItem } from '~/types/customer-review'

definePageMeta({ layout: 'default' })

const { t } = useI18n()

const { data, pending, error } = await useFetch<{ items: CustomerReviewListItem[] }>('/api/customer-reviews')

useStaticPageSeo('pages.reviews.title', 'pages.reviews.subtitle')
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.reviews.title')" :subtitle="t('pages.reviews.subtitle')" />

    <section id="reviews" class="py-12">
      <div class="site-container">
        <div v-if="pending" class="py-12 text-center text-slate-500">
          {{ t('pages.common.loading') }}
        </div>

        <p v-else-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ t('pages.reviews.loadError') }}
        </p>

        <p v-else-if="!data?.items.length" class="py-12 text-center text-slate-500">
          {{ t('pages.reviews.empty') }}
        </p>

        <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <figure
            v-for="(item, index) in data.items"
            :key="item.id"
            class="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <OptimizedImage
              v-if="item.image_url"
              :src="item.image_url"
              :alt="t('home.reviews.reviewImage', { n: index + 1 })"
              :width="280"
              :height="373"
              :aspect-ratio="3 / 4"
              sizes="(max-width: 640px) 45vw, 280px"
              class="aspect-[3/4] w-full object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  </div>
</template>
