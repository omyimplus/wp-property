<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <section class="bg-wp-navy py-10 sm:py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6">
      <h1 class="text-2xl font-medium text-white sm:text-3xl">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-2 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
        {{ subtitle }}
      </p>
    </div>
  </section>
</template>
