<script setup lang="ts">
import InterestingContentCard from '~/components/InterestingContentCard.vue'
import type { InterestingContentListItem } from '~/types/interesting-content'

const { t } = useI18n()
const localePath = useLocalePath()

const HOME_LIMIT = 6

const { data } = await useFetch<{ items: InterestingContentListItem[] }>(
  '/api/interesting-content',
  { query: { limit: HOME_LIMIT } },
)

const items = computed(() => data.value?.items ?? [])
const slideCount = computed(() => items.value.length)
const canSlide = computed(() => slideCount.value > 1)

const current = ref(0)

const trackShift = computed(() =>
  slideCount.value ? (current.value * 100) / slideCount.value : 0,
)

let timer: ReturnType<typeof setInterval> | null = null

function goTo(index: number) {
  const count = slideCount.value
  if (!count) return
  current.value = ((index % count) + count) % count
}

function next() {
  goTo(current.value + 1)
}

function startAutoplay() {
  if (!canSlide.value || timer) return
  timer = setInterval(next, 5000)
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(slideCount, (count) => {
  if (current.value >= count) {
    current.value = 0
  }
  stopAutoplay()
  startAutoplay()
})

onMounted(startAutoplay)
onUnmounted(stopAutoplay)
</script>

<template>
  <section v-if="items.length" class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8">
    <div class="site-container">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-2xl font-medium text-white sm:text-3xl">
          {{ t('home.interestingContent.title') }}
        </h2>
        <NuxtLink
          :to="localePath('/interesting-content')"
          class="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
        >
          {{ t('common.viewAll') }}
        </NuxtLink>
      </div>

      <!-- มือถือ: slide 1 รายการ + autoplay -->
      <div
        class="relative mt-8 sm:hidden"
        aria-roledescription="carousel"
        :aria-label="t('home.interestingContent.title')"
        @mouseenter="stopAutoplay"
        @mouseleave="startAutoplay"
        @touchstart.passive="stopAutoplay"
        @touchend.passive="startAutoplay"
      >
        <div class="overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-out"
            :style="{
              width: `${slideCount * 100}%`,
              transform: `translateX(-${trackShift}%)`,
            }"
          >
            <div
              v-for="item in items"
              :key="item.id"
              class="shrink-0 px-0"
              :style="{ width: `${100 / slideCount}%` }"
            >
              <InterestingContentCard
                variant="home"
                :item="item"
                :to="localePath(`/interesting-content/${item.id}`)"
              />
            </div>
          </div>
        </div>

        <div v-if="canSlide" class="mt-5 flex justify-center">
          <CarouselDotButton
            v-for="(_, index) in items"
            :key="index"
            :active="index === current"
            inactive-dot-class="h-2 w-2 bg-slate-300 group-hover:bg-slate-400"
            :label="t('home.interestingContent.goToSlide', { n: index + 1 })"
            @click="goTo(index)"
          />
        </div>
      </div>

      <!-- tablet/desktop: grid -->
      <div class="mt-8 hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        <InterestingContentCard
          v-for="item in items"
          :key="item.id"
          variant="home"
          :item="item"
          :to="localePath(`/interesting-content/${item.id}`)"
        />
      </div>
    </div>
  </section>
</template>
