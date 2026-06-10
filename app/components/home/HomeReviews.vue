<script setup lang="ts">
import { reviews } from '~/data/home-content'

const { t } = useI18n()

const TRANSITION_MS = 600
const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2] as const

const CARD_POSITIONS: Record<number, number> = {
  [-2]: 20,
  [-1]: 37,
  [0]: 50,
  [1]: 63,
  [2]: 80,
}

const slideCount = reviews.length
const canSlide = slideCount > 1

/** รายการกลาง (เริ่มที่รายการที่ 3) */
const centerIndex = ref(2)
/** 0 = หยุด, 0–1 = กำลังเลื่อน */
const slideProgress = ref(0)
const direction = ref<1 | -1>(1)
const isAnimating = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
let animationFrame: number | null = null

function wrapIndex(index: number) {
  return ((index % slideCount) + slideCount) % slideCount
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2
}

function scaleForDistance(distance: number) {
  if (distance <= 0) return 1
  if (distance <= 1) return lerp(1, 0.9, distance)
  if (distance <= 2) return lerp(0.9, 0.78, distance - 1)
  return 0.78
}

function opacityForDistance(distance: number) {
  if (distance <= 0) return 1
  if (distance <= 1) return lerp(1, 0.95, distance)
  if (distance <= 2) return lerp(0.95, 0.85, distance - 1)
  if (distance <= 2.8) return lerp(0.85, 0, distance - 2)
  return 0
}

function positionPercent(offset: number) {
  if (offset in CARD_POSITIONS) return CARD_POSITIONS[offset as keyof typeof CARD_POSITIONS]
  const step = 17
  if (offset < -2) return CARD_POSITIONS[-2] - step * (-2 - offset)
  return CARD_POSITIONS[2] + step * (offset - 2)
}

function getSlideState(slotOffset: number) {
  const drift = slideProgress.value * direction.value
  const visualOffset = slotOffset - drift
  const floorOffset = Math.floor(visualOffset)
  const ceilOffset = Math.ceil(visualOffset)
  const t = visualOffset - floorOffset
  const leftValue = lerp(positionPercent(floorOffset), positionPercent(ceilOffset), t)

  const distance = Math.abs(visualOffset)
  const scale = scaleForDistance(distance)
  const opacity = opacityForDistance(distance)

  return {
    left: `${leftValue}%`,
    opacity,
    zIndex: Math.max(0, Math.round(10 - distance)),
    transform: `translateX(-50%) scale(${scale})`,
    transformOrigin: 'bottom center',
    visibility: (opacity > 0.01 ? 'visible' : 'hidden') as 'visible' | 'hidden',
    isActive: distance < 0.35,
  }
}

function getItemForSlot(slotOffset: number) {
  return reviews[wrapIndex(centerIndex.value + slotOffset)]!
}

const visibleSlides = computed(() =>
  VISIBLE_OFFSETS.map(slotOffset => ({
    slotOffset,
    item: getItemForSlot(slotOffset),
    state: getSlideState(slotOffset),
  })),
)

function cancelAnimation() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

function animateProgress(from: number, to: number) {
  if (!canSlide) return Promise.resolve()

  isAnimating.value = true
  const startTime = performance.now()

  return new Promise<void>((resolve) => {
    const step = (now: number) => {
      const raw = Math.min(1, (now - startTime) / TRANSITION_MS)
      const eased = easeInOut(raw)
      slideProgress.value = lerp(from, to, eased)

      if (raw < 1) {
        animationFrame = requestAnimationFrame(step)
        return
      }

      slideProgress.value = to
      isAnimating.value = false
      animationFrame = null
      resolve()
    }

    animationFrame = requestAnimationFrame(step)
  })
}

async function next() {
  if (isAnimating.value) return
  direction.value = 1
  await animateProgress(0, 1)
  centerIndex.value = wrapIndex(centerIndex.value + 1)
  slideProgress.value = 0
}

async function prev() {
  if (isAnimating.value) return
  direction.value = -1
  await animateProgress(0, 1)
  centerIndex.value = wrapIndex(centerIndex.value - 1)
  slideProgress.value = 0
}

function startAutoplay() {
  if (!canSlide || timer) return
  timer = setInterval(() => {
    if (!isAnimating.value) next()
  }, 5000)
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(startAutoplay)
onUnmounted(() => {
  stopAutoplay()
  cancelAnimation()
})
</script>

<template>
  <section
    id="reviews"
    class="bg-wp-navy pb-10 pt-6 sm:pb-14 sm:pt-8"
    aria-roledescription="carousel"
    :aria-label="t('home.reviews.title')"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <h2 class="text-2xl font-medium text-center text-white sm:text-3xl">
        {{ t('home.reviews.title') }}
      </h2>

      <div class="relative overflow-hidden">
        <div class="pointer-events-none relative mx-auto h-[400px] w-full sm:h-[520px] lg:h-[580px]">
          <article
            v-for="slide in visibleSlides"
            :key="slide.slotOffset"
            class="absolute bottom-0 w-[250px] will-change-[left,transform,opacity] sm:w-[300px] lg:w-[350px]"
            :class="slide.slotOffset === 0 ? 'pointer-events-auto' : ''"
            :style="{
              left: slide.state.left,
              bottom: '0',
              opacity: slide.state.opacity,
              zIndex: slide.state.zIndex,
              transform: slide.state.transform,
              transformOrigin: slide.state.transformOrigin,
              visibility: slide.state.visibility,
            }"
          >
            <div
              class="aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
              :class="!slide.state.isActive ? 'brightness-[0.8]' : ''"
            >
              <img
                :src="slide.item.image"
                :alt="t(`home.reviews.items.${slide.item.id}.alt`)"
                class="h-full w-full object-cover"
              >
            </div>
          </article>

          <template v-if="canSlide">
            <button
              type="button"
              class="pointer-events-auto absolute bottom-[42%] left-2 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white text-wp-navy shadow-lg transition hover:bg-slate-50 disabled:opacity-50 sm:left-4 sm:h-12 sm:w-12"
              :disabled="isAnimating"
              :aria-label="t('home.reviews.slidePrev')"
              @click="prev"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              class="pointer-events-auto absolute bottom-[42%] right-2 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white text-wp-navy shadow-lg transition hover:bg-slate-50 disabled:opacity-50 sm:right-4 sm:h-12 sm:w-12"
              :disabled="isAnimating"
              :aria-label="t('home.reviews.slideNext')"
              @click="next"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
