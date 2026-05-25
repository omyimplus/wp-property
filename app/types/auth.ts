export type StaffRole = 'employee' | 'admin'

export interface StaffProfile {
  id: string
  email: string
  full_name: string | null
  role: StaffRole
  is_active: boolean
  created_at: string
  updated_at: string
}
