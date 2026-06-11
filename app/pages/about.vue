<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: () => t('pages.about.title') })
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.about.title')" :subtitle="t('pages.about.subtitle')" />

    <section id="about" class="py-12">
      <div class="mx-auto max-w-3xl px-4 text-sm leading-relaxed text-slate-700 sm:px-6 sm:text-base">
        <p>{{ t('footer.description') }}</p>
        <p class="mt-6">{{ t('pages.about.body') }}</p>

        <div class="mt-10 grid gap-4 sm:grid-cols-3">
          <div
            v-for="stat in ['customers', 'returns', 'approval']"
            :key="stat"
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center"
          >
            <p class="text-2xl font-bold text-wp-navy">
              {{ t(`home.hero.statsValues.${stat}`) }}
            </p>
            <p class="mt-1 text-sm text-slate-600">
              {{ t(`home.hero.stats.${stat}`) }}
            </p>
          </div>
        </div>

        <div class="mt-10 flex flex-wrap gap-3">
          <NuxtLink
            :to="localePath('/services')"
            class="rounded-xl bg-wp-navy px-6 py-2.5 text-sm font-medium text-white"
          >
            {{ t('pages.services.title') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/contact')"
            class="rounded-xl border border-wp-navy px-6 py-2.5 text-sm font-medium text-wp-navy"
          >
            {{ t('pages.contact.title') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
