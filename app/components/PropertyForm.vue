<script setup lang="ts">
import {
  FACING_DIRECTIONS,
  LISTING_MODES,
  PROPERTY_SOURCES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  RENT_DEPOSIT_MONTHS,
  validatePropertyCreateForm,
  type ListingMode,
  type PropertyFormData,
  type PropertyImage,
} from '~/types/property'
import {
  PROPERTY_CUSTOMER_STATUSES,
  validatePropertyCustomerContact,
  validatePropertyCustomerCreateForm,
  type PropertyCustomerFormData,
} from '~/types/property-customer'
import type { EntityImage } from '~/composables/useEntityImageUpload'
import type { ThaiLocationValue } from '~/types/thai-location'

type FormModel = PropertyFormData | PropertyCustomerFormData

const props = withDefaults(
  defineProps<{
    modelValue: FormModel
    propertyId?: string | null
    images?: EntityImage[]
    saving?: boolean
    codeReadonly?: boolean
    mode?: 'property' | 'consignment'
    readonly?: boolean
    showImages?: boolean
    imageApiBase?: string
  }>(),
  {
    mode: 'property',
    readonly: false,
    propertyId: null,
    images: () => [],
    showImages: true,
  },
)

const isConsignment = computed(() => props.mode === 'consignment')
const entityId = computed(() => props.propertyId)
const imageApiBase = computed(
  () => props.imageApiBase ?? (isConsignment.value ? '/api/admin/consignments' : '/api/admin/properties'),
)
const imagePathPrefix = (id: string) =>
  isConsignment.value ? `pc/${id}/` : `${id}/`

const statusOptions = computed(() =>
  isConsignment.value
    ? PROPERTY_CUSTOMER_STATUSES.filter(s => s.value !== 'approved')
    : PROPERTY_STATUSES,
)

const emit = defineEmits<{
  'update:modelValue': [PropertyFormData]
  'update:images': [PropertyImage[]]
  submit: []
}>()

const form = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const isRent = computed(() => form.value.listing_mode === 'rent')
/** ยังไม่บันทึกครั้งแรก = โหมดสร้าง — บังคับฟิลด์หลัก */
const isCreate = computed(() => !props.propertyId)
const validationError = ref('')

function setField<K extends keyof FormModel>(key: K, value: FormModel[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value } as FormModel)
}

const location = computed<ThaiLocationValue>({
  get: () => ({
    province: form.value.province ?? '',
    district: form.value.district ?? '',
    subdistrict: form.value.subdistrict ?? '',
  }),
  set: (loc) => {
    emit('update:modelValue', {
      ...props.modelValue,
      province: loc.province || null,
      district: loc.district || null,
      subdistrict: loc.subdistrict || null,
    })
  },
})

function setListingMode(mode: ListingMode) {
  const next: FormModel = {
    ...props.modelValue,
    listing_mode: mode,
    for_sale: mode === 'sale',
    for_rent: mode === 'rent',
  }
  if (mode === 'sale') {
    next.rent_price = null
    next.rent_deposit_months = null
  } else {
    next.sale_price = null
  }
  emit('update:modelValue', next)
}

const imagesSectionRef = ref<HTMLElement | null>(null)

function onFormSubmit() {
  if (props.readonly) return
  let err: string | null = null
  if (isConsignment.value) {
    const data = props.modelValue as PropertyCustomerFormData
    err = isCreate.value
      ? validatePropertyCustomerCreateForm(data)
      : validatePropertyCustomerContact(data)
  } else if (isCreate.value) {
    err = validatePropertyCreateForm(props.modelValue as PropertyFormData)
  }
  if (err) {
    validationError.value = err
    nextTick(() => {
      document.getElementById('property-form-validation')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
    return
  }
  validationError.value = ''
  emit('submit')
}

defineExpose({ scrollToImages: () => imagesSectionRef.value?.scrollIntoView({ behavior: 'smooth' }) })
</script>

<template>
  <form class="space-y-8" novalidate @submit.prevent="onFormSubmit">
    <p
      v-if="validationError"
      id="property-form-validation"
      class="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      {{ validationError }}
    </p>

    <section
      v-if="isConsignment"
      class="rounded-xl border border-violet-200 bg-violet-50/40 p-6 shadow-sm"
    >
      <h3 class="mb-4 font-semibold text-violet-950">ข้อมูลลูกค้าฝากขาย</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            ชื่อ<span v-if="isCreate" class="text-red-600"> *</span>
          </label>
          <input
            :value="(form as PropertyCustomerFormData).customer_name ?? ''"
            type="text"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            @input="setField('customer_name', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            เบอร์โทร<span v-if="isCreate" class="text-red-600"> *</span>
          </label>
          <input
            :value="(form as PropertyCustomerFormData).customer_phone ?? ''"
            type="tel"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            @input="setField('customer_phone', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            ไลน์<span v-if="isCreate" class="text-red-600"> *</span>
          </label>
          <input
            :value="(form as PropertyCustomerFormData).customer_line ?? ''"
            type="text"
            placeholder="เช่น Line ID หรือลิงก์"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            @input="setField('customer_line', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="mb-4 font-semibold text-slate-900">ข้อมูลทั่วไป</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-if="!isConsignment">
          <label class="mb-1 block text-sm font-medium text-slate-700">รหัสทรัพย์</label>
          <input
            :value="(form as PropertyFormData).property_code"
            type="text"
            readonly
            class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
            :placeholder="codeReadonly ? 'ระบบสร้างให้อัตโนมัติ' : ''"
          >
          <p v-if="!(form as PropertyFormData).property_code && !propertyId" class="mt-1 text-xs text-slate-500">
            จะได้รหัสอัตโนมัติเมื่อบันทึก (เช่น WP-0001)
          </p>
        </div>
        <div v-else class="sm:col-span-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900">
          ยังไม่มีรหัสทรัพย์ — ระบบจะสร้างรหัส WP เมื่อกด「อนุมัติเข้าระบบ」
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-700">หัวข้อประกาศ</label>
          <input
            :value="form.listing_title ?? ''"
            type="text"
            placeholder="เช่น บ้านเดี่ยวในโครงการใกล้สนามบิน"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('listing_title', ($event.target as HTMLInputElement).value || null)"
          >
          <p class="mt-1 text-xs text-slate-500">
            แสดงเป็น ({{ (form as PropertyFormData).property_code || 'WP-????' }}) หัวข้อประกาศ
          </p>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">โครงการ</label>
          <input
            :value="form.project_name ?? ''"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('project_name', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">ประเภททรัพย์ *</label>
          <select
            :value="form.property_type"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @change="setField('property_type', ($event.target as HTMLSelectElement).value as typeof form.property_type)"
          >
            <option v-for="t in PROPERTY_TYPES" :key="t.value" :value="t.value">
              {{ t.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">ประเภทประกาศ *</label>
          <select
            :value="form.listing_mode"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @change="setListingMode(($event.target as HTMLSelectElement).value as ListingMode)"
          >
            <option v-for="m in LISTING_MODES" :key="m.value" :value="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>
        <div v-if="!isConsignment">
          <label class="mb-1 block text-sm font-medium text-slate-700">เจ้าของทรัพย์ / แหล่งที่มา</label>
          <select
            v-if="propertyId"
            :value="form.property_source"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @change="setField('property_source', ($event.target as HTMLSelectElement).value as typeof form.property_source)"
          >
            <option v-for="s in PROPERTY_SOURCES" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
          <p
            v-else
            class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
          >
            สร้างจากระบบ
          </p>
          <p class="mt-1 text-xs text-slate-500">
            รายการที่ลูกค้าส่งผ่านหน้าเว็บจะถูกบันทึกเป็น「ลูกค้าฝากขายผ่านเว็บ」อัตโนมัติ
          </p>
        </div>
        <div v-else>
          <label class="mb-1 block text-sm font-medium text-slate-700">แหล่งที่มา</label>
          <p class="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900">
            ลูกค้าฝากขายผ่านเว็บ
          </p>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">สถานะ</label>
          <select
            :value="form.status"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @change="setField('status', ($event.target as HTMLSelectElement).value as typeof form.status)"
          >
            <option v-for="s in statusOptions" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
        </div>
        <div v-if="!isRent">
          <label class="mb-1 block text-sm font-medium text-slate-700">
            ราคาขาย (บาท)<span v-if="isCreate" class="text-red-600"> *</span>
          </label>
          <input
            :value="form.sale_price ?? ''"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('sale_price', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <template v-if="isRent">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">
              ราคาเช่า / เดือน (บาท)<span v-if="isCreate" class="text-red-600"> *</span>
            </label>
            <input
              :value="form.rent_price ?? ''"
              type="number"
              min="0"
              step="0.01"
              class="w-full rounded-lg border border-slate-300 px-3 py-2"
              @input="setField('rent_price', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
            >
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">มัดจำ (เดือน) *</label>
            <select
              :value="form.rent_deposit_months ?? ''"
              class="w-full rounded-lg border border-slate-300 px-3 py-2"
              @change="setField('rent_deposit_months', Number(($event.target as HTMLSelectElement).value))"
            >
              <option value="" disabled>เลือกจำนวนเดือน</option>
              <option v-for="m in RENT_DEPOSIT_MONTHS" :key="m" :value="m">
                {{ m }} เดือน
              </option>
            </select>
          </div>
        </template>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="mb-4 font-semibold text-slate-900">ที่อยู่</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            บ้านเลขที่<span v-if="isCreate" class="text-red-600"> *</span>
          </label>
          <input
            :value="form.house_number ?? ''"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('house_number', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">ซอย</label>
          <input
            :value="form.soi ?? ''"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('soi', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">หมู่</label>
          <input
            :value="form.moo ?? ''"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('moo', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">ถนน</label>
          <input
            :value="form.road ?? ''"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('road', ($event.target as HTMLInputElement).value || null)"
          >
        </div>
        <div class="sm:col-span-2">
          <ThaiLocationSelect
            v-model="location"
            label-size="form"
            :required="isCreate"
            :allow-empty="false"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">หันหน้าทิศ</label>
          <select
            :value="form.facing_direction ?? ''"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @change="setField('facing_direction', ($event.target as HTMLSelectElement).value || null)"
          >
            <option value="">— ไม่ระบุ —</option>
            <option
              v-if="form.facing_direction && !FACING_DIRECTIONS.some(d => d.value === form.facing_direction)"
              :value="form.facing_direction"
            >
              {{ form.facing_direction }}
            </option>
            <option v-for="d in FACING_DIRECTIONS" :key="d.value" :value="d.value">
              {{ d.label }}
            </option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-700">รายละเอียดเพิ่มเติม</label>
          <textarea
            :value="form.address_line ?? ''"
            rows="3"
            placeholder="เช่น ใกล้ BTS, หมายเหตุการเข้าชม"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('address_line', ($event.target as HTMLTextAreaElement).value || null)"
          />
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="mb-4 font-semibold text-slate-900">รายละเอียดทรัพย์</h3>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">จำนวนชั้น</label>
          <input
            :value="form.floors_total ?? ''"
            type="number"
            min="0"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('floors_total', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">อยู่ชั้นที่</label>
          <input
            :value="form.floor_number ?? ''"
            type="number"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('floor_number', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">ห้องนอน</label>
          <input
            :value="form.bedrooms ?? ''"
            type="number"
            min="0"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('bedrooms', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">ห้องน้ำ</label>
          <input
            :value="form.bathrooms ?? ''"
            type="number"
            min="0"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('bathrooms', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">ที่จอดรถ</label>
          <input
            :value="form.parking_spaces ?? ''"
            type="number"
            min="0"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('parking_spaces', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">เนื้อที่ (ตร.วา)</label>
          <input
            :value="form.land_area_sqm ?? ''"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('land_area_sqm', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">พื้นที่ใช้สอย (ตร.ม.)</label>
          <input
            :value="form.usable_area_sqm ?? ''"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('usable_area_sqm', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">อายุทรัพย์ (ปี)</label>
          <input
            :value="form.property_age_years ?? ''"
            type="number"
            min="0"
            class="w-full rounded-lg border border-slate-300 px-3 py-2"
            @input="setField('property_age_years', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
          >
        </div>
      </div>
    </section>

    <section
      v-if="showImages"
      id="property-images-section"
      ref="imagesSectionRef"
      class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 class="mb-1 font-semibold text-slate-900">รูปภาพ</h3>
      <p v-if="isCreate && !propertyId" class="mb-4 text-sm text-slate-500">
        เลือกรูปได้ก่อนบันทึก — ระบบจะอัปโหลดให้อัตโนมัติหลังกด「บันทึกข้อมูล」
      </p>
      <PropertyImageDropzone
        :entity-id="entityId"
        :images="images"
        :api-base="imageApiBase"
        :storage-path-prefix="imagePathPrefix"
        :disabled="saving || readonly"
        :allow-pending-before-save="isCreate && !readonly"
        @update:images="emit('update:images', $event)"
      />
    </section>

    <div class="flex justify-end gap-2">
      <slot name="actions" />
      <button
        v-if="!readonly"
        type="submit"
        :disabled="saving"
        class="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
      </button>
    </div>
  </form>
</template>
