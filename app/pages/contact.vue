<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: () => t('pages.contact.title') })
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.contact.title')" :subtitle="t('pages.contact.subtitle')" />

    <section id="contact" class="py-12">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 sm:px-6">
        <div class="space-y-4 text-sm text-slate-700 sm:text-base">
          <p>
            <span class="font-medium text-slate-900">{{ t('footer.addressLabel') }}:</span>
            {{ t('footer.address') }}
          </p>
          <p>
            <span class="font-medium text-slate-900">{{ t('footer.phoneLabel') }}:</span>
            <a href="tel:029999999" class="text-wp-navy hover:underline">{{ t('footer.phone') }}</a>
          </p>
          <p>
            <span class="font-medium text-slate-900">{{ t('footer.emailLabel') }}:</span>
            <a href="mailto:info@wpproperty.co.th" class="text-wp-navy hover:underline">{{ t('footer.email') }}</a>
          </p>
          <p>
            <span class="font-medium text-slate-900">{{ t('footer.lineLabel') }}:</span>
            {{ t('footer.line') }}
          </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 class="text-lg font-medium text-wp-navy">
            {{ t('pages.contact.servicesTitle') }}
          </h2>
          <ul class="mt-4 space-y-3 text-sm">
            <li>
              <NuxtLink :to="localePath('/services/loans')" class="text-wp-navy hover:underline">
                → {{ t('pages.loans.title') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/consign')" class="text-wp-navy hover:underline">
                → {{ t('pages.consign.title') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/rent')" class="text-wp-navy hover:underline">
                → {{ t('pages.rent.title') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="localePath('/properties')" class="text-wp-navy hover:underline">
                → {{ t('pages.properties.title') }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
