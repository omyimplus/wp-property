<script setup lang="ts">
import type { PropertyFacilityOption } from '~/data/property-facilities'
import PropertyFacilityIcon from '~/components/site/PropertyFacilityIcon.vue'

const props = withDefaults(
  defineProps<{
    title: string
    items: PropertyFacilityOption[]
    expandLabelKey: string
    previewCount?: number
  }>(),
  { previewCount: 4 },
)

const { t } = useI18n()
const expanded = ref(false)

const visibleItems = computed(() =>
  expanded.value ? props.items : props.items.slice(0, props.previewCount),
)

const itemColumns = computed(() => {
  const items = visibleItems.value
  if (!items.length) return [[], []] as [typeof items, typeof items]
  const mid = Math.ceil(items.length / 2)
  return [items.slice(0, mid), items.slice(mid)] as [typeof items, typeof items]
})

const canExpand = computed(() => props.items.length > props.previewCount)
</script>

<template>
  <section v-if="items.length" class="border-t border-slate-200 pt-8">
    <h2 class="text-lg font-semibold text-slate-900 sm:text-xl">
      {{ title }}
    </h2>
    <div class="mt-4 grid gap-y-3 sm:grid-cols-2 sm:gap-x-0 sm:divide-x sm:divide-slate-200">
      <ul
        v-for="(column, colIndex) in itemColumns"
        :key="colIndex"
        class="space-y-3"
        :class="colIndex === 0 ? 'sm:pr-6' : 'sm:pl-6'"
      >
        <li
          v-for="item in column"
          :key="item.key"
          class="flex items-center gap-4 text-sm text-slate-800"
        >
          <PropertyFacilityIcon
            v-if="item.icon"
            :name="item.icon"
          />
          <span
            v-else
            class="h-7 w-7 shrink-0 rounded-full border border-slate-300"
            aria-hidden="true"
          />
          <span>{{ t(item.labelKey) }}</span>
        </li>
      </ul>
    </div>
    <button
      v-if="canExpand"
      type="button"
      class="mt-4 rounded-full border border-slate-800 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-50"
      @click="expanded = !expanded"
    >
      {{ expanded ? t('propertyFacilities.showLess') : t(expandLabelKey, { n: items.length }) }}
    </button>
  </section>
</template>
