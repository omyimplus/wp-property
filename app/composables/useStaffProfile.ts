import type { StaffProfile } from '~/types/auth'

const PROFILE_STATE_KEY = 'staff-profile'

export type ProfileFetchReason = 'no_user_id' | 'no_row' | 'inactive' | null

export function useStaffProfile() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const profile = useState<StaffProfile | null>(PROFILE_STATE_KEY, () => null)
  const loading = useState('staff-profile-loading', () => false)

  async function fetchProfile(userId?: string): Promise<{
    profile: StaffProfile | null
    error: Error | null
    reason: ProfileFetchReason
  }> {
    const id = userId ?? user.value?.sub
    if (!id) {
      profile.value = null
      return { profile: null, error: null, reason: 'no_user_id' }
    }

    loading.value = true
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    loading.value = false

    if (error) {
      profile.value = null
      return { profile: null, error: new Error(error.message), reason: null }
    }

    if (!data) {
      profile.value = null
      return { profile: null, error: null, reason: 'no_row' }
    }

    if (!data.is_active) {
      profile.value = null
      return { profile: null, error: null, reason: 'inactive' }
    }

    profile.value = data as StaffProfile
    return { profile: profile.value, error: null, reason: null }
  }

  async function syncAuthState() {
    const { data: claimsData } = await supabase.auth.getClaims()
    user.value = claimsData?.claims ?? null
  }

  function clearProfile() {
    profile.value = null
  }

  const isStaff = computed(() => !!profile.value?.is_active)
  const displayName = computed(
    () => profile.value?.full_name || profile.value?.email || user.value?.email || 'พนักงาน',
  )
  const roleLabel = computed(() => {
    if (profile.value?.role === 'admin') return 'ผู้ดูแลระบบ'
    if (profile.value?.role === 'employee') return 'พนักงาน'
    return ''
  })

  return {
    profile,
    loading,
    isStaff,
    displayName,
    roleLabel,
    fetchProfile,
    syncAuthState,
    clearProfile,
  }
}
