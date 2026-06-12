<script setup lang="ts">
const aboutSectionKeys = [
  'debtConsolidation',
  'consignSale',
  'rentalManagement',
  'whyChooseUs',
] as const

type AboutSectionKey = (typeof aboutSectionKeys)[number]

const sectionLeadKeys: Partial<Record<AboutSectionKey, 'helpsLead' | 'servicesLead' | 'suitableLead'>> = {
  debtConsolidation: 'helpsLead',
  consignSale: 'servicesLead',
  rentalManagement: 'suitableLead',
}

definePageMeta({ layout: 'default' })

const { t, te } = useI18n()
const localePath = useLocalePath()

function sectionPoints(key: AboutSectionKey): string[] {
  const points: string[] = []
  for (let i = 0; te(`pages.about.sections.${key}.points.${i}`); i++) {
    points.push(t(`pages.about.sections.${key}.points.${i}`))
  }
  return points
}

useStaticPageSeo('pages.about.title', 'pages.about.subtitle')
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.about.title')" :subtitle="t('pages.about.subtitle')" />

    <section id="about" class="py-12 sm:py-14">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <div class="text-sm leading-relaxed text-slate-700 sm:text-base">
          <p class="text-base font-medium text-wp-navy sm:text-lg">
            {{ t('pages.about.lead') }}
          </p>
          <p class="mt-5 whitespace-pre-line">
            {{ t('pages.about.intro') }}
          </p>
        </div>

        <div class="mt-10 space-y-3">
          <details
            v-for="key in aboutSectionKeys"
            :key="key"
            class="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-wp-navy transition hover:bg-slate-50 sm:px-6 sm:text-base [&::-webkit-details-marker]:hidden"
            >
              <span>{{ t(`pages.about.sections.${key}.title`) }}</span>
              <svg
                class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>

            <div class="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-700 sm:px-6 sm:pb-6 sm:text-base">
              <p>{{ t(`pages.about.sections.${key}.intro`) }}</p>

              <template v-if="sectionLeadKeys[key]">
                <p class="mt-4 font-medium text-slate-900">
                  {{ t(`pages.about.sections.${key}.${sectionLeadKeys[key]}`) }}
                </p>
              </template>

              <ul v-if="sectionPoints(key).length" class="mt-3 space-y-2">
                <li
                  v-for="(point, index) in sectionPoints(key)"
                  :key="index"
                  class="flex gap-2"
                >
                  <span class="shrink-0 text-emerald-600" aria-hidden="true">✅</span>
                  <span>{{ point }}</span>
                </li>
              </ul>

              <p v-if="t(`pages.about.sections.${key}.outro`)" class="mt-4">
                {{ t(`pages.about.sections.${key}.outro`) }}
              </p>
            </div>
          </details>
        </div>

        <div class="mt-10 flex flex-wrap gap-3">
          <NuxtLink
            :to="localePath('/services')"
            class="rounded-xl bg-wp-navy px-6 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
          >
            {{ t('pages.services.title') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/contact')"
            class="rounded-xl border border-wp-navy px-6 py-2.5 text-sm font-medium text-wp-navy transition hover:bg-slate-50"
          >
            {{ t('pages.contact.title') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
