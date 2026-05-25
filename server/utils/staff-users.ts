import type { StaffRole } from '~/types/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function parseStaffRole(value: unknown): StaffRole | null {
  if (value === 'employee' || value === 'admin') return value
  return null
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null
  const trimmed = email.trim().toLowerCase()
  if (!EMAIL_RE.test(trimmed)) return null
  return trimmed
}

export function validatePassword(password: unknown, min = 6): string | null {
  if (typeof password !== 'string' || password.length < min) return null
  return password
}

export function validateFullName(name: unknown): string | null {
  if (name === undefined || name === null || name === '') return null
  if (typeof name !== 'string') return null
  const trimmed = name.trim()
  return trimmed.length > 0 ? trimmed : null
}
