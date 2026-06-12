<script setup lang="ts">
import {
  emptyPropertyCustomerForm,
  type PropertyCustomerFormData,
  type PropertyCustomerImage,
} from '~/types/property-customer'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const form = ref<PropertyCustomerFormData>(emptyPropertyCustomerForm())
const consignmentId = ref<string | null>(null)
const images = ref<PropertyCustomerImage[]>([])
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { consignment } = await $fetch<{ consignment: { id: string } }>(
      '/api/public/consignments',
      { method: 'POST', body: form.value },
    )
    consignmentId.value = consignment.id
    successMessage.value = t('pages.forms.consignSuccess')
    form.value = emptyPropertyCustomerForm()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? t('pages.forms.error')
  } finally {
    saving.value = false
  }
}

useHead({ title: () => t('pages.consign.title') })
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.consign.title')" :subtitle="t('pages.consign.subtitle')" />

    <section id="consign-buy" class="py-10">
      <div class="mx-auto max-w-4xl px-4 sm:px-6">
        <p class="mb-6 text-sm text-slate-600">
          {{ t('pages.consign.adminNote') }}
        </p>
        <p v-if="successMessage" class="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
          {{ successMessage }}
        </p>
        <p v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
        <PropertyForm
          v-model="form"
          mode="consignment"
          :property-id="consignmentId"
          :images="images"
          :show-images="false"
          :saving="saving"
          @update:images="images = $event"
          @submit="onSubmit"
        />
      </div>
    </section>
  </div>
</template>
