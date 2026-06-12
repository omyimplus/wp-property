<script setup lang="ts">
import { useI18n, useRequestURL } from '#imports'
import {
  emptyPropertyInquiryForm,
  validatePropertyInquiryForm,
  type PropertyInquiryFormData,
  type PropertyInquiryListingType,
} from '~/types/property-inquiry'
import {
  formatPropertyPrice,
  propertyLocationLine,
  type PublicPropertyListItem,
} from '~/types/public-property'

const props = defineProps<{
  open: boolean
  property: PublicPropertyListItem
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const requestURL = useRequestURL()

const form = ref<PropertyInquiryFormData>(emptyPropertyInquiryForm())
const validationKey = ref('')
const submitting = ref(false)
const submitError = ref('')
const submitted = ref(false)

const showListingChoice = computed(() => props.property.for_sale && props.property.for_rent)

const propertyTitle = computed(
  () => props.property.listing_title || props.property.project_name || props.property.property_code,
)

const propertyUrl = computed(() => {
  if (import.meta.client) {
    return window.location.href
  }
  return `${requestURL.origin}/properties/${props.property.property_code}`
})

function defaultListingType(): PropertyInquiryListingType {
  if (props.property.for_sale && !props.property.for_rent) return 'sale'
  if (props.property.for_rent && !props.property.for_sale) return 'rent'
  return 'sale'
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.value = emptyPropertyInquiryForm(defaultListingType())
      validationKey.value = ''
      submitError.value = ''
      submitted.value = false
    }
  },
)

function close() {
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (props.open && e.key === 'Escape' && !submitting.value) close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

async function onSubmit() {
  const key = validatePropertyInquiryForm(form.value)
  if (key) {
    validationKey.value = key
    return
  }

  validationKey.value = ''
  submitError.value = ''
  submitting.value = true

  try {
    await $fetch('/api/public/property-inquiries', {
      method: 'POST',
      body: {
        ...form.value,
        property_code: props.property.property_code,
        listing_title: props.property.listing_title,
        project_name: props.property.project_name,
        for_sale: props.property.for_sale,
        for_rent: props.property.for_rent,
        sale_price: props.property.sale_price,
        rent_price: props.property.rent_price,
        subdistrict: props.property.subdistrict,
        district: props.property.district,
        province: props.property.province,
        property_url: propertyUrl.value,
      },
    })
    submitted.value = true
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    submitError.value = err.data?.statusMessage
      ? t(`pages.properties.inquiry.${err.data.statusMessage}`, err.data.statusMessage)
      : t('pages.properties.inquiry.submitFailed')
  } finally {
    submitting.value = false
  }
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-wp-navy/40 focus:ring-1 focus:ring-wp-navy/20'
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      :aria-label="t('pages.properties.inquiry.title')"
      @click.self="!submitting && close()"
    >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 class="text-lg font-medium text-wp-navy">
              {{ t('pages.properties.inquiry.title') }}
            </h2>
            <p v-if="!submitted" class="mt-1 text-sm text-slate-600">
              {{ t('pages.properties.inquiry.subtitle') }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
            @click="close"
          >
            {{ submitted ? t('pages.properties.inquiry.done') : t('pages.properties.inquiry.cancel') }}
          </button>
        </div>

        <div v-if="submitted" class="space-y-4 px-5 py-8 text-center">
          <p class="text-sm text-slate-700">
            {{ t('pages.properties.inquiry.success') }}
          </p>
          <button
            type="button"
            class="rounded-xl bg-wp-navy px-6 py-2.5 text-sm font-medium text-white hover:brightness-110"
            @click="close"
          >
            {{ t('pages.properties.inquiry.done') }}
          </button>
        </div>

        <template v-else>
          <div class="border-b border-slate-100 bg-slate-50 px-5 py-4 text-sm">
            <p class="font-medium text-slate-800">
              {{ propertyTitle }}
            </p>
            <p class="mt-1 text-slate-600">
              {{ property.property_code }} · {{ propertyLocationLine(property) }}
            </p>
            <p class="mt-1 text-slate-700">
              <template v-if="property.for_sale">
                {{ t('common.sale') }}: {{ t('home.properties.price', { price: formatPropertyPrice(property.sale_price) }) }}
              </template>
              <template v-if="property.for_sale && property.for_rent"> · </template>
              <template v-if="property.for_rent">
                {{ t('common.rent') }}: {{ t('home.properties.price', { price: formatPropertyPrice(property.rent_price) }) }}
              </template>
            </p>
          </div>

          <form class="space-y-4 px-5 py-5" @submit.prevent="onSubmit">
            <p
              v-if="validationKey"
              class="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
            >
              {{ t(`pages.properties.inquiry.${validationKey}`) }}
            </p>
            <p v-if="submitError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ submitError }}
            </p>

            <fieldset v-if="showListingChoice" class="space-y-2">
              <legend class="mb-1 text-sm font-medium text-slate-700">
                {{ t('pages.properties.inquiry.listingType') }} <span class="text-red-600">*</span>
              </legend>
              <div class="flex flex-wrap gap-3">
                <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                  <input
                    v-model="form.listing_type"
                    type="radio"
                    value="sale"
                    class="text-wp-navy focus:ring-wp-navy/30"
                  >
                  {{ t('common.sale') }}
                </label>
                <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                  <input
                    v-model="form.listing_type"
                    type="radio"
                    value="rent"
                    class="text-wp-navy focus:ring-wp-navy/30"
                  >
                  {{ t('common.rent') }}
                </label>
              </div>
            </fieldset>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('pages.properties.inquiry.name') }} <span class="text-red-600">*</span>
              </label>
              <input
                v-model="form.customer_name"
                type="text"
                autocomplete="name"
                :class="inputClass"
              >
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('pages.properties.inquiry.phone') }} <span class="text-red-600">*</span>
              </label>
              <input
                v-model="form.callback_phone"
                type="tel"
                autocomplete="tel"
                :class="inputClass"
              >
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('pages.properties.inquiry.line') }} <span class="text-red-600">*</span>
              </label>
              <input
                v-model="form.callback_line"
                type="text"
                :class="inputClass"
              >
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('pages.properties.inquiry.note') }}
              </label>
              <textarea
                v-model="form.note"
                rows="3"
                :placeholder="t('pages.properties.inquiry.notePlaceholder')"
                class="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-wp-navy/40 focus:ring-1 focus:ring-wp-navy/20"
              />
            </div>

            <div class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                @click="close"
              >
                {{ t('pages.properties.inquiry.cancel') }}
              </button>
              <button
                type="submit"
                class="inline-flex items-center justify-center rounded-xl bg-wp-navy px-5 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
                :disabled="submitting"
              >
                {{ submitting ? t('pages.properties.inquiry.submitting') : t('pages.properties.inquiry.submit') }}
              </button>
            </div>
          </form>
        </template>
      </div>
    </div>
  </Teleport>
</template>
