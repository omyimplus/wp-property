<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const localeFlags: Record<string, string> = {
  th: '🇹🇭',
  en: '🇬🇧',
}

function flagFor(code: string) {
  return localeFlags[code] ?? '🌐'
}

function labelFor(code: string) {
  return t(`locale.${code}` as 'locale.th' | 'locale.en')
}

function selectLocale(code: string) {
  open.value = false
}

function onClickOutside(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-1 rounded-full border border-white/60 px-2 py-1 text-xs font-medium text-white transition hover:bg-white/10"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click.stop="open = !open"
    >
      <span aria-hidden="true" class="text-xs leading-none">{{ flagFor(locale) }}</span>
      {{ locale.toUpperCase() }}
      <svg
        class="h-3.5 w-3.5 transition-transform"
        :class="open ? 'rotate-180' : ''"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <ul
        v-if="open"
        role="listbox"
        class="absolute right-0 top-full z-50 mt-1.5 min-w-[8.5rem] overflow-hidden rounded-lg border border-white/15 bg-wp-header py-1 shadow-lg"
      >
        <li v-for="loc in locales" :key="loc.code" role="option">
          <NuxtLink
            :to="switchLocalePath(loc.code)"
            class="flex items-center gap-2 px-3 py-2 text-xs transition hover:bg-white/10 sm:text-sm"
            :class="loc.code === locale
              ? 'bg-white/10 font-medium text-wp-gold-light'
              : 'text-white/90'"
            @click="selectLocale(loc.code)"
          >
            <span aria-hidden="true">{{ flagFor(loc.code) }}</span>
            <span>{{ labelFor(loc.code) }}</span>
          </NuxtLink>
        </li>
      </ul>
    </Transition>
  </div>
</template>
