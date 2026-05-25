<script setup lang="ts">
import type { StaffProfile, StaffRole } from '~/types/auth'

definePageMeta({
  layout: 'admin',
  title: 'ผู้ใช้งาน',
  middleware: 'admin-only',
})

type ModalMode = 'create' | 'edit' | 'password' | null

const { profile: currentAdmin } = useStaffProfile()

const users = ref<StaffProfile[]>([])
const loading = ref(true)
const saving = ref(false)
const togglingId = ref<string | null>(null)
const errorMessage = ref('')
const successMessage = ref('')
const modal = ref<ModalMode>(null)
const selected = ref<StaffProfile | null>(null)

const form = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  full_name: '',
  role: 'employee' as StaffRole,
  is_active: true,
})

function isSelf(user: StaffProfile) {
  return currentAdmin.value?.id === user.id
}

function resetForm() {
  form.email = ''
  form.password = ''
  form.passwordConfirm = ''
  form.full_name = ''
  form.role = 'employee'
  form.is_active = true
}

function roleLabel(role: StaffRole) {
  return role === 'admin' ? 'ผู้ดูแลระบบ' : 'พนักงาน'
}

function clearAlerts() {
  errorMessage.value = ''
  successMessage.value = ''
}

async function loadUsers() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ users: StaffProfile[] }>('/api/admin/users')
    users.value = res.users
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    errorMessage.value = err.data?.statusMessage ?? err.statusMessage ?? 'โหลดรายการไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetForm()
  selected.value = null
  modal.value = 'create'
  clearAlerts()
}

function openEdit(user: StaffProfile) {
  selected.value = user
  form.email = user.email
  form.full_name = user.full_name ?? ''
  form.role = user.role
  form.is_active = user.is_active
  form.password = ''
  form.passwordConfirm = ''
  modal.value = 'edit'
  clearAlerts()
}

function openResetPassword(user: StaffProfile) {
  selected.value = user
  form.password = ''
  form.passwordConfirm = ''
  modal.value = 'password'
  clearAlerts()
}

function closeModal() {
  modal.value = null
  selected.value = null
}

async function toggleStatus(user: StaffProfile) {
  if (isSelf(user)) {
    errorMessage.value = 'ไม่สามารถเปลี่ยนสถานะบัญชีที่กำลังใช้งานอยู่ได้'
    return
  }

  const nextActive = !user.is_active
  const label = user.full_name || user.email

  if (!nextActive) {
    const ok = window.confirm(`ต้องการระงับบัญชี "${label}" ใช่หรือไม่?\nผู้ใช้จะเข้าระบบหลังบ้านไม่ได้จนกว่าจะเปิดใช้งานอีกครั้ง`)
    if (!ok) return
  }

  togglingId.value = user.id
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      body: { is_active: nextActive },
    })
    successMessage.value = nextActive
      ? `เปิดใช้งานบัญชี ${user.email} แล้ว`
      : `ระงับบัญชี ${user.email} แล้ว`
    await loadUsers()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'เปลี่ยนสถานะไม่สำเร็จ'
  } finally {
    togglingId.value = null
  }
}

async function submitCreate() {
  if (form.password !== form.passwordConfirm) {
    errorMessage.value = 'รหัสผ่านกับยืนยันรหัสผ่านไม่ตรงกัน'
    return
  }

  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        full_name: form.full_name || null,
        role: form.role,
        is_active: form.is_active,
      },
    })
    successMessage.value = 'สร้างผู้ใช้สำเร็จ'
    closeModal()
    await loadUsers()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'สร้างผู้ใช้ไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

async function submitEdit() {
  if (!selected.value) return

  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/users/${selected.value.id}`, {
      method: 'PATCH',
      body: {
        email: form.email,
        full_name: form.full_name || null,
        role: form.role,
        is_active: form.is_active,
      },
    })
    successMessage.value = 'บันทึกข้อมูลสำเร็จ'
    closeModal()
    await loadUsers()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

async function submitResetPassword() {
  if (!selected.value) return
  if (form.password !== form.passwordConfirm) {
    errorMessage.value = 'รหัสผ่านกับยืนยันรหัสผ่านไม่ตรงกัน'
    return
  }

  saving.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/admin/users/${selected.value.id}/password`, {
      method: 'PUT',
      body: { password: form.password },
    })
    successMessage.value = `รีเซ็ตรหัสผ่านของ ${selected.value.email} สำเร็จ`
    closeModal()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'รีเซ็ตรหัสผ่านไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">จัดการผู้ใช้งาน</h2>
        <p class="mt-1 text-sm text-slate-500">
          รีเซ็ตรหัสผ่าน · เปิด/ปิดสถานะบัญชี · แก้ไขข้อมูล (เฉพาะผู้ดูแลระบบ)
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        @click="openCreate"
      >
        + เพิ่มผู้ใช้
      </button>
    </div>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage && !modal" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div v-if="loading" class="p-8 text-center text-slate-500">กำลังโหลด...</div>

      <div v-else-if="users.length === 0" class="p-8 text-center text-slate-500">
        ยังไม่มีผู้ใช้ในระบบ
      </div>

      <table v-else class="w-full min-w-[720px] text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">ชื่อ</th>
            <th class="px-4 py-3 font-medium">อีเมล</th>
            <th class="px-4 py-3 font-medium">บทบาท</th>
            <th class="px-4 py-3 font-medium">สถานะ</th>
            <th class="px-4 py-3 font-medium text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="user in users"
            :key="user.id"
            class="text-slate-800"
            :class="{ 'bg-amber-50/40': isSelf(user) }"
          >
            <td class="px-4 py-3">
              {{ user.full_name || '—' }}
              <span v-if="isSelf(user)" class="ml-1 text-xs text-amber-700">(คุณ)</span>
            </td>
            <td class="px-4 py-3">{{ user.email }}</td>
            <td class="px-4 py-3">{{ roleLabel(user.role) }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'"
              >
                {{ user.is_active ? 'ใช้งาน' : 'ปิดใช้งาน' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  class="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  @click="openEdit(user)"
                >
                  แก้ไข
                </button>
                <button
                  type="button"
                  class="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs text-amber-900 hover:bg-amber-100"
                  @click="openResetPassword(user)"
                >
                  รีเซ็ตรหัสผ่าน
                </button>
                <button
                  type="button"
                  class="rounded-md px-2.5 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  :class="user.is_active
                    ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                    : 'border border-green-200 bg-green-50 text-green-800 hover:bg-green-100'"
                  :disabled="isSelf(user) || togglingId === user.id"
                  :title="isSelf(user) ? 'ไม่สามารถเปลี่ยนสถานะบัญชีตัวเอง' : undefined"
                  @click="toggleStatus(user)"
                >
                  {{
                    togglingId === user.id
                      ? 'กำลังบันทึก...'
                      : user.is_active
                        ? 'ปิดสถานะ'
                        : 'เปิดสถานะ'
                  }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="modal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="closeModal"
    >
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 class="text-lg font-semibold text-slate-900">
          <template v-if="modal === 'create'">เพิ่มผู้ใช้ใหม่</template>
          <template v-else-if="modal === 'edit'">แก้ไขผู้ใช้</template>
          <template v-else>รีเซ็ตรหัสผ่าน</template>
        </h3>
        <p v-if="modal === 'password' && selected" class="mt-1 text-sm text-slate-500">
          ตั้งรหัสผ่านใหม่ให้ {{ selected.email }}
        </p>

        <form
          class="mt-4 space-y-4"
          @submit.prevent="
            modal === 'create'
              ? submitCreate()
              : modal === 'edit'
                ? submitEdit()
                : submitResetPassword()
          "
        >
          <template v-if="modal !== 'password'">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">อีเมล</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
              <input
                v-model="form.full_name"
                type="text"
                class="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="ไม่บังคับ"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">บทบาท</label>
              <select
                v-model="form.role"
                class="w-full rounded-lg border border-slate-300 px-3 py-2"
                :disabled="selected && isSelf(selected)"
              >
                <option value="employee">พนักงาน</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </div>
            <label
              class="flex items-center gap-2 text-sm text-slate-700"
              :class="{ 'opacity-50': selected && isSelf(selected) }"
            >
              <input
                v-model="form.is_active"
                type="checkbox"
                class="rounded border-slate-300"
                :disabled="!!(selected && isSelf(selected))"
              >
              เปิดใช้งานบัญชี
            </label>
          </template>

          <template v-if="modal === 'create' || modal === 'password'">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ modal === 'create' ? 'รหัสผ่าน' : 'รหัสผ่านใหม่' }}
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                minlength="6"
                autocomplete="new-password"
                class="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">ยืนยันรหัสผ่าน</label>
              <input
                v-model="form.passwordConfirm"
                type="password"
                required
                minlength="6"
                autocomplete="new-password"
                class="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
            </div>
          </template>

          <p v-if="errorMessage && modal" class="text-sm text-red-600">{{ errorMessage }}</p>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              @click="closeModal"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {{
                saving
                  ? 'กำลังบันทึก...'
                  : modal === 'password'
                    ? 'รีเซ็ตรหัสผ่าน'
                    : 'บันทึก'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
