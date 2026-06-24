<script setup lang="ts">
import Editor from '@tinymce/tinymce-vue'
import type { Editor as TinyMCEEditor, RawEditorOptions } from 'tinymce'
import { TINYMCE_SELF_HOST_INIT } from '~/utils/tinymce-selfhost'
import '~/utils/tinymce-selfhost'
import {
  ADMIN_IMAGE_INPUT_TYPES,
  isAllowedAdminImageInput,
} from '~/utils/admin-image'
import { ADMIN_VIDEO_INPUT_TYPES, isAllowedAdminVideoInput } from '~/utils/admin-video'
import { diffRemovedStoragePaths } from '~/utils/rich-text-media'
import { tinymceContentStyle } from '~/utils/rich-content-css'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    disabled?: boolean
    contentItemId?: string | null
    mediaEntity?: 'ic' | 'articles'
  }>(),
  {
    placeholder: 'พิมพ์เนื้อหา...',
    disabled: false,
    contentItemId: null,
    mediaEntity: 'ic',
  },
)

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const itemIdRef = toRef(() => props.contentItemId)
const mediaEntityRef = toRef(() => props.mediaEntity)
const { uploadImage, uploadVideo, removeMedia, canUpload } = useRichTextMediaUpload(itemIdRef, mediaEntityRef)

const editorRef = shallowRef<TinyMCEEditor | null>(null)
const trackedHtml = ref(props.modelValue || '')
const mediaError = ref('')
const mediaUploading = ref(false)

const imageAccept = ADMIN_IMAGE_INPUT_TYPES.join(',')
const videoAccept = ADMIN_VIDEO_INPUT_TYPES.join(',')

function escapeAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

function syncTrackedHtml(html: string) {
  trackedHtml.value = html
}

async function cleanupRemovedMedia(oldHtml: string, newHtml: string) {
  if (!props.contentItemId) return
  const removed = diffRemovedStoragePaths(oldHtml, newHtml)
  if (!removed.length) return
  try {
    await removeMedia(removed)
  } catch (e: unknown) {
    mediaError.value = e instanceof Error ? e.message : 'ลบไฟล์สื่อไม่สำเร็จ'
  }
}

function onHtmlChange(html: string) {
  const previous = trackedHtml.value
  syncTrackedHtml(html)
  emit('update:modelValue', html)
  void cleanupRemovedMedia(previous, html)
}

function onUpdateModelValue(html: string) {
  onHtmlChange(html)
}

function requireUploadAccess() {
  if (!canUpload.value) {
    mediaError.value = 'บันทึกข้อมูลก่อน แล้วค่อยแนบรูป/วิดีโอในเนื้อหา'
    return false
  }
  mediaError.value = ''
  return true
}

function mediaErrorMessage(e: unknown, fallback: string) {
  const err = e as { data?: { statusMessage?: string }, message?: string }
  return err.data?.statusMessage ?? (e instanceof Error ? e.message : fallback)
}

async function uploadImageFile(file: File) {
  if (!requireUploadAccess()) return null
  mediaUploading.value = true
  try {
    return await uploadImage(file)
  } catch (e: unknown) {
    mediaError.value = mediaErrorMessage(e, 'อัปโหลดรูปไม่สำเร็จ')
    return null
  } finally {
    mediaUploading.value = false
  }
}

function tagUploadedImage(publicUrl: string, storagePath: string) {
  const editor = editorRef.value
  if (!editor) return
  editor.getBody().querySelectorAll(`img[src="${publicUrl}"]`).forEach((img) => {
    img.setAttribute('data-storage-path', storagePath)
  })
}

function insertImage(publicUrl: string, storagePath: string) {
  editorRef.value?.insertContent(
    `<p><img src="${escapeAttr(publicUrl)}" data-storage-path="${escapeAttr(storagePath)}" alt="" /></p>`,
  )
}

function insertVideo(publicUrl: string, storagePath: string) {
  editorRef.value?.insertContent(
    `<p><video src="${escapeAttr(publicUrl)}" data-storage-path="${escapeAttr(storagePath)}" controls="controls"></video></p>`,
  )
}

async function onImageSelected(fileList: FileList | File[] | null | undefined) {
  const file = Array.from(fileList ?? []).find(isAllowedAdminImageInput)
  if (!file) return
  const result = await uploadImageFile(file)
  if (result) insertImage(result.publicUrl, result.storagePath)
}

async function onVideoSelected(fileList: FileList | File[] | null | undefined) {
  const file = Array.from(fileList ?? []).find(isAllowedAdminVideoInput)
  if (!file || !requireUploadAccess()) return
  mediaUploading.value = true
  try {
    const { publicUrl, storagePath } = await uploadVideo(file)
    insertVideo(publicUrl, storagePath)
  } catch (e: unknown) {
    mediaError.value = mediaErrorMessage(e, 'อัปโหลดวิดีโอไม่สำเร็จ')
  } finally {
    mediaUploading.value = false
  }
}

function pickImageFile() {
  if (!requireUploadAccess()) return
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = imageAccept
  input.onchange = () => {
    void onImageSelected(input.files)
    input.remove()
  }
  input.click()
}

function pickVideoFile() {
  if (!requireUploadAccess()) return
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = videoAccept
  input.onchange = () => {
    void onVideoSelected(input.files)
    input.remove()
  }
  input.click()
}

function onEditorInit(_evt: unknown, editor: TinyMCEEditor) {
  editorRef.value = editor
  editor.mode.set(props.disabled ? 'readonly' : 'design')
  syncTrackedHtml(editor.getContent())
}

const editorInit = computed<RawEditorOptions>(() => ({
  ...TINYMCE_SELF_HOST_INIT,
  height: 420,
  menubar: 'file edit view insert format tools table help',
  placeholder: props.placeholder,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
    'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media',
    'table', 'help', 'wordcount', 'directionality', 'visualchars', 'nonbreaking',
  ],
  toolbar:
    'undo redo | blocks fontsize | bold italic underline strikethrough | forecolor backcolor | '
    + 'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | '
    + 'link image uploadvideo media table | removeformat code fullscreen preview',
  toolbar_mode: 'sliding',
  branding: false,
  promotion: false,
  relative_urls: false,
  convert_urls: true,
  automatic_uploads: true,
  paste_data_images: true,
  image_uploadtab: true,
  image_advtab: false,
  extended_valid_elements:
    'img[src|alt|width|height|class|data-storage-path],'
    + 'video[src|controls|width|height|class|data-storage-path|poster]',
  content_style: tinymceContentStyle,
  images_upload_handler: async (blobInfo) => {
    const file = new File(
      [blobInfo.blob()],
      blobInfo.filename() || 'image.png',
      { type: blobInfo.blob().type || 'image/png' },
    )
    const result = await uploadImageFile(file)
    if (!result) throw new Error(mediaError.value || 'อัปโหลดรูปไม่สำเร็จ')
    queueMicrotask(() => tagUploadedImage(result.publicUrl, result.storagePath))
    return result.publicUrl
  },
  setup(editor) {
    editor.ui.registry.addButton('uploadvideo', {
      text: 'วิดีโอ',
      tooltip: 'อัปโหลดวิดีโอ',
      onAction: () => pickVideoFile(),
    })

    editor.on('BeforeExecCommand', (event) => {
      if (event.command === 'mceImage') {
        event.preventDefault()
        pickImageFile()
      }
    })
  },
}))

watch(
  () => props.modelValue,
  (val) => {
    const editor = editorRef.value
    if (!editor) return
    const html = val || ''
    if (editor.getContent() !== html) {
      editor.setContent(html)
      syncTrackedHtml(html)
    }
  },
)

watch(
  () => props.disabled,
  (val) => {
    editorRef.value?.mode.set(val ? 'readonly' : 'design')
  },
)

onMounted(() => {
  syncTrackedHtml(props.modelValue || '')
})
</script>

<template>
  <div class="rich-text-editor relative overflow-hidden rounded-lg border border-slate-300 bg-white">
    <Editor
      license-key="gpl"
      :model-value="modelValue"
      :init="editorInit"
      :disabled="disabled"
      @init="onEditorInit"
      @update:model-value="onUpdateModelValue"
    />

    <div
      v-if="mediaUploading"
      class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-slate-600"
    >
      กำลังอัปโหลด...
    </div>

    <p v-if="!canUpload && !disabled" class="border-t border-slate-100 px-3 py-2 text-xs text-slate-400">
      บันทึกข้อมูลก่อน แล้วค่อยแนบรูป/วิดีโอในเนื้อหา
    </p>
    <p v-if="mediaError" class="border-t border-slate-100 px-3 py-2 text-sm text-red-600">
      {{ mediaError }}
    </p>
  </div>
</template>

<style scoped>
.rich-text-editor :deep(.tox-tinymce) {
  border: none;
  border-radius: 0;
}

.rich-text-editor :deep(.tox-editor-header) {
  border-bottom: 1px solid #e2e8f0;
  box-shadow: none;
}
</style>
