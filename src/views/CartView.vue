<script setup lang="ts">
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-vue-next";
import { computed } from "vue";
import { useRouter } from "vue-router";

import { cartStore } from "../stores/cart.store";

const router = useRouter();

/**
 * Ambil state dari cartStore ke variabel lokal.
 * Di template Vue akan otomatis melakukan unwrapping Ref.
 */
const items = cartStore.items;
const isEmpty = cartStore.isEmpty;
const totalItems = cartStore.totalItems;
const subtotal = cartStore.subtotal;

/**
 * Format harga ke Rupiah.
 */
const formatPrice = (value: number | string): string => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Rp 0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

/**
 * Kembali ke halaman utama.
 */
const goBack = (): void => {
  router.push("/");
};

/**
 * Lanjut ke checkout.
 */
const goToCheckout = (): void => {
  if (isEmpty.value || items.value.length === 0) {
    return;
  }

  const item = items.value[0];

  if (!item.slug) {
    console.error("Slug produk tidak ditemukan:", item);
    return;
  }

  router.push({
    path: "/checkout",
    query: {
      product: item.slug,
      quantity: String(item.quantity),
    },
  });
};

/**
 * Teks jumlah item di header.
 */
const productCountText = computed(() => {
  const count = totalItems.value;

  return `${count} ${count === 1 ? "item" : "item"}`;
});

/**
 * Mengosongkan seluruh keranjang.
 */
const clearCart = (): void => {
  const confirmed = window.confirm(
    "Apakah kamu yakin ingin mengosongkan seluruh keranjang?",
  );

  if (!confirmed) {
    return;
  }

  cartStore.clearCart();
};

/**
 * Hapus satu produk.
 */
const removeItem = (productId: number): void => {
  cartStore.removeItem(productId);
};

/**
 * Kurangi quantity produk.
 */
const decreaseQuantity = (productId: number): void => {
  cartStore.decreaseQuantity(productId);
};

/**
 * Tambah quantity produk.
 */
const increaseQuantity = (productId: number): void => {
  cartStore.increaseQuantity(productId);
};
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- HEADER -->
    <header class="border-b border-slate-200 bg-white">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
      >
        <!-- Back -->
        <button
          type="button"
          class="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          @click="goBack"
        >
          <ArrowLeft :size="18" />
          <span>Kembali</span>
        </button>

        <!-- Title -->
        <div class="flex items-center gap-2">
          <ShoppingCart :size="22" class="text-slate-900" />

          <span class="font-bold text-slate-900"> Keranjang </span>
        </div>

        <!-- Count -->
        <div class="text-sm text-slate-500">
          {{ productCountText }}
        </div>
      </div>
    </header>

    <!-- CONTENT -->
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- EMPTY CART -->
      <div
        v-if="isEmpty"
        class="mx-auto max-w-xl rounded-2xl bg-white px-6 py-12 text-center shadow-sm"
      >
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"
        >
          <ShoppingCart :size="30" class="text-slate-500" />
        </div>

        <h1 class="mt-5 text-2xl font-bold text-slate-900">
          Keranjang Masih Kosong
        </h1>

        <p class="mt-3 text-slate-500">
          Silakan pilih materi yang ingin kamu beli terlebih dahulu.
        </p>

        <button
          type="button"
          class="mt-6 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          @click="goBack"
        >
          Lihat Produk
        </button>
      </div>

      <!-- CART -->
      <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <!-- ITEMS -->
        <section>
          <div class="rounded-2xl bg-white shadow-sm">
            <!-- Section Header -->
            <div class="border-b border-slate-100 px-5 py-5 sm:px-6">
              <h1 class="text-xl font-bold text-slate-900">
                Produk di Keranjang
              </h1>

              <p class="mt-1 text-sm text-slate-500">
                Periksa kembali materi sebelum melanjutkan pembayaran.
              </p>
            </div>

            <!-- Item List -->
            <div>
              <article
                v-for="item in items"
                :key="item.id"
                class="flex gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 sm:px-6"
              >
                <!-- THUMBNAIL -->
                <div
                  class="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                >
                  <img
                    v-if="item.thumbnail"
                    :src="item.thumbnail"
                    :alt="item.title"
                    class="h-full w-full object-cover"
                  />

                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center text-xs text-slate-400"
                  >
                    No Image
                  </div>
                </div>

                <!-- PRODUCT INFO -->
                <div class="min-w-0 flex-1">
                  <!-- Title -->
                  <!-- COURSE -->
                  <div v-if="item.courseName || item.courseCode" class="mb-2">
                    <p
                      v-if="item.courseCode"
                      class="text-xs font-bold uppercase tracking-wide text-indigo-600"
                    >
                      {{ item.courseCode }}
                    </p>

                    <p
                      v-if="item.courseName"
                      class="text-sm font-semibold text-slate-700"
                    >
                      {{ item.courseName }}
                    </p>
                  </div>

                  <!-- PRODUCT -->
                  <h2 class="line-clamp-2 font-semibold text-slate-900">
                    {{ item.title }}
                  </h2>

                  <!-- Price -->
                  <p class="mt-1 text-sm text-slate-500">
                    {{ formatPrice(item.price) }}
                  </p>

                  <!-- Quantity + Remove -->
                  <div class="mt-4 flex flex-wrap items-center gap-3">
                    <!-- Quantity -->
                    <div
                      class="flex items-center rounded-lg border border-slate-200"
                    >
                      <button
                        type="button"
                        class="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                        aria-label="Kurangi jumlah"
                        @click="decreaseQuantity(item.id)"
                      >
                        <Minus :size="15" />
                      </button>

                      <span
                        class="w-10 text-center text-sm font-semibold text-slate-900"
                      >
                        {{ item.quantity }}
                      </span>

                      <button
                        type="button"
                        class="flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-50"
                        aria-label="Tambah jumlah"
                        @click="increaseQuantity(item.id)"
                      >
                        <Plus :size="15" />
                      </button>
                    </div>

                    <!-- Remove -->
                    <button
                      type="button"
                      class="flex items-center gap-1.5 text-sm font-medium text-red-500 transition hover:text-red-700"
                      @click="removeItem(item.id)"
                    >
                      <Trash2 :size="15" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                <!-- ITEM TOTAL -->
                <div class="hidden text-right sm:block">
                  <p class="text-sm font-semibold text-slate-900">
                    {{ formatPrice(Number(item.price) * item.quantity) }}
                  </p>
                </div>
              </article>
            </div>
          </div>

          <!-- CLEAR CART -->
          <div class="mt-4 flex justify-end">
            <button
              type="button"
              class="text-sm font-medium text-red-500 transition hover:text-red-700"
              @click="clearCart"
            >
              Kosongkan Keranjang
            </button>
          </div>
        </section>

        <!-- SUMMARY -->
        <aside>
          <div class="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 class="text-lg font-bold text-slate-900">Ringkasan Pesanan</h2>

            <!-- Summary Details -->
            <div class="mt-5 space-y-3 border-b border-slate-100 pb-5">
              <!-- Total Items -->
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500"> Jumlah item </span>

                <span class="font-medium text-slate-900">
                  {{ totalItems }}
                </span>
              </div>

              <!-- Subtotal -->
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500"> Subtotal </span>

                <span class="font-medium text-slate-900">
                  {{ formatPrice(subtotal) }}
                </span>
              </div>
            </div>

            <!-- Total -->
            <div class="flex items-center justify-between py-5">
              <span class="font-semibold text-slate-900"> Total </span>

              <span class="text-xl font-bold text-slate-900">
                {{ formatPrice(subtotal) }}
              </span>
            </div>

            <!-- Checkout -->
            <button
              type="button"
              class="w-full rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800"
              @click="goToCheckout"
            >
              Lanjut ke Checkout
            </button>

            <p class="mt-3 text-center text-xs leading-5 text-slate-400">
              Pembayaran diproses secara aman melalui Midtrans.
            </p>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
