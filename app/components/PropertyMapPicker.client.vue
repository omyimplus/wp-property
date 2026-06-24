<script setup lang="ts">
import {
  googleMapsEmbedUrl,
  googleMapsPinUrl,
  hasMapCoordinates,
} from '~/utils/property-address'
import {
  isLikelyGoogleMapsUrl,
  parseGoogleMapsCoordinates,
} from '~/utils/google-maps-url'

const props = withDefaults(
  defineProps<{
    latitude: number | null
    longitude: number | null
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{
  'update:latitude': [number | null]
  'update:longitude': [number | null]
}>()

const mapUrlInput = ref('')
const parsing = ref(false)
const parseMessage = ref('')
const parseSuccess = ref(false)

const coordinateLabel = computed(() => {
  if (!hasMapCoordinates(props.latitude, props.longitude)) return 'ยังไม่ได้ระบุตำแหน่ง'
  return `${props.latitude!.toFixed(6)}, ${props.longitude!.toFixed(6)}`
})

const previewEmbedUrl = computed(() => {
  if (!hasMapCoordinates(props.latitude, props.longitude)) return ''
  return googleMapsEmbedUrl(props.latitude!, props.longitude!)
})

const previewLinkUrl = computed(() => {
  if (!hasMapCoordinates(props.latitude, props.longitude)) return ''
  return googleMapsPinUrl(props.latitude!, props.longitude!)
})

function setCoordinates(lat: number, lng: number) {
  emit('update:latitude', lat)
  emit('update:longitude', lng)
}

function clearPin() {
  mapUrlInput.value = ''
  parseMessage.value = ''
  parseSuccess.value = false
  emit('update:latitude', null)
  emit('update:longitude', null)
}

async function applyGoogleMapsUrl() {
  const raw = mapUrlInput.value.trim()
  if (!raw) return

  parsing.value = true
  parseMessage.value = ''
  parseSuccess.value = false

  try {
    const local = parseGoogleMapsCoordinates(raw)
    if (local) {
      setCoordinates(local.latitude, local.longitude)
      parseSuccess.value = true
      parseMessage.value = `บันทึกตำแหน่งสำเร็จ (${local.latitude.toFixed(6)}, ${local.longitude.toFixed(6)})`
      return
    }

    if (isLikelyGoogleMapsUrl(raw)) {
      const result = await $fetch<{ latitude: number, longitude: number }>(
        '/api/admin/parse-google-maps-url',
        { method: 'POST', body: { url: raw } },
      )
      setCoordinates(result.latitude, result.longitude)
      parseSuccess.value = true
      parseMessage.value = `บันทึกตำแหน่งสำเร็จ (${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)})`
      return
    }

    parseMessage.value = 'ไม่พบพิกัดในลิงก์นี้ — ลองคัดลอก URL จาก Google Maps อีกครั้ง'
  } catch (err: unknown) {
    parseMessage.value = (err as { statusMessage?: string })?.statusMessage
      || (err as { data?: { statusMessage?: string } })?.data?.statusMessage
      || 'แยกพิกัดจากลิงก์ไม่สำเร็จ'
  } finally {
    parsing.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row">
      <input
        v-model="mapUrlInput"
        type="text"
        inputmode="url"
        placeholder="https://www.google.com/maps/place/... หรือ 13.7563, 100.5018"
        class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        :disabled="disabled || parsing"
        @keydown.enter.prevent="applyGoogleMapsUrl"
      >
      <button
        type="button"
        class="shrink-0 rounded-lg bg-wp-navy px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
        :disabled="disabled || parsing"
        @click="applyGoogleMapsUrl"
      >
        {{ parsing ? 'กำลังแยกพิกัด...' : 'บันทึกตำแหน่ง' }}
      </button>
    </div>

    <p class="text-xs leading-relaxed text-slate-500">
      เปิด Google Maps → คลิกตำแหน่งทรัพย์ → คัดลอก URL จากแถบที่อยู่ แล้ววางด้านบน
    </p>

    <p
      v-if="parseMessage"
      class="text-sm"
      :class="parseSuccess ? 'text-green-700' : 'text-red-600'"
    >
      {{ parseMessage }}
    </p>

    <div
      v-if="hasMapCoordinates(latitude, longitude)"
      class="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-sm text-slate-700">
          <span class="font-medium text-slate-900">พิกัด:</span> {{ coordinateLabel }}
        </p>
        <div class="flex items-center gap-2">
          <a
            :href="previewLinkUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm font-medium text-wp-navy hover:underline"
          >
            เปิดใน Google Maps
          </a>
          <button
            type="button"
            class="text-sm text-red-600 hover:underline"
            :disabled="disabled"
            @click="clearPin"
          >
            ลบตำแหน่ง
          </button>
        </div>
      </div>
      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <iframe
          :src="previewEmbedUrl"
          class="h-48 w-full sm:h-56"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="ตัวอย่างตำแหน่งบนแผนที่"
        />
      </div>
    </div>
  </div>
</template>
