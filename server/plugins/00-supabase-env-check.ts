export default defineNitroPlugin(() => {
  const hasSecret = Boolean(
    process.env.NUXT_SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_KEY,
  )
  const hasPublic = Boolean(
    process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  )

  if (!hasSecret) {
    console.error(
      '[wp-property] NUXT_SUPABASE_SECRET_KEY is missing — admin create/upload APIs will return 503',
    )
  }
  if (!hasPublic) {
    console.error('[wp-property] NUXT_PUBLIC_SUPABASE_URL is missing')
  }
})
