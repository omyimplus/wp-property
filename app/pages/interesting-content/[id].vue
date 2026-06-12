<script setup lang="ts">
import type { InterestingContentListItem } from '~/types/interesting-content'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const id = computed(() => String(route.params.id))

const { data, error, pending } = await useFetch<{ item: InterestingContentListItem }>(
  () => `/api/interesting-content/${id.value}`,
)

const item = computed(() => data.value?.item)

const breadcrumbItems = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('home.interestingContent.title'), to: localePath('/interesting-content') },
  ...(item.value ? [{ label: item.value.title }] : []),
])

useSiteSeo({
  title: () => item.value?.title ?? t('home.interestingContent.title'),
  description: () => item.value?.excerpt ?? t('pages.interestingContent.subtitle'),
  image: () => item.value?.cover_url ?? undefined,
  type: 'article',
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
        {{ t('pages.interestingContent.notFound') }}
      </div>

      <template v-else-if="item">
        <figure class="mt-6">
          <img
            v-if="item.hero_url || item.cover_url"
            :src="item.hero_url || item.cover_url || ''"
            :alt="item.title"
            class="aspect-[16/10] w-full rounded-2xl object-cover"
          >
          <figcaption class="mt-4 sm:mt-5">
            <h1 class="text-2xl font-medium leading-snug text-slate-900 sm:text-3xl">
              {{ item.title }}
            </h1>
            <p v-if="item.excerpt" class="mt-2 text-base leading-relaxed text-slate-600">
              {{ item.excerpt }}
            </p>
          </figcaption>
        </figure>

        <div
          v-if="item.body_html"
          class="rich-content prose prose-slate mt-8 max-w-none sm:mt-10"
          v-html="item.body_html"
        />

        <a
          v-if="item.link_url"
          :href="item.link_url"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-8 inline-block rounded-xl bg-wp-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-wp-navy-light"
        >
          {{ t('pages.common.learnMore') }} →
        </a>
      </template>
    </div>
  </article>
</template>
