import { serverSupabaseClient } from '#supabase/server'
import { attachImageUrls, PROPERTY_SELECT } from '../../utils/properties'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุรหัสทรัพย์' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('properties')
    .select(`${PROPERTY_SELECT}, property_images (id, storage_path, sort_order)`)
    .eq('property_code', code)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบทรัพย์ที่เผยแพร่แล้ว' })
  }

  const imgs = (data.property_images ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
  )
  const { property_images, ...rest } = data
  const withUrls = attachImageUrls(imgs, config.public.supabase.url)

  return {
    property: {
      ...rest,
      images: withUrls,
      cover_url: withUrls[0]?.public_url ?? null,
      image_urls: withUrls.map(i => i.public_url),
    },
  }
})
