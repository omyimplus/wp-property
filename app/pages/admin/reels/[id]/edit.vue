<script setup lang="ts">
import { emptyReelForm, type ReelFormData } from '~/types/reel'

definePageMeta({ layout: 'admin', title: 'แก้ไขคลิป' })

const route = useRoute()
const id = computed(() => String(route.params.id))

const form = ref<ReelFormData>(emptyReelForm())
const posterUrl = ref<string | null>(null)
const videoUrl = ref<string | null>(null)
const saving = ref(false)
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { item } = await $fetch<{
      item: ReelFormData & { poster_url?: string | null, video_url?: string | null }
    }>(`/api/admin/reels/${id.value}`)
    form.value = {
      link_url: item.link_url ?? '',
      sort_order: item.sort_order,
      status: item.status,
    }
    posterUrl.value = item.poster_url ?? null
    videoUrl.value = item.video_url ?? null
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { item } = await $fetch<{
      item: { poster_url: string | null, video_url: string | null }
    }>(`/api/admin/reels/${id.value}`, {
      method: 'PATCH',
      body: form.value,
    })
    posterUrl.value = item.poster_url
    videoUrl.value = item.video_url
    successMessage.value = 'บันทึกแล้ว'
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

function onValidationError(message: string) {
  errorMessage.value = message
}

onMounted(load)
</script>

<template>
  <div class="space-y-4">
    <NuxtLink to="/admin/reels" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการ
    </NuxtLink>

    <div v-if="loading" class="py-12 text-center text-slate-500">กำลังโหลด...</div>

    <template v-else>
      <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ errorMessage }}
      </p>

      <ReelForm
        v-model="form"
        :reel-id="id"
        :poster-url="posterUrl"
        :video-url="videoUrl"
        :saving="saving"
        @update:poster-url="posterUrl = $event"
        @update:video-url="videoUrl = $event"
        @validation-error="onValidationError"
        @submit="onSubmit"
      />
    </template>
  </div>
</template>
