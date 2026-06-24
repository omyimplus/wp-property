<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const { mailto, phoneHref, lineAddUrl, lineDisplay, mapEmbedUrl, mapOpenUrl } = useSiteContact()

useStaticPageSeo('pages.contact.title', 'pages.contact.subtitle')
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.contact.title')" :subtitle="t('pages.contact.subtitle')" />

    <section id="contact" class="py-12">
      <div class="site-container grid gap-10 lg:grid-cols-2 lg:items-start">
        <div class="space-y-5 text-sm text-slate-700 sm:text-base">
          <p>
            <span class="block font-medium text-slate-900">{{ t('footer.companyName') }}</span>
            <span class="mt-1 block">{{ t('footer.address') }}</span>
          </p>
          <p>
            <span class="font-medium text-slate-900">{{ t('pages.contact.hoursLabel') }}:</span>
            <span class="mt-1 block text-slate-600">{{ t('pages.contact.hours') }}</span>
          </p>
          <p>
            <span class="font-medium text-slate-900">{{ t('footer.phoneLabel') }}:</span>
            <a :href="phoneHref" class="text-wp-navy hover:underline">{{ t('footer.phone') }}</a>
          </p>
          <p>
            <span class="font-medium text-slate-900">{{ t('footer.emailLabel') }}:</span>
            <a :href="mailto" class="text-wp-navy hover:underline">{{ t('footer.email') }}</a>
          </p>
          <p>
            <span class="font-medium text-slate-900">{{ t('footer.lineLabel') }}:</span>
            <span class="text-slate-700">{{ lineDisplay }}</span>
          </p>

          <div>
            <a
              :href="lineAddUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2.5 rounded-xl bg-[#06C755] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06C755]"
            >
              <SiteSocialIcon name="line" class="h-5 w-5" />
              {{ t('pages.contact.addLine') }}
            </a>
          </div>

          <div>
            <p class="font-medium text-slate-900">
              {{ t('pages.contact.socialTitle') }}
            </p>
            <div class="mt-3">
              <SiteSocialLinks />
            </div>
          </div>
        </div>

        <div class="min-w-0">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <iframe
              :src="mapEmbedUrl"
              class="aspect-[4/3] w-full min-h-[280px] border-0 sm:min-h-[320px]"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
              :title="t('pages.contact.mapTitle')"
            />
          </div>
          <p class="mt-3 text-center">
            <a
              :href="mapOpenUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-medium text-wp-navy underline-offset-2 hover:underline"
            >
              {{ t('pages.contact.openInMaps') }}
            </a>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
