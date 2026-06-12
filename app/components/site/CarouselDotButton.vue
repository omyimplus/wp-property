<script setup lang="ts">
withDefaults(
  defineProps<{
    active?: boolean
    label: string
    activeDotClass?: string
    inactiveDotClass?: string
  }>(),
  {
    activeDotClass: 'h-2 w-6 bg-wp-gold',
    inactiveDotClass: 'h-2 w-2 bg-white/50',
  },
)

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="group inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
    :aria-label="label"
    :aria-current="active ? 'true' : undefined"
    @click="$emit('click')"
  >
    <span
      class="block rounded-full transition-all"
      :class="active ? activeDotClass : inactiveDotClass"
      aria-hidden="true"
    />
  </button>
</template>
