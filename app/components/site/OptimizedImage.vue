<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    src?: string | null
    alt: string
    width: number
    height?: number
    aspectRatio?: number
    sizes?: string
    loading?: 'lazy' | 'eager'
    fetchpriority?: 'high' | 'low' | 'auto'
    quality?: number
  }>(),
  {
    loading: 'lazy',
    quality: 75,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px',
  },
)

const displayHeight = computed(() => {
  if (props.height) return props.height
  const ratio = props.aspectRatio ?? 4 / 3
  return Math.round(props.width / ratio)
})
</script>

<template>
  <NuxtImg
    v-if="src"
    v-bind="$attrs"
    :src="src"
    :alt="alt"
    :width="width"
    :height="displayHeight"
    :sizes="sizes"
    :loading="loading"
    :fetchpriority="fetchpriority"
    :quality="quality"
    format="webp"
    decoding="async"
  />
</template>
