/** กว้างสูงสุดก่อนอัปโหลด (ไม่ขยายรูปเล็ก) */
export const PROPERTY_IMAGE_MAX_WIDTH = 1600
export const PROPERTY_IMAGE_WEBP_QUALITY = 0.85

/** รับจากผู้ใช้ — แปลงเป็น WebP ก่อนอัปโหลด */
export const PROPERTY_IMAGE_INPUT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export const PROPERTY_IMAGE_MIME = 'image/webp'

function targetDimensions(width: number, height: number, maxWidth: number) {
  if (width <= maxWidth) return { width, height }
  const h = Math.round(height * (maxWidth / width))
  return { width: maxWidth, height: h }
}

function loadImageSource(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`ไฟล์ ${file.name} ไม่ใช่รูปภาพที่อ่านได้`))
    }
    img.src = url
  })
}

function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('แปลงรูปเป็น WebP ไม่สำเร็จ'))
      },
      PROPERTY_IMAGE_MIME,
      quality,
    )
  })
}

function webpFileName(originalName: string) {
  const base = originalName.replace(/\.[^.]+$/, '').trim() || 'image'
  return `${base}.webp`
}

/**
 * ปรับขนาด (กว้างไม่เกิน PROPERTY_IMAGE_MAX_WIDTH) และแปลงเป็น WebP
 */
export async function preparePropertyImageForUpload(file: File): Promise<File> {
  if (!PROPERTY_IMAGE_INPUT_TYPES.includes(file.type as (typeof PROPERTY_IMAGE_INPUT_TYPES)[number])) {
    throw new Error(
      `ไฟล์ ${file.name} ไม่รองรับ (ใช้ JPG, PNG, WebP หรือ GIF เท่านั้น)`,
    )
  }

  const source = await loadImageSource(file)
  const srcW = source.naturalWidth
  const srcH = source.naturalHeight

  if (!srcW || !srcH) {
    throw new Error(`ไฟล์ ${file.name} ไม่ใช่รูปภาพที่ถูกต้อง`)
  }

  const { width, height } = targetDimensions(srcW, srcH, PROPERTY_IMAGE_MAX_WIDTH)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('ไม่สามารถประมวลผลรูปได้')

  ctx.drawImage(source, 0, 0, width, height)
  const blob = await canvasToWebpBlob(canvas, PROPERTY_IMAGE_WEBP_QUALITY)

  return new File([blob], webpFileName(file.name), { type: PROPERTY_IMAGE_MIME })
}

export function isAllowedPropertyImageInput(file: File) {
  return PROPERTY_IMAGE_INPUT_TYPES.includes(file.type as (typeof PROPERTY_IMAGE_INPUT_TYPES)[number])
}
