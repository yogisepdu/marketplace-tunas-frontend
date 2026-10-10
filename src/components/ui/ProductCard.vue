<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";

import { defineEmits, defineProps } from "vue";
import { cartStore } from "../../stores/cart.store";
import type { Product } from "../../types/catalog";

interface Props {
  product: Product;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  added: [];
}>();

const formatPrice = (value: number | string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
};

const addToCart = () => {
  cartStore.addItem(props.product);

  emit("added");
};
</script>

<template>
  <article
    class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
  >
    <!-- Image -->
    <div class="aspect-video overflow-hidden bg-slate-100">
      <img
        v-if="product.thumbnail"
        :src="product.thumbnail"
        :alt="product.title"
        class="h-full w-full object-cover"
      />

      <div
        v-else
        class="flex h-full w-full items-center justify-center text-sm text-slate-400"
      >
        Tidak ada gambar
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <div
        class="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
      >
        Materi
      </div>

      <h3 class="line-clamp-2 text-lg font-bold text-slate-900">
        {{ product.title }}
      </h3>

      <p
        v-if="product.description"
        class="mt-2 line-clamp-2 text-sm leading-6 text-slate-500"
      >
        {{ product.description }}
      </p>

      <div class="mt-5 flex items-center justify-between gap-3">
        <div>
          <p class="text-xs text-slate-400">Harga</p>

          <p class="text-lg font-bold text-slate-900">
            {{ formatPrice(product.price) }}
          </p>
        </div>

        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          @click="addToCart"
        >
          <ShoppingCart :size="17" />

          Keranjang
        </button>
      </div>
    </div>
  </article>
</template>
