<script setup lang="ts">
import { heroSlides, heroStats } from '~/data/home-content'

const { t } = useI18n()
const { navTo } = useSiteNav()

const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const slideCount = heroSlides.length
const hasMultipleSlides = slideCount > 1

function goTo(index: number) {
  current.value = ((index % slideCount) + slideCount) % slideCount
}

function next() {
  goTo(current.value + 1)
}

function prev() {
  goTo(current.value - 1)
}

function startAutoplay() {
  if (!hasMultipleSlides || timer) return
  timer = setInterval(next, 6000)
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function onMouseEnter() {
  stopAutoplay()
}

function onMouseLeave() {
  startAutoplay()
}

onMounted(startAutoplay)
onUnmounted(stopAutoplay)
</script>

<template>
  <section
    class="relative h-[600px] overflow-hidden bg-wp-navy"
    aria-roledescription="carousel"
    :aria-label="t('home.hero.carouselLabel')"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Slides -->
    <div class="absolute inset-0 animate-hero-fade-in">
      <div
        v-for="(slide, index) in heroSlides"
        :key="slide.id"
        class="absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="index === current ? 'opacity-100' : 'opacity-0'"
        :aria-hidden="index !== current"
      >
        <img
          :src="slide.image"
          alt=""
          class="h-full w-full object-cover object-[center_38%] sm:object-[center_42%]"
          fetchpriority="high"
        >
      </div>
    </div>

    <!-- Content -->
    <div class="site-container relative flex h-full items-center">
      <div class="w-full max-w-4xl">
        <p class="animate-hero-fade-up text-[22px] font-medium leading-tight text-wp-hero-navy [animation-delay:100ms]">
          {{ t('home.hero.tagline') }}
        </p>
        <h1 class="mt-[25px]">
          <span class="animate-hero-fade-up block text-[16px] font-medium leading-[1.05] text-wp-hero-navy drop-shadow-[0_3px_12px_rgba(15,43,82,0.35)] [animation-delay:280ms] sm:text-[32px] lg:text-[55px]">
            {{ t('home.hero.titleLine1') }}
          </span>
          <span class="animate-hero-fade-up mt-[15px] block bg-gradient-to-r from-wp-hero-navy to-wp-hero-blue bg-clip-text text-[28px] font-bold leading-[1.05] text-transparent drop-shadow-[0_3px_12px_rgba(15,43,82,0.35)] [animation-delay:460ms] sm:text-[52px] lg:text-[80px]">
            {{ t('home.hero.titleLine2') }}
          </span>
        </h1>

        <!-- Stats bar -->
        <div class="animate-hero-fade-up mt-[40px] grid w-full max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-[#FFFFFF]/[43%] py-4 shadow-lg backdrop-blur-md [animation-delay:640ms] sm:py-5">
          <div
            v-for="(stat, index) in heroStats"
            :key="stat.labelKey"
            class="animate-hero-fade-up flex flex-col items-center justify-center gap-2 border-r border-white/10 px-2 last:border-r-0 sm:px-6"
            :style="{ animationDelay: `${820 + index * 140}ms` }"
          >
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-wp-hero-navy">
              <svg
                v-if="stat.icon === 'trust'"
                class="h-[27px] w-[27px] text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg
                v-else-if="stat.icon === 'returns'"
                class="h-[27px] w-[27px] text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <svg
                v-else
                class="h-[27px] w-[27px] text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span class="text-[1.35rem] font-bold leading-none text-wp-hero-navy sm:text-[1.75rem]">{{ t(stat.valueKey) }}</span>
            <span class="text-center text-[0.65rem] leading-snug text-wp-hero-navy sm:text-[0.8rem]">
              {{ t(stat.labelKey) }}
            </span>
          </div>
        </div>

        <NuxtLink
          :to="navTo('/contact')"
          class="animate-hero-fade-up mt-6 inline-flex items-center rounded-xl border border-wp-hero-cta-mid bg-gradient-to-br from-wp-hero-navy to-wp-hero-cta-mid px-10 py-3 text-lg font-medium text-white shadow-[0_6px_20px_rgba(15,43,82,0.45)] transition [animation-delay:1260ms] hover:brightness-110"
        >
          {{ t('home.hero.cta') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Controls -->
    <template v-if="hasMultipleSlides">
      <button
        type="button"
        class="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:left-6 sm:flex"
        :aria-label="t('home.hero.slidePrev')"
        @click="prev"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        class="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-6 sm:flex"
        :aria-label="t('home.hero.slideNext')"
        @click="next"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div class="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        <button
          v-for="(slide, index) in heroSlides"
          :key="slide.id"
          type="button"
          class="h-2 rounded-full transition-all"
          :class="index === current
            ? 'w-6 bg-wp-gold'
            : 'w-2 bg-white/50 hover:bg-white/80'"
          :aria-label="t('home.hero.goToSlide', { n: index + 1 })"
          :aria-current="index === current ? 'true' : undefined"
          @click="goTo(index)"
        />
      </div>
    </template>
  </section>
</template>
