<template>
  <section id="inquiry" class="py-10 sm:py-12">
    <div class="site-container">
      <div class="grid items-start gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <!-- ฟอร์ม — ซ้ายบน desktop, ล่างบน mobile -->
        <aside class="order-2 lg:order-1 lg:sticky lg:top-8">
          <div class="mb-5">
            <slot name="form-header" />
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <slot name="form" />
          </div>
        </aside>

        <!-- รายละเอียด — ขวาบน desktop, บนบน mobile -->
        <div class="order-1 min-w-0 space-y-10 lg:order-2 sm:space-y-12">
          <slot name="content" />
        </div>
      </div>
    </div>
  </section>
</template>
