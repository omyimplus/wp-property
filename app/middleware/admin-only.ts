export default defineNuxtRouteMiddleware(async () => {
  const { profile, fetchProfile } = useStaffProfile()

  if (!profile.value) {
    await fetchProfile()
  }

  if (profile.value?.role !== 'admin') {
    return navigateTo('/admin')
  }
})
