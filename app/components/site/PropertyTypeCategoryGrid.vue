<script setup lang="ts">
import { propertyTypeKeys } from '~/data/home-content'
import { propertyTypeKeyToDb } from '~/utils/property-types'

const props = defineProps<{
  activePropertyType?: string
}>()

const emit = defineEmits<{
  select: [propertyType: string]
}>()

const { t } = useI18n()

const MOBILE_SLIDES_PER_VIEW = 3

const current = ref(0)
const slideCount = propertyTypeKeys.length
const maxIndex = Math.max(0, slideCount - MOBILE_SLIDES_PER_VIEW)
const canSlide = slideCount > MOBILE_SLIDES_PER_VIEW
const slideWidth = 100 / MOBILE_SLIDES_PER_VIEW

function isActive(key: string) {
  const db = propertyTypeKeyToDb[key]
  return Boolean(db && props.activePropertyType === db)
}

function onSelect(key: string) {
  const db = propertyTypeKeyToDb[key]
  if (db) emit('select', db)
}

function goTo(index: number) {
  current.value = Math.min(Math.max(index, 0), maxIndex)
}

function next() {
  goTo(current.value + 1)
}

function prev() {
  goTo(current.value - 1)
}
</script>

<template>
  <div class="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
    <!-- มือถือ: slide 3 หมวด -->
    <div
      class="sm:hidden"
      aria-roledescription="carousel"
      :aria-label="t('home.search.typePlaceholder')"
    >
      <div class="overflow-hidden">
        <div
          class="flex transition-transform duration-500 ease-out"
          :style="{ transform: `translateX(-${current * slideWidth}%)` }"
        >
          <button
            v-for="ptype in propertyTypeKeys"
            :key="ptype.key"
            type="button"
            class="flex shrink-0 flex-col items-center justify-center gap-2 rounded-xl border px-1 py-3 text-center transition"
            :class="[
              isActive(ptype.key)
                ? 'border-wp-navy bg-wp-navy/5 ring-1 ring-wp-navy/20'
                : 'border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50',
            ]"
            :style="{ width: `${slideWidth}%` }"
            :aria-pressed="isActive(ptype.key)"
            @click="onSelect(ptype.key)"
          >
            <img
              :src="ptype.image"
              :alt="t(`home.search.propertyTypes.${ptype.key}`)"
              class="h-11 w-11 object-contain"
              width="44"
              height="44"
            >
            <span class="text-[11px] font-medium leading-snug text-slate-900">
              {{ t(`home.search.propertyTypes.${ptype.key}`) }}
            </span>
          </button>
        </div>
      </div>

      <div v-if="canSlide" class="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          :disabled="current === 0"
          :aria-label="t('home.search.categorySlidePrev')"
          @click="prev"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex gap-1.5">
          <button
            v-for="index in maxIndex + 1"
            :key="index"
            type="button"
            class="h-1.5 rounded-full transition-all"
            :class="index - 1 === current
              ? 'w-5 bg-wp-navy'
              : 'w-1.5 bg-slate-300 hover:bg-slate-400'"
            :aria-label="t('home.search.categoryGoToSlide', { n: index })"
            :aria-current="index - 1 === current ? 'true' : undefined"
            @click="goTo(index - 1)"
          />
        </div>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          :disabled="current >= maxIndex"
          :aria-label="t('home.search.categorySlideNext')"
          @click="next"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- tablet/desktop: grid -->
    <div class="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-3 md:grid-cols-5 md:gap-4">
      <button
        v-for="ptype in propertyTypeKeys"
        :key="ptype.key"
        type="button"
        class="flex flex-col items-center justify-center gap-2.5 rounded-xl border px-2 py-4 text-center transition sm:px-3 sm:py-5"
        :class="isActive(ptype.key)
          ? 'border-wp-navy bg-wp-navy/5 ring-1 ring-wp-navy/20'
          : 'border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50'"
        :aria-pressed="isActive(ptype.key)"
        @click="onSelect(ptype.key)"
      >
        <img
          :src="ptype.image"
          :alt="t(`home.search.propertyTypes.${ptype.key}`)"
          class="h-12 w-12 object-contain sm:h-14 sm:w-14"
          width="56"
          height="56"
        >
        <span class="text-xs font-medium leading-snug text-slate-900 sm:text-sm">
          {{ t(`home.search.propertyTypes.${ptype.key}`) }}
        </span>
      </button>
    </div>
  </div>
</template>
