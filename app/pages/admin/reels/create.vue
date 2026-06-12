<script setup lang="ts">
import { emptyReelForm, type ReelFormData } from '~/types/reel'

definePageMeta({ layout: 'admin', title: 'เพิ่มคลิป' })

const form = ref<ReelFormData>(emptyReelForm())
const formRef = ref<{
  flushPendingMedia: (id: string) => Promise<{ posterUrl: string | null, videoUrl: string | null }>
} | null>(null)
const reelId = ref<string | null>(null)
const posterUrl = ref<string | null>(null)
const videoUrl = ref<string | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function flushMedia(id: string) {
  const uploaded = await formRef.value?.flushPendingMedia(id) ?? { posterUrl: null, videoUrl: null }
  if (uploaded.posterUrl) posterUrl.value = uploaded.posterUrl
  if (uploaded.videoUrl) videoUrl.value = uploaded.videoUrl
}

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    if (reelId.value) {
      const { item } = await $fetch<{
        item: { poster_url: string | null, video_url: string | null }
      }>(`/api/admin/reels/${reelId.value}`, {
        method: 'PATCH',
        body: form.value,
      })
      posterUrl.value = item.poster_url
      videoUrl.value = item.video_url
      await flushMedia(reelId.value)
    } else {
      const { item } = await $fetch<{ item: { id: string } }>(
        '/api/admin/reels',
        { method: 'POST', body: form.value },
      )
      reelId.value = item.id
      await flushMedia(item.id)
    }

    if (!posterUrl.value) {
      throw new Error('กรุณาอัปโหลดวิดีโอ')
    }

    successMessage.value = 'บันทึกแล้ว'
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    errorMessage.value = err.data?.statusMessage ?? err.message ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

function onValidationError(message: string) {
  errorMessage.value = message
}
</script>

<template>
  <div class="space-y-4">
    <NuxtLink to="/admin/reels" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการ
    </NuxtLink>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <ReelForm
      ref="formRef"
      v-model="form"
      :reel-id="reelId"
      :poster-url="posterUrl"
      :video-url="videoUrl"
      :saving="saving"
      @update:poster-url="posterUrl = $event"
      @update:video-url="videoUrl = $event"
      @validation-error="onValidationError"
      @submit="onSubmit"
    >
      <template v-if="reelId" #actions>
        <NuxtLink
          :to="`/admin/reels/${reelId}/edit`"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          ไปหน้าแก้ไข
        </NuxtLink>
      </template>
    </ReelForm>
  </div>
</template>
