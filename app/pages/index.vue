<script setup lang="ts">
import HomeFeaturedProperties from '~/components/home/HomeFeaturedProperties.vue'
import { services } from '~/data/home-content'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()

useStaticPageSeo('seo.home.title', 'seo.home.description')
</script>

<template>
  <div>
    <HomeHero />

    <div class="h-[50px] bg-black" aria-hidden="true" />

    <!-- Services -->
    <section id="services" class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8">
      <div class="site-container">
        <div class="text-center">
          <h2 class="inline-block border-b-2 border-white pb-3 text-2xl font-medium text-white sm:text-3xl">
            {{ t('home.services.title') }}
          </h2>
        </div>
        <div class="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-5 lg:max-w-5xl lg:grid-cols-3">
          <article
            v-for="service in services"
            :id="service.key === 'consign' ? 'consign-buy' : undefined"
            :key="service.key"
            class="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="aspect-[4/3] overflow-hidden">
              <OptimizedImage
                :src="service.image"
                :alt="t(`home.services.${service.key}.title`)"
                :width="400"
                :height="300"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
                class="h-full w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
            <div class="p-4 sm:p-5">
              <h3 class="text-center text-lg font-medium text-wp-navy sm:text-xl">
                {{ t(`home.services.${service.key}.title`) }}
              </h3>
              <p class="mt-1.5 text-center text-xs leading-relaxed text-slate-600 sm:mt-2 sm:text-sm">
                {{ t(`home.services.${service.key}.description`) }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <HomeSearch />

    <HomeFeaturedProperties />

    <HomeInterestingContent />

    <HomeRelatedArticles />

    <HomeReels />

    <HomeReviews />
  </div>
</template>
