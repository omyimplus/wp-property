import { requireStaff } from '../../../../utils/require-staff'
import { uploadBodyMediaImage, uploadBodyMediaVideo } from '../../../../utils/body-media-upload'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(part => part.name === 'file' && part.data?.length)

  if (!filePart?.data) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบไฟล์' })
  }

  const filename = filePart.filename || 'upload'
  const mime = filePart.type || ''

  if (mime.startsWith('video/')) {
    return uploadBodyMediaVideo(event, id, 'articles', filePart.data, mime, filename)
  }

  if (mime !== 'image/webp') {
    throw createError({
      statusCode: 400,
      statusMessage: 'รูปต้องเป็น WebP (ระบบจะแปลงให้อัตโนมัติก่อนอัปโหลด)',
    })
  }

  return uploadBodyMediaImage(event, id, 'articles', filePart.data, filename)
})
