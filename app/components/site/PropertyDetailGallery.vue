<script setup lang="ts">
const props = defineProps<{
  imageUrls: string[]
  alt: string
}>()

const emit = defineEmits<{
  open: [index: number]
}>()

const { t } = useI18n()

const mainImage = computed(() => props.imageUrls[0] ?? '')
const sideImages = computed(() => {
  const count = props.imageUrls.length
  if (count <= 3) return props.imageUrls.slice(1)
  if (count === 4) return props.imageUrls.slice(1, 4)
  return props.imageUrls.slice(1, 5)
})
const totalCount = computed(() => props.imageUrls.length)
const showViewAllBadge = computed(() => totalCount.value > 5)

const rightPanelClass = computed(() => {
  const sideCount = sideImages.value.length
  if (sideCount <= 1) return 'grid min-h-0 grid-cols-1 grid-rows-1 gap-1.5'
  if (sideCount === 2) return 'grid min-h-0 grid-cols-1 grid-rows-2 gap-1.5'
  if (sideCount === 3) return 'grid min-h-0 grid-cols-1 grid-rows-3 gap-1.5'
  return 'grid min-h-0 grid-cols-2 grid-rows-2 gap-1.5'
})

const imageButtonClass =
  'group relative block h-full min-h-0 w-full overflow-hidden bg-slate-200'

const imageClass =
  'absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]'

function openAt(index: number) {
  emit('open', index)
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/80">
    <button
      v-if="!imageUrls.length"
      type="button"
      class="flex aspect-[4/3] max-h-[280px] w-full items-center justify-center text-sm text-slate-400 sm:max-h-[320px]"
      disabled
    >
      {{ t('pages.properties.noImage') }}
    </button>

    <!-- รูปเดียว -->
    <button
      v-else-if="imageUrls.length === 1"
      type="button"
      class="group relative block aspect-[16/10] max-h-[280px] w-full overflow-hidden sm:max-h-[360px]"
      :aria-label="t('pages.properties.openGallery')"
      @click="openAt(0)"
    >
      <OptimizedImage
        :src="mainImage"
        :alt="alt"
        :width="1200"
        :height="750"
        sizes="100vw"
        :class="imageClass"
      />
    </button>

    <!-- 2 รูป -->
    <div
      v-else-if="imageUrls.length === 2"
      class="grid h-[220px] grid-cols-2 gap-1.5 sm:h-[300px] lg:h-[360px]"
    >
      <button
        v-for="(url, index) in imageUrls"
        :key="index"
        type="button"
        :class="imageButtonClass"
        :aria-label="t('pages.properties.openGallery')"
        @click="openAt(index)"
      >
        <OptimizedImage
          :src="url"
          :alt="alt"
          :width="800"
          :height="600"
          sizes="50vw"
          :class="imageClass"
        />
      </button>
    </div>

    <!-- 3+ รูป — ใหญ่ซ้าย + ขวาตามจำนวนจริง (ไม่เว้นช่องว่าง) -->
    <div
      v-else
      class="grid h-[220px] grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-1.5 sm:h-[300px] lg:h-[400px]"
    >
      <button
        type="button"
        :class="[imageButtonClass, 'min-h-0']"
        :aria-label="t('pages.properties.openGallery')"
        @click="openAt(0)"
      >
        <OptimizedImage
          :src="mainImage"
          :alt="alt"
          :width="960"
          :height="800"
          sizes="(max-width: 1024px) 60vw, 45vw"
          :class="imageClass"
        />
      </button>

      <div :class="rightPanelClass">
        <button
          v-for="(url, index) in sideImages"
          :key="index + 1"
          type="button"
          :class="imageButtonClass"
          :aria-label="t('pages.properties.openGallery')"
          @click="openAt(index + 1)"
        >
          <OptimizedImage
            :src="url"
            :alt="alt"
            :width="480"
            :height="360"
            sizes="25vw"
            :class="imageClass"
          />

          <span
            v-if="showViewAllBadge && index === sideImages.length - 1"
            class="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/45 via-transparent to-transparent p-2 sm:p-3"
          >
            <span
              class="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm backdrop-blur-sm sm:text-sm"
            >
              <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ t('pages.properties.openGalleryCount', { n: totalCount }) }}
            </span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>
