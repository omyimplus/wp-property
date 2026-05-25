export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  const publicPaths = ['/admin/login', '/admin/confirm']
  if (publicPaths.includes(to.path)) return

  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const userId = data.session?.user?.id

  if (!userId) return

  const { profile, fetchProfile } = useStaffProfile()

  if (!profile.value) {
    const { profile: loaded, reason } = await fetchProfile(userId)
    if (!loaded) {
      await supabase.auth.signOut()
      useStaffProfile().clearProfile()
      const query = reason === 'inactive' ? 'inactive' : 'unauthorized'
      return navigateTo(`/admin/login?error=${query}`)
    }
  }
})
