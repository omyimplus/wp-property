<script setup lang="ts">
import {
  LOAN_OCCUPATION_OPTIONS,
  LOAN_STATUSES,
  validateLoanForm,
  type LoanApplicationFormData,
  type LoanOccupationKind,
} from '~/types/loan-application'

const props = withDefaults(
  defineProps<{
    modelValue: LoanApplicationFormData
    saving?: boolean
    readonly?: boolean
    /** แสดงฟิลด์สถานะ (ปิดในหน้าที่ลูกค้ากรอกเอง) */
    showStatus?: boolean
  }>(),
  { showStatus: false },
)

const emit = defineEmits<{
  'update:modelValue': [LoanApplicationFormData]
  submit: []
}>()

const validationError = ref('')

const statusOptions = computed(() =>
  LOAN_STATUSES.filter(s => s.value !== 'rejected'),
)

const stackFields = computed(() => !props.showStatus)

const fieldGridClass = computed(() =>
  stackFields.value ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-2',
)

const showOccupationOther = computed(
  () => props.modelValue.occupation_kind === 'other',
)

function setField<K extends keyof LoanApplicationFormData>(
  key: K,
  value: LoanApplicationFormData[K],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function onOccupationKindChange(kind: LoanOccupationKind) {
  emit('update:modelValue', {
    ...props.modelValue,
    occupation_kind: kind,
    occupation_other: kind === 'other' ? props.modelValue.occupation_other : null,
  })
}

function onSubmit() {
  if (props.readonly) return
  const err = validateLoanForm(props.modelValue)
  if (err) {
    validationError.value = err
    document.getElementById('loan-form-validation')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    return
  }
  validationError.value = ''
  emit('submit')
}
</script>

<template>
  <form class="space-y-8" novalidate @submit.prevent="onSubmit">
    <p
      v-if="validationError"
      id="loan-form-validation"
      class="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      {{ validationError }}
    </p>

    <section class="rounded-xl border border-sky-200 bg-sky-50/40 p-6 shadow-sm">
      <h3 class="mb-4 font-semibold text-sky-950">ข้อมูลรวมหนี้</h3>
      <div :class="fieldGridClass">
        <div :class="stackFields ? '' : 'sm:col-span-2'">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            ชื่อ-นามสกุล <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.customer_name"
            type="text"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('customer_name', ($event.target as HTMLInputElement).value)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            อายุ <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.age ?? ''"
            type="number"
            min="18"
            max="120"
            step="1"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('age', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            จำนวนหนี้ทั้งหมดที่ต้องการปิด (บาท) <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.debt_amount ?? ''"
            type="number"
            min="0"
            step="0.01"
            placeholder="ในระบบ/นอกระบบ"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('debt_amount', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div :class="stackFields ? '' : 'sm:col-span-2'">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            เคยมีประวัติหรือติดบูโรหรือไม่ (ถ้ามี)
          </label>
          <textarea
            :value="modelValue.bureau_record ?? ''"
            rows="2"
            placeholder="ระบุรายละเอียด (ถ้ามี)"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('bureau_record', ($event.target as HTMLTextAreaElement).value || null)"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            อาชีพปัจจุบัน <span class="text-red-600">*</span>
          </label>
          <select
            :value="modelValue.occupation_kind"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @change="onOccupationKindChange(($event.target as HTMLSelectElement).value as typeof modelValue.occupation_kind)"
          >
            <option v-for="opt in LOAN_OCCUPATION_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div v-if="showOccupationOther">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            ระบุอาชีพ (อื่นๆ) <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.occupation_other ?? ''"
            type="text"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('occupation_other', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            เงินเดือนหรือรายได้ต่อเดือน (บาท) <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.monthly_income ?? ''"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('monthly_income', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div :class="stackFields ? '' : 'sm:col-span-2'">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            ทำเลที่สนใจเป็นพิเศษ <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.preferred_location ?? ''"
            type="text"
            placeholder="เช่น บางนา, ลาดพร้าว, ใกล้ BTS..."
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('preferred_location', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            เบอร์โทรศัพท์ <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.callback_phone"
            type="tel"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('callback_phone', ($event.target as HTMLInputElement).value)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Line ID (ถ้ามี)
          </label>
          <input
            :value="modelValue.callback_line ?? ''"
            type="text"
            placeholder="@lineid"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('callback_line', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
      </div>
    </section>

    <section
      v-if="!readonly && showStatus"
      class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label class="mb-1 block text-sm font-medium text-slate-700">สถานะ</label>
      <select
        :value="modelValue.status"
        class="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2"
        @change="setField('status', ($event.target as HTMLSelectElement).value as typeof modelValue.status)"
      >
        <option v-for="s in statusOptions" :key="s.value" :value="s.value">
          {{ s.label }}
        </option>
      </select>
    </section>

    <div v-if="!readonly" class="flex justify-end gap-2">
      <slot name="actions" />
      <button
        type="submit"
        :disabled="saving"
        class="rounded-lg bg-wp-navy px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
      >
        {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
      </button>
    </div>
  </form>
</template>
