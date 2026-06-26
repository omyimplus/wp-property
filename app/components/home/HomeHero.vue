<script setup lang="ts">
import { heroSlides, heroStats } from '~/data/home-content'

const { t } = useI18n()
const { navTo } = useSiteNav()

const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const slideCount = heroSlides.length
const hasMultipleSlides = slideCount > 1

const currentSlide = computed(() => heroSlides[current.value])
const showTextOverlay = computed(() => !currentSlide.value?.fullBanner)
const slideContentKey = computed(() => currentSlide.value?.contentKey ?? 'default')
const isAltSlide = computed(() => slideContentKey.value !== 'default')
const showStats = computed(() => {
  const slide = currentSlide.value
  if (slide && 'showStats' in slide && slide.showStats === false) return false
  return slideContentKey.value === 'default'
})

function heroT(key: string) {
  const ck = slideContentKey.value
  if (ck === 'default') return t(`home.hero.${key}`)
  return t(`home.hero.slides.${ck}.${key}`)
}

function slideImageClass(slide: (typeof heroSlides)[number]) {
  if (slide.imageClass) return slide.imageClass
  if (slide.fullBanner) return 'object-center'
  return 'object-[center_38%] sm:object-[center_42%]'
}

const propertiesFeatureKeys = ['0', '1', '2'] as const

const slideFeatures = computed(() => {
  if (slideContentKey.value !== 'properties') return [] as string[]
  return propertiesFeatureKeys.map(key => t(`home.hero.slides.properties.features.${key}`))
})

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
    class="relative h-[680px] overflow-hidden bg-white sm:h-[600px] sm:bg-wp-navy"
    aria-roledescription="carousel"
    :aria-label="t('home.hero.carouselLabel')"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Slides -->
    <div class="absolute inset-0 sm:animate-hero-fade-in">
      <div
        v-for="(slide, index) in heroSlides"
        :key="slide.id"
        class="absolute inset-0 max-sm:transition-none sm:transition-opacity sm:duration-700 sm:ease-in-out"
        :class="index === current ? 'opacity-100' : 'opacity-0'"
        :aria-hidden="index !== current"
      >
        <OptimizedImage
          v-if="'mobileImage' in slide && slide.mobileImage"
          :src="slide.mobileImage"
          :alt="slide.altKey ? t(slide.altKey) : ''"
          :width="750"
          :height="680"
          sizes="100vw"
          class="h-full w-full object-cover object-top sm:hidden"
          :fetchpriority="index === 0 ? 'high' : 'low'"
          :loading="index === 0 ? 'eager' : 'lazy'"
        />
        <OptimizedImage
          :src="slide.image"
          :alt="slide.altKey ? t(slide.altKey) : ''"
          :width="1920"
          :height="600"
          sizes="100vw"
          class="hidden h-full w-full object-cover sm:block"
          :class="slideImageClass(slide)"
          :fetchpriority="index === 0 ? 'high' : 'low'"
          :loading="index === 0 ? 'eager' : 'lazy'"
        />
        <div
          v-if="'whiteFade' in slide && slide.whiteFade"
          class="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,#fff_0%,#fff_30%,rgba(255,255,255,0.85)_43%,rgba(255,255,255,0.4)_57%,transparent_73%)] sm:block"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- Mobile content -->
    <div
      v-if="showTextOverlay"
      class="relative z-[2] flex h-full flex-col items-center px-4 pb-14 pt-5 text-center sm:hidden"
    >
      <p class="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-800">
        {{ heroT('tagline') }}
      </p>

      <h1 class="mt-2 w-full max-w-[340px]">
        <span class="block text-[30px] font-bold leading-tight text-wp-hero-blue">
          {{ heroT('titleLine1') }}
        </span>

        <span
          v-if="slideContentKey === 'default'"
          class="mt-1 block text-[34px] font-extrabold leading-[1.05] text-wp-hero-navy"
        >
          {{ heroT('titleLine2') }}
        </span>

        <template v-else-if="slideContentKey === 'debt'">
          <span class="mt-1 block text-[18px] font-semibold leading-snug text-wp-hero-navy">
            {{ heroT('titleLine2') }}
          </span>
        </template>

        <template v-else-if="slideContentKey === 'properties'">
          <span class="mt-1 block text-[20px] font-bold leading-snug text-wp-hero-blue">
            {{ heroT('titleLine2') }}
          </span>
        </template>
      </h1>

      <!-- Slide 1: stats pill -->
      <div
        v-if="showStats"
        class="mt-4 grid w-full max-w-[360px] grid-cols-3 rounded-full border border-slate-100 bg-white px-2 py-3 shadow-[0_4px_20px_rgba(15,43,82,0.12)]"
      >
        <div
          v-for="stat in heroStats"
          :key="stat.labelKey"
          class="flex flex-col items-center gap-1 border-r border-slate-100 px-1 last:border-r-0"
        >
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-wp-hero-navy">
            <svg
              v-if="stat.icon === 'trust'"
              class="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg
              v-else-if="stat.icon === 'returns'"
              class="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <svg
              v-else
              class="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="text-sm font-bold leading-none text-wp-hero-blue">{{ t(stat.valueKey) }}</span>
          <span class="text-[9px] leading-tight text-slate-700">{{ t(stat.labelKey) }}</span>
        </div>
      </div>

      <!-- Slide 2: accent pill -->
      <div
        v-else-if="slideContentKey === 'debt'"
        class="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-5 py-3 shadow-[0_4px_20px_rgba(15,43,82,0.12)]"
      >
        <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500">
          <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span class="text-base font-semibold text-wp-hero-blue">{{ heroT('titleAccent') }}</span>
      </div>

      <!-- Slide 3: features pill -->
      <ul
        v-else-if="slideContentKey === 'properties'"
        class="mt-4 grid w-full max-w-[360px] grid-cols-3 gap-1 rounded-full border border-slate-100 bg-white px-2 py-3 shadow-[0_4px_20px_rgba(15,43,82,0.12)]"
      >
        <li
          v-for="(feature, featureIndex) in slideFeatures"
          :key="featureIndex"
          class="flex flex-col items-center gap-1 px-0.5 text-center"
        >
          <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <svg class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span class="text-[9px] font-semibold leading-tight text-wp-hero-navy">{{ feature }}</span>
        </li>
      </ul>

      <NuxtLink
        :to="navTo('/contact')"
        class="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F2994A] py-1 pl-4 pr-1.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(242,153,74,0.45)] transition hover:brightness-105"
      >
        <span>{{ heroT('cta') }}</span>
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white">
          <svg class="h-3.5 w-3.5 text-[#F2994A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </NuxtLink>
    </div>

    <!-- Desktop content -->
    <div v-if="showTextOverlay" class="site-container relative z-[2] hidden h-full items-center sm:flex">
      <div class="relative flex h-[27rem] w-full max-w-4xl flex-col pb-[3.25rem] lg:h-[28rem]">
        <div
          class="flex min-h-0 flex-1 flex-col"
          :class="isAltSlide ? 'justify-center' : ''"
        >
          <p
            class="animate-hero-fade-up text-[22px] font-medium leading-tight text-wp-hero-navy [animation-delay:100ms]"
          >
            {{ heroT('tagline') }}
          </p>
          <h1 class="mt-[25px]">
            <span
              class="animate-hero-fade-up block leading-[1.05] text-wp-hero-navy [animation-delay:280ms]"
              :class="isAltSlide
                ? 'text-[40px] font-semibold lg:text-[55px]'
                : 'text-[32px] font-medium drop-shadow-[0_3px_12px_rgba(15,43,82,0.35)] lg:text-[55px]'"
            >
              {{ heroT('titleLine1') }}
            </span>
            <span
              v-if="slideContentKey === 'default'"
              class="animate-hero-fade-up mt-[15px] block bg-gradient-to-r from-wp-hero-navy to-wp-hero-blue bg-clip-text text-[52px] font-bold leading-[1.05] text-transparent drop-shadow-[0_3px_12px_rgba(15,43,82,0.35)] [animation-delay:460ms] lg:text-[80px]"
            >
              {{ heroT('titleLine2') }}
            </span>
            <template v-else-if="slideContentKey === 'debt'">
              <span
                class="animate-hero-fade-up mt-4 block text-[28px] font-semibold leading-snug text-wp-hero-navy [animation-delay:400ms] lg:text-[36px]"
              >
                {{ heroT('titleLine2') }}
              </span>
              <span
                class="animate-hero-fade-up mt-3 flex items-center gap-2 text-[28px] font-semibold text-wp-hero-blue [animation-delay:520ms] lg:text-[36px]"
              >
                <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <svg class="h-[18px] w-[18px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {{ heroT('titleAccent') }}
              </span>
            </template>
            <template v-else-if="slideContentKey === 'properties'">
              <span
                class="animate-hero-fade-up mt-4 block text-[28px] font-bold leading-snug text-wp-hero-blue [animation-delay:400ms] lg:text-[40px]"
              >
                {{ heroT('titleLine2') }}
              </span>
              <ul
                class="animate-hero-fade-up mt-5 flex flex-wrap gap-x-6 gap-y-2 [animation-delay:520ms]"
              >
                <li
                  v-for="(feature, featureIndex) in slideFeatures"
                  :key="featureIndex"
                  class="flex items-center gap-2 text-base font-semibold text-wp-hero-navy"
                >
                  <span class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <svg class="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {{ feature }}
                </li>
              </ul>
            </template>
          </h1>

          <div
            v-if="showStats"
            class="animate-hero-fade-up mt-[40px] grid w-full max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-[#FFFFFF]/[43%] py-5 shadow-lg backdrop-blur-md [animation-delay:640ms]"
          >
            <div
              v-for="(stat, index) in heroStats"
              :key="stat.labelKey"
              class="animate-hero-fade-up flex flex-col items-center justify-center gap-2 border-r border-white/10 px-6 last:border-r-0"
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
              <span class="text-[1.75rem] font-bold leading-none text-wp-hero-navy">{{ t(stat.valueKey) }}</span>
              <span class="text-center text-[0.8rem] leading-snug text-wp-hero-navy">
                {{ t(stat.labelKey) }}
              </span>
            </div>
          </div>
        </div>

        <NuxtLink
          :to="navTo('/contact')"
          class="animate-hero-fade-up absolute bottom-0 left-0 inline-flex items-center rounded-xl border border-wp-hero-cta-mid bg-gradient-to-br from-wp-hero-navy to-wp-hero-cta-mid px-10 py-3 text-lg font-medium text-white shadow-[0_6px_20px_rgba(15,43,82,0.45)] transition [animation-delay:1260ms] hover:brightness-110"
        >
          {{ heroT('cta') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Controls -->
    <template v-if="hasMultipleSlides">
      <button
        type="button"
        class="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex sm:left-6"
        :aria-label="t('home.hero.slidePrev')"
        @click="prev"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        class="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/50 sm:flex sm:right-6"
        :aria-label="t('home.hero.slideNext')"
        @click="next"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center sm:bottom-6">
        <CarouselDotButton
          v-for="(slide, index) in heroSlides"
          :key="slide.id"
          :active="index === current"
          inactive-dot-class="h-2 w-2 bg-white/50 group-hover:bg-white/80"
          :label="t('home.hero.goToSlide', { n: index + 1 })"
          @click="goTo(index)"
        />
      </div>
    </template>
  </section>
</template>
