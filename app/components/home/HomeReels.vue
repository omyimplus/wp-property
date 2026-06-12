<script setup lang="ts">
import { reelOpenUrl, type ReelListItem } from '~/types/reel'

const { t } = useI18n()

const { data, pending } = await useFetch<{ items: ReelListItem[] }>('/api/reels')

const reels = computed(() => data.value?.items ?? [])
const showSection = computed(() => pending.value || reels.value.length > 0)

const current = ref(0)
const { slidesPerView } = useResponsiveSlidesPerView({ default: 1, sm: 2, lg: 4 })

const slideCount = computed(() => reels.value.length)
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

function openReel(item: ReelListItem) {
  const url = reelOpenUrl(item)
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

watch(slideCount, () => {
  if (current.value > maxIndex.value) {
    current.value = maxIndex.value
  }
})
</script>

<template>
  <section
    v-if="showSection"
    class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8"
    aria-roledescription="carousel"
    :aria-label="t('home.clips.title')"
  >
    <div class="site-container">
      <h2 class="text-2xl font-medium text-white sm:text-3xl">
        {{ t('home.clips.title') }}
      </h2>

      <div v-if="pending" class="mt-8 py-8 text-center text-sm text-white/70">
        {{ t('pages.common.loading') }}
      </div>

      <div v-else class="relative mt-8">
        <div class="overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(-${current * slideWidth}%)` }"
          >
            <article
              v-for="(item, index) in reels"
              :key="item.id"
              class="group shrink-0 px-2 first:pl-0 last:pr-0 sm:px-2.5"
              :style="{ width: `${slideWidth}%` }"
            >
              <button
                type="button"
                class="relative block aspect-[9/16] w-full overflow-hidden rounded-2xl"
                :class="reelOpenUrl(item) ? 'cursor-pointer' : 'cursor-default'"
                :aria-label="t('home.clips.playClip', { n: index + 1 })"
                @click="openReel(item)"
              >
                <OptimizedImage
                  v-if="item.poster_url"
                  :src="item.poster_url"
                  :alt="t('home.clips.playClip', { n: index + 1 })"
                  :width="360"
                  :height="640"
                  :aspect-ratio="9 / 16"
                  sizes="(max-width: 640px) 45vw, 360px"
                  class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />

                <span class="absolute inset-0 bg-black/10 transition group-hover:bg-black/20" aria-hidden="true" />

                <span class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <svg class="h-10 w-10 text-white drop-shadow-lg sm:h-12 sm:w-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>

                <span class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />

                <span class="absolute inset-x-4 bottom-3 flex items-center gap-2" aria-hidden="true">
                  <span class="h-1 flex-1 rounded-full bg-white/30">
                    <span class="block h-1 w-3 rounded-full bg-white" />
                  </span>
                </span>
              </button>
            </article>
          </div>
        </div>

        <template v-if="canSlide">
          <button
            type="button"
            class="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-wp-navy shadow-md transition hover:bg-white disabled:opacity-40 sm:flex"
            :disabled="current === 0"
            :aria-label="t('home.clips.slidePrev')"
            @click="prev"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            class="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-wp-navy shadow-md transition hover:bg-white disabled:opacity-40 sm:flex"
            :disabled="current >= maxIndex"
            :aria-label="t('home.clips.slideNext')"
            @click="next"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div class="mt-5 flex justify-center sm:hidden">
            <CarouselDotButton
              v-for="index in maxIndex + 1"
              :key="index"
              :active="index - 1 === current"
              inactive-dot-class="h-2 w-2 bg-slate-300 group-hover:bg-slate-400"
              :label="t('home.clips.goToSlide', { n: index })"
              @click="goTo(index - 1)"
            />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
