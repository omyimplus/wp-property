import type { AuthError } from '@supabase/supabase-js'

const QUERY_ERRORS: Record<string, string> = {
  unauthorized:
    'บัญชีนี้ไม่มีสิทธิ์เข้าระบบหลังบ้าน กรุณาติดต่อผู้ดูแลระบบ',
  inactive: 'บัญชีถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
  session: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
}

export function authMessageFromQuery(code: string | undefined): string | null {
  if (!code) return null
  return QUERY_ERRORS[code] ?? null
}

export function authMessageFromSupabase(error: AuthError): string {
  const msg = error.message.toLowerCase()

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  }
  if (msg.includes('email not confirmed')) {
    return 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
  }
  if (msg.includes('too many requests')) {
    return 'ลองเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่'
  }

  return error.message
}
