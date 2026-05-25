export type StaffRole = 'employee' | 'admin'

export interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  role: StaffRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: StaffRole
          is_active?: boolean
        }
        Update: {
          email?: string
          full_name?: string | null
          role?: StaffRole
          is_active?: boolean
        }
      }
    }
  }
}
