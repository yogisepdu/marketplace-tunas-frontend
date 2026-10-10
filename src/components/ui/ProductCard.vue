<script setup lang="ts">
interface Props {
  code: string;
  title: string;
  type: string;
  price: number;
  thumbnail?: string;
}

const props = withDefaults(defineProps<Props>(), {
  thumbnail: "",
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};
</script>

<template>
  <article
    class="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
  >
    <!-- Thumbnail -->
    <div
      class="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-indigo-100 via-indigo-50 to-emerald-50"
    >
      <img
        v-if="props.thumbnail"
        :src="props.thumbnail"
        :alt="props.title"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div v-else class="flex h-full w-full items-center justify-center">
        <div class="text-center">
          <div
            class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg"
          >
            T
          </div>

          <p class="text-xs font-medium text-indigo-700">Marketplace Tunas</p>
        </div>
      </div>

      <!-- Type badge -->
      <div class="absolute left-3 top-3">
        <span
          class="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur"
        >
          {{ props.type }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <p
        class="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600"
      >
        {{ props.code }}
      </p>

      <h3
        class="line-clamp-2 min-h-[48px] text-sm font-bold leading-6 text-slate-900"
      >
        {{ props.title }}
      </h3>

      <div class="mt-4 flex items-end justify-between gap-3">
        <div>
          <p class="text-[11px] text-slate-500">Harga</p>

          <p class="text-base font-extrabold text-slate-900">
            {{ formatPrice(props.price) }}
          </p>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
          aria-label="Lihat produk"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>
