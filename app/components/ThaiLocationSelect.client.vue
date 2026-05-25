<script setup lang="ts">
import type { ThaiLocationValue } from '~/types/thai-location'

const props = withDefaults(
  defineProps<{
    modelValue: ThaiLocationValue
    labelSize?: 'form' | 'filter'
    required?: boolean
    allowEmpty?: boolean
  }>(),
  {
    labelSize: 'form',
    allowEmpty: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [ThaiLocationValue]
}>()

const { provinceOptions, districtOptions, subdistrictOptions } = useThaiLocations()

const selectClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'

const provinces = computed(() => provinceOptions(props.modelValue.province))
const districts = computed(() =>
  districtOptions(props.modelValue.province, props.modelValue.district),
)
const subdistricts = computed(() =>
  subdistrictOptions(
    props.modelValue.province,
    props.modelValue.district,
    props.modelValue.subdistrict,
  ),
)

const emptyProvince = computed(() =>
  props.allowEmpty && props.labelSize !== 'form' ? 'ทั้งหมด' : '— เลือกจังหวัด —',
)
const emptyDistrict = computed(() =>
  props.allowEmpty && props.labelSize !== 'form' ? 'ทั้งหมด' : '— เลือกอำเภอ —',
)
const emptySubdistrict = computed(() =>
  props.allowEmpty && props.labelSize !== 'form' ? 'ทั้งหมด' : '— เลือกตำบล —',
)

const districtEnabled = computed(() => Boolean(props.modelValue.province))
const subdistrictEnabled = computed(
  () => Boolean(props.modelValue.province && props.modelValue.district),
)

function patch(next: Partial<ThaiLocationValue>) {
  emit('update:modelValue', { ...props.modelValue, ...next })
}

function onProvinceChange(e: Event) {
  const province = (e.target as HTMLSelectElement).value
  patch({ province, district: '', subdistrict: '' })
}

function onDistrictChange(e: Event) {
  const district = (e.target as HTMLSelectElement).value
  patch({ district, subdistrict: '' })
}

function onSubdistrictChange(e: Event) {
  patch({ subdistrict: (e.target as HTMLSelectElement).value })
}
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <div>
      <label
        class="mb-1 block"
        :class="labelSize === 'form' ? 'text-sm font-medium text-slate-700' : 'text-xs text-slate-500'"
      >
        จังหวัด<span v-if="required && labelSize === 'form'" class="text-red-600"> *</span>
      </label>
      <select
        :value="modelValue.province"
        :class="selectClass"
        @change="onProvinceChange"
      >
        <option value="">{{ emptyProvince }}</option>
        <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
      </select>
    </div>
    <div>
      <label
        class="mb-1 block"
        :class="labelSize === 'form' ? 'text-sm font-medium text-slate-700' : 'text-xs text-slate-500'"
      >
        อำเภอ<span v-if="required && labelSize === 'form'" class="text-red-600"> *</span>
      </label>
      <select
        :value="modelValue.district"
        :disabled="!districtEnabled"
        :class="selectClass"
        @change="onDistrictChange"
      >
        <option value="">{{ emptyDistrict }}</option>
        <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
      </select>
    </div>
    <div>
      <label
        class="mb-1 block"
        :class="labelSize === 'form' ? 'text-sm font-medium text-slate-700' : 'text-xs text-slate-500'"
      >
        ตำบล<span v-if="required && labelSize === 'form'" class="text-red-600"> *</span>
      </label>
      <select
        :value="modelValue.subdistrict"
        :disabled="!subdistrictEnabled"
        :class="selectClass"
        @change="onSubdistrictChange"
      >
        <option value="">{{ emptySubdistrict }}</option>
        <option v-for="s in subdistricts" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>
  </div>
</template>
