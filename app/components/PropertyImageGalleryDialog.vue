<script setup lang="ts">
import { propertyListingHeadline, type PropertyStatus } from '~/types/property'

const props = defineProps<{
  open: boolean
  propertyCode: string
  listingTitle: string | null
  status: PropertyStatus
  imageUrls: string[]
  initialIndex?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const index = ref(0)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      index.value = Math.min(
        props.initialIndex ?? 0,
        Math.max(0, props.imageUrls.length - 1),
      )
    }
  },
)

const headline = computed(() =>
  propertyListingHeadline({
    property_code: props.propertyCode,
    listing_title: props.listingTitle,
  }),
)

function close() {
  emit('close')
}

function prev() {
  if (!props.imageUrls.length) return
  index.value = (index.value - 1 + props.imageUrls.length) % props.imageUrls.length
}

function next() {
  if (!props.imageUrls.length) return
  index.value = (index.value + 1) % props.imageUrls.length
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      @click.self="close"
    >
      <div class="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div class="min-w-0 flex-1">
          <PropertyStatusBadge :status="status" />
          <p class="mt-2 truncate text-sm font-medium text-white">
            {{ headline }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
          aria-label="ปิด"
          @click="close"
        >
          ปิด
        </button>
      </div>

      <div class="relative flex min-h-0 flex-1 items-center justify-center p-4">
        <button
          v-if="imageUrls.length > 1"
          type="button"
          class="absolute left-2 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 md:left-6"
          aria-label="รูปก่อนหน้า"
          @click.stop="prev"
        >
          ‹
        </button>

        <img
          v-if="imageUrls[index]"
          :src="imageUrls[index]"
          :alt="`${headline} รูปที่ ${index + 1}`"
          class="max-h-full max-w-full object-contain"
          @click.stop
        >

        <button
          v-if="imageUrls.length > 1"
          type="button"
          class="absolute right-2 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 md:right-6"
          aria-label="รูปถัดไป"
          @click.stop="next"
        >
          ›
        </button>
      </div>

      <div
        v-if="imageUrls.length > 1"
        class="flex shrink-0 flex-col items-center gap-2 border-t border-white/10 px-4 py-3"
      >
        <p class="text-sm text-white/80">
          {{ index + 1 }} / {{ imageUrls.length }}
        </p>
        <div class="flex max-w-full gap-1.5 overflow-x-auto pb-1">
          <button
            v-for="(url, i) in imageUrls"
            :key="url"
            type="button"
            class="h-14 w-14 shrink-0 overflow-hidden rounded border-2 transition"
            :class="i === index ? 'border-amber-400' : 'border-transparent opacity-60 hover:opacity-100'"
            @click="index = i"
          >
            <img :src="url" alt="" class="h-full w-full object-cover">
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
