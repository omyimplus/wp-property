<script setup lang="ts">
import type { SiteSocialKey } from '~/data/site-social'

const { channels } = useSiteSocial()

const baseClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

const platformActive: Record<SiteSocialKey, string> = {
  facebook:
    'border-[#1877F2] bg-[#1877F2] text-white hover:brightness-110 focus-visible:outline-[#1877F2]',
  instagram:
    'border-transparent bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:brightness-110 focus-visible:outline-[#ee2a7b]',
  line:
    'border-[#06C755] bg-[#06C755] text-white hover:brightness-110 focus-visible:outline-[#06C755]',
  youtube:
    'border-[#FF0000] bg-[#FF0000] text-white hover:brightness-110 focus-visible:outline-[#FF0000]',
  tiktok:
    'border-[#010101] bg-[#010101] text-white hover:brightness-125 focus-visible:outline-[#010101]',
}

const platformDisabled: Record<SiteSocialKey, string> = {
  facebook: 'border-slate-200 bg-slate-50 text-[#1877F2]/35',
  instagram: 'border-slate-200 bg-slate-50 text-[#ee2a7b]/40',
  line: 'border-slate-200 bg-slate-50 text-[#06C755]/40',
  youtube: 'border-slate-200 bg-slate-50 text-[#FF0000]/35',
  tiktok: 'border-slate-200 bg-slate-50 text-slate-400',
}
</script>

<template>
  <ul class="flex flex-wrap gap-3">
    <li v-for="channel in channels" :key="channel.key">
      <a
        v-if="channel.href"
        :href="channel.href"
        target="_blank"
        rel="noopener noreferrer"
        :class="[baseClass, platformActive[channel.key]]"
        :title="channel.label"
        :aria-label="channel.label"
      >
        <SiteSocialIcon :name="channel.key" />
      </a>
      <span
        v-else
        :class="[baseClass, 'cursor-not-allowed', platformDisabled[channel.key]]"
        :title="channel.label"
        :aria-label="channel.label"
      >
        <SiteSocialIcon :name="channel.key" />
      </span>
    </li>
  </ul>
</template>
