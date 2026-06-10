<script setup lang="ts">
import { interestingContentItems } from '~/data/home-content'

const { t } = useI18n()
</script>

<template>
  <section class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-2xl font-medium text-white sm:text-3xl">
          {{ t('home.interestingContent.title') }}
        </h2>
        <button
          type="button"
          class="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          {{ t('common.viewAll') }}
        </button>
      </div>

      <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in interestingContentItems"
          :key="item.id"
          class="aspect-[3/4] overflow-hidden rounded-2xl"
        >
          <img
            :src="item.image"
            :alt="t(`home.interestingContent.items.${item.id}.alt`)"
            class="h-full w-full object-cover"
          >
        </div>
      </div>
    </div>
  </section>
</template>
