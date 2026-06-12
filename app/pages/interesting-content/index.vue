<script setup lang="ts">
import InterestingContentCard from '~/components/InterestingContentCard.vue'
import type { InterestingContentListItem } from '~/types/interesting-content'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()

const { data, pending } = await useFetch<{ items: InterestingContentListItem[] }>(
  '/api/interesting-content',
)

useHead({ title: () => t('home.interestingContent.title') })
useSeoMeta({
  title: () => t('home.interestingContent.title'),
  description: () => t('pages.interestingContent.subtitle'),
})
</script>

<template>
  <div>
    <SitePageHero
      :title="t('home.interestingContent.title')"
      :subtitle="t('pages.interestingContent.subtitle')"
    />

    <section class="py-12">
      <div v-if="pending" class="py-16 text-center text-slate-500">
        {{ t('pages.common.loading') }}
      </div>

      <div
        v-else-if="data?.items?.length"
        class="site-container grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <InterestingContentCard
          v-for="item in data.items"
          :key="item.id"
          :item="item"
          :to="localePath(`/interesting-content/${item.id}`)"
        />
      </div>

      <p v-else class="text-center text-slate-500">
        {{ t('pages.interestingContent.empty') }}
      </p>
    </section>
  </div>
</template>
