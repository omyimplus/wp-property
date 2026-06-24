<script setup lang="ts">
import type { PropertyFacilityOption } from '~/data/property-facilities'
import PropertyIcon from '~/components/icons/PropertyIcon.vue'

const props = defineProps<{
  modelValue: string[]
  options: PropertyFacilityOption[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [string[]]
}>()

const { t } = useI18n()

function isSelected(key: string) {
  return props.modelValue.includes(key)
}

function toggle(key: string) {
  if (props.disabled) return
  const next = isSelected(key)
    ? props.modelValue.filter(item => item !== key)
    : [...props.modelValue, key]
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition"
      :class="isSelected(option.key)
        ? 'border-wp-navy bg-wp-navy text-white shadow-sm'
        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
      :disabled="disabled"
      :aria-pressed="isSelected(option.key)"
      @click="toggle(option.key)"
    >
      <PropertyIcon
        v-if="option.icon"
        :name="option.icon"
        class="h-5 w-5 shrink-0"
        :class="isSelected(option.key) ? 'text-white' : 'text-slate-500'"
        :stroke-width="2"
      />
      {{ t(option.labelKey) }}
    </button>
  </div>
</template>
