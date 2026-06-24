<script setup lang="ts">
import {
  SALE_STATUSES,
  validateSaleForm,
  type SaleRequestFormData,
} from '~/types/sale-request'
import type { ThaiLocationValue } from '~/types/thai-location'

const props = withDefaults(
  defineProps<{
    modelValue: SaleRequestFormData
    saving?: boolean
    readonly?: boolean
    /** แสดงฟิลด์สถานะ (ปิดในหน้าที่ลูกค้ากรอกเอง) */
    showStatus?: boolean
  }>(),
  { showStatus: true },
)

const emit = defineEmits<{
  'update:modelValue': [SaleRequestFormData]
  submit: []
}>()

const validationError = ref('')

const statusOptions = computed(() =>
  SALE_STATUSES.filter(s => s.value !== 'rejected'),
)

const stackFields = computed(() => !props.showStatus)

const fieldGridClass = computed(() =>
  stackFields.value ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-2',
)

function setField<K extends keyof SaleRequestFormData>(
  key: K,
  value: SaleRequestFormData[K],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const location = computed<ThaiLocationValue>({
  get: () => ({
    province: props.modelValue.desired_province ?? '',
    district: props.modelValue.desired_district ?? '',
    subdistrict: props.modelValue.desired_subdistrict ?? '',
  }),
  set: (loc) => {
    emit('update:modelValue', {
      ...props.modelValue,
      desired_province: loc.province || null,
      desired_district: loc.district || null,
      desired_subdistrict: loc.subdistrict || null,
    })
  },
})

function onSubmit() {
  if (props.readonly) return
  const err = validateSaleForm(props.modelValue)
  if (err) {
    validationError.value = err
    document.getElementById('sale-form-validation')?.scrollIntoView({
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
      id="sale-form-validation"
      class="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      {{ validationError }}
    </p>

    <section class="rounded-xl border border-sky-200 bg-sky-50/40 p-6 shadow-sm">
      <h3 class="mb-4 font-semibold text-sky-950">ข้อมูลติดต่อ</h3>
      <div :class="fieldGridClass">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            ชื่อ <span class="text-red-600">*</span>
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
            เบอร์โทรติดต่อกลับ <span class="text-red-600">*</span>
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
            เบอร์โทร/ไลน์สำหรับติดต่อกลับ <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.callback_line"
            type="text"
            placeholder="เช่น 08x-xxx-xxxx หรือ Line ID"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('callback_line', ($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="mb-4 font-semibold text-slate-900">ช่วงราคาในการซื้อ (บาท)</h3>
      <div :class="fieldGridClass">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            ราคาต่ำสุด <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.purchase_budget_min ?? ''"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('purchase_budget_min', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            ราคาสูงสุด <span class="text-red-600">*</span>
          </label>
          <input
            :value="modelValue.purchase_budget_max ?? ''"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-50"
            :disabled="readonly"
            @input="setField('purchase_budget_max', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="mb-4 font-semibold text-slate-900">พื้นที่ต้องการซื้อ</h3>
      <ThaiLocationSelect
        v-model="location"
        label-size="form"
        :required="!readonly"
        :allow-empty="false"
        :stacked="stackFields"
      />
      <div class="mt-4">
        <label class="mb-1 block text-sm font-medium text-slate-700">
          รายละเอียดเพิ่มเติม (ถ้ามี)
        </label>
        <textarea
          :value="modelValue.desired_area_detail ?? ''"
          rows="3"
          placeholder="เช่น ใกล้ BTS, ต้องการ 2 ห้องนอน..."
          class="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:bg-slate-50"
          :disabled="readonly"
          @input="setField('desired_area_detail', ($event.target as HTMLTextAreaElement).value || null)"
        />
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
        class="rounded-lg bg-sky-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-60"
      >
        {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
      </button>
    </div>
  </form>
</template>
