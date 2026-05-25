import { authMessageFromSupabase } from '~/utils/auth-messages'
import type { ProfileFetchReason } from '~/composables/useStaffProfile'

function messageFromProfileReason(reason: ProfileFetchReason): string {
  switch (reason) {
    case 'no_row':
      return 'บัญชีนี้ยังไม่มีโปรไฟล์พนักงานในระบบ — ให้ผู้ดูแลเพิ่มในตาราง profiles หรือสร้างจากหน้า /admin/users'
    case 'inactive':
      return 'บัญชีถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ'
    case 'no_user_id':
      return 'ยืนยันตัวตนไม่สำเร็จ กรุณาลองเข้าสู่ระบบอีกครั้ง'
    default:
      return 'บัญชีนี้ไม่มีสิทธิ์เข้าระบบหลังบ้าน กรุณาติดต่อผู้ดูแลระบบ'
  }
}

export function useAdminAuth() {
  const supabase = useSupabaseClient()
  const { fetchProfile, clearProfile, syncAuthState } = useStaffProfile()

  async function signInWithEmail(email: string, password: string): Promise<{
    ok: boolean
    error: string | null
  }> {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      return { ok: false, error: authMessageFromSupabase(authError) }
    }

    const userId = data.user?.id
    if (!userId) {
      return { ok: false, error: 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่' }
    }

    await syncAuthState()

    const { profile, error: profileError, reason } = await fetchProfile(userId)

    if (profileError) {
      await supabase.auth.signOut()
      clearProfile()
      return {
        ok: false,
        error: `ไม่สามารถโหลดข้อมูลพนักงาน: ${profileError.message}`,
      }
    }

    if (!profile) {
      await supabase.auth.signOut()
      clearProfile()
      return { ok: false, error: messageFromProfileReason(reason) }
    }

    return { ok: true, error: null }
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
    clearProfile()
    await navigateTo('/admin/login')
  }

  async function ensureStaffSession(): Promise<boolean> {
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user?.id) {
      clearProfile()
      return false
    }

    await syncAuthState()
    const { profile } = await fetchProfile(data.session.user.id)
    return !!profile
  }

  return {
    signInWithEmail,
    signOut,
    ensureStaffSession,
  }
}
