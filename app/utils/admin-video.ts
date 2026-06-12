export const ADMIN_VIDEO_INPUT_TYPES = ['video/mp4', 'video/webm'] as const
export const ADMIN_VIDEO_MAX_BYTES = 50 * 1024 * 1024

export function isAllowedAdminVideoInput(file: File) {
  if (ADMIN_VIDEO_INPUT_TYPES.includes(file.type as (typeof ADMIN_VIDEO_INPUT_TYPES)[number])) {
    return true
  }
  const name = file.name.toLowerCase()
  return name.endsWith('.mp4') || name.endsWith('.webm')
}

export function assertAdminVideoWithinLimit(file: File) {
  if (!isAllowedAdminVideoInput(file)) {
    throw new Error('วิดีโอไม่รองรับ (ใช้ MP4 หรือ WebM เท่านั้น)')
  }
  if (file.size > ADMIN_VIDEO_MAX_BYTES) {
    throw new Error('วิดีโอใหญ่เกินไป (สูงสุด 50MB)')
  }
}

export function adminVideoExtension(mime: string) {
  return mime === 'video/webm' ? 'webm' : 'mp4'
}

/** MIME ที่ส่งไป Storage — รองรับ quicktime / ชื่อไฟล์ .mp4 */
export function adminVideoContentType(mime: string, filename: string): string {
  if (mime === 'video/webm') return 'video/webm'
  if (mime === 'video/mp4' || mime === 'video/quicktime') return 'video/mp4'
  const name = filename.toLowerCase()
  if (name.endsWith('.webm')) return 'video/webm'
  return 'video/mp4'
}

/** ดึงเฟรมจากวิดีโอเป็น WebP สำหรับ poster carousel (client-side เท่านั้น) */
export async function captureVideoPosterFile(videoFile: File): Promise<File> {
  assertAdminVideoWithinLimit(videoFile)
  const objectUrl = URL.createObjectURL(videoFile)

  try {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.src = objectUrl

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error('โหลดวิดีโอไม่สำเร็จ'))
    })

    const seekTime = video.duration > 0 ? Math.min(0.5, video.duration / 3) : 0.1
    video.currentTime = seekTime

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve()
      video.onerror = () => reject(new Error('อ่านเฟรมวิดีโอไม่สำเร็จ'))
    })

    const maxWidth = 800
    const scale = video.videoWidth > maxWidth ? maxWidth / video.videoWidth : 1
    const width = Math.max(1, Math.round(video.videoWidth * scale))
    const height = Math.max(1, Math.round(video.videoHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('สร้าง poster ไม่สำเร็จ')
    ctx.drawImage(video, 0, 0, width, height)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result)
          else reject(new Error('สร้าง poster ไม่สำเร็จ'))
        },
        'image/webp',
        0.85,
      )
    })

    return new File([blob], 'poster.webp', { type: 'image/webp' })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
