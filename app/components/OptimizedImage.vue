<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    src?: string | null
    alt: string
    width: number
    height?: number
    aspectRatio?: number
    loading?: 'lazy' | 'eager'
    fetchpriority?: 'high' | 'low' | 'auto'
  }>(),
  {
    loading: 'lazy',
  },
)

const displayHeight = computed(() => {
  if (props.height) return props.height
  const ratio = props.aspectRatio ?? 4 / 3
  return Math.round(props.width / ratio)
})
</script>

<template>
  <img
    v-if="src"
    v-bind="$attrs"
    :src="src"
    :alt="alt"
    :width="width"
    :height="displayHeight"
    :loading="loading"
    :fetchpriority="fetchpriority"
    decoding="async"
  >
</template>
