<script setup lang="ts">
import PropertyCard from '~/components/site/PropertyCard.vue'
import type { PublicPropertyListItem } from '~/types/public-property'

const props = defineProps<{
  properties: PublicPropertyListItem[]
  mode: 'sale' | 'rent'
}>()

const { t } = useI18n()

const current = ref(0)
const { slidesPerView } = useResponsiveSlidesPerView({ default: 1, sm: 2, lg: 4 })

const slideCount = computed(() => props.properties.length)
const maxIndex = computed(() => Math.max(0, slideCount.value - slidesPerView.value))
const canSlide = computed(() => slideCount.value > slidesPerView.value)
const slideWidth = computed(() => 100 / slidesPerView.value)

function goTo(index: number) {
  current.value = Math.min(Math.max(index, 0), maxIndex.value)
}

function next() {
  goTo(current.value + 1)
}

function prev() {
  goTo(current.value - 1)
}

watch(slideCount, () => {
  if (current.value > maxIndex.value) {
    current.value = maxIndex.value
  }
})

watch(slidesPerView, () => {
  if (current.value > maxIndex.value) {
    current.value = maxIndex.value
  }
})
</script>

<template>
  <div
    class="relative"
    aria-roledescription="carousel"
    :aria-label="mode === 'sale' ? t('home.properties.listingSale') : t('home.properties.listingRent')"
  >
    <div class="overflow-hidden">
      <div
        class="flex transition-transform duration-500 ease-out"
        :style="{ transform: `translateX(-${current * slideWidth}%)` }"
      >
        <div
          v-for="property in properties"
          :key="property.id"
          class="shrink-0 px-2 first:pl-0 last:pr-0"
          :style="{ width: `${slideWidth}%` }"
        >
          <PropertyCard :property="property" :mode="mode" />
        </div>
      </div>
    </div>

    <template v-if="canSlide">
      <button
        type="button"
        class="absolute -left-2 top-[38%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-wp-navy shadow-md transition hover:bg-slate-50 disabled:opacity-40 sm:-left-3 sm:h-11 sm:w-11"
        :disabled="current === 0"
        :aria-label="t('home.properties.slidePrev')"
        @click="prev"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        class="absolute -right-2 top-[38%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-wp-navy shadow-md transition hover:bg-slate-50 disabled:opacity-40 sm:-right-3 sm:h-11 sm:w-11"
        :disabled="current >= maxIndex"
        :aria-label="t('home.properties.slideNext')"
        @click="next"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div class="mt-4 flex justify-center gap-2 sm:hidden">
        <button
          v-for="index in maxIndex + 1"
          :key="index"
          type="button"
          class="h-2 rounded-full transition-all"
          :class="index - 1 === current
            ? 'w-6 bg-wp-gold'
            : 'w-2 bg-white/50 hover:bg-white/80'"
          :aria-label="t('home.properties.goToSlide', { n: index })"
          :aria-current="index - 1 === current ? 'true' : undefined"
          @click="goTo(index - 1)"
        />
      </div>
    </template>
  </div>
</template>
