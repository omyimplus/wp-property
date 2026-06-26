<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

function close() {
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (props.open && e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="t('pages.forms.submitSuccessTitle')"
      @click.self="close"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
        <span
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
          aria-hidden="true"
        >
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h2 class="text-lg font-semibold text-wp-navy">
          {{ t('pages.forms.submitSuccessTitle') }}
        </h2>
        <p class="mt-3 text-sm leading-relaxed text-slate-600">
          {{ t('pages.forms.submitSuccessMessage') }}
        </p>
        <button
          type="button"
          class="mt-6 w-full rounded-xl bg-wp-navy px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 sm:w-auto"
          @click="close"
        >
          {{ t('pages.forms.submitSuccessOk') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>
