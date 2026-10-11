<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Info,
  LockKeyhole,
  ShieldCheck,
  ShoppingCart,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { catalogService } from "../services/catalog.service";
import type { Product } from "../types/catalog";

const route = useRoute();
const router = useRouter();

const product = ref<Product | null>(null);

const isLoading = ref(true);
const errorMessage = ref("");

const productSlug = String(route.params.slug);

/**
 * Mengambil detail produk berdasarkan slug.
 */
const loadProduct = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    product.value = await catalogService.getProduct(productSlug);

    console.log("PRODUCT:", product.value);
  } catch (error) {
    console.error("Gagal mengambil product:", error);

    product.value = null;
    errorMessage.value = "Produk tidak ditemukan atau gagal dimuat.";
  } finally {
    isLoading.value = false;
  }
};

/**
 * Format harga ke format Rupiah.
 */
const formatPrice = (price: number | string) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "Rp 0";
  }

  if (numericPrice === 0) {
    return "Gratis";
  }

  return `Rp ${numericPrice.toLocaleString("id-ID")}`;
};

/**
 * Kode mata kuliah.
 *
 * Product saat ini hanya mempunyai courseId,
 * bukan relasi course.
 */
const productCode = computed(() => {
  if (!product.value) {
    return "-";
  }

  return product.value.courseId ? `COURSE-${product.value.courseId}` : "MATERI";
});

/**
 * Nama mata kuliah.
 *
 * Karena Product tidak mempunyai properti course/name,
 * kita gunakan fallback yang aman.
 */
const courseName = computed(() => {
  if (!product.value) {
    return "Materi Pembelajaran";
  }

  return "Materi Pembelajaran";
});

/**
 * Nama program studi.
 *
 * Product saat ini tidak mempunyai relasi studyProgram,
 * sehingga gunakan nilai default.
 */
const programName = computed(() => {
  return "Universitas Terbuka";
});

/**
 * Identifier produk.
 */
const productIdentifier = computed(() => {
  if (!product.value) {
    return "-";
  }

  return product.value.slug || `produk-${product.value.id}`;
});

/**
 * Membeli produk langsung.
 */
const buyProduct = (): void => {
  if (!product.value) {
    return;
  }

  router.push({
    name: "checkout",
    query: {
      mode: "direct",
      product: product.value.slug,
    },
  });
};

/**
 * Kembali ke halaman sebelumnya.
 */
const backToCatalog = () => {
  router.back();
};

onMounted(() => {
  loadProduct();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- LOADING -->
    <div v-if="isLoading" class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="animate-pulse">
        <div class="h-4 w-28 rounded bg-slate-200"></div>

        <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div class="h-6 w-32 rounded-lg bg-slate-200"></div>

            <div class="mt-5 h-12 max-w-2xl rounded-xl bg-slate-200"></div>

            <div class="mt-4 h-5 max-w-xl rounded bg-slate-200"></div>

            <div class="mt-2 h-5 max-w-lg rounded bg-slate-200"></div>

            <div class="mt-10 h-48 rounded-2xl bg-slate-200"></div>
          </div>

          <div class="h-80 rounded-2xl bg-slate-200"></div>
        </div>
      </div>
    </div>

    <!-- ERROR -->
    <section
      v-else-if="errorMessage"
      class="flex min-h-[70vh] items-center justify-center px-4"
    >
      <div
        class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500"
        >
          <Info :size="26" />
        </div>

        <h1 class="mt-5 text-xl font-bold text-slate-950">
          Produk Tidak Tersedia
        </h1>

        <p class="mt-2 text-sm leading-6 text-slate-500">
          {{ errorMessage }}
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            @click="backToCatalog"
          >
            <ArrowLeft :size="17" />
            Kembali
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            @click="loadProduct"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </section>

    <!-- PRODUCT -->
    <template v-else-if="product">
      <!-- TOP NAV -->
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            class="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
            @click="backToCatalog"
          >
            <ArrowLeft
              :size="17"
              :stroke-width="2"
              class="transition-transform duration-200 group-hover:-translate-x-0.5"
            />

            <span>Kembali</span>
          </button>
        </div>
      </header>

      <!-- HERO -->
      <main>
        <section class="border-b border-slate-200 bg-white">
          <div
            class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14"
          >
            <div
              class="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px]"
            >
              <!-- LEFT -->
              <div>
                <!-- Breadcrumb -->
                <div
                  class="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400"
                >
                  <span>{{ programName }}</span>

                  <ArrowRight :size="13" />

                  <span>{{ productCode }}</span>

                  <ArrowRight :size="13" />

                  <span class="text-slate-600">
                    {{ product.title }}
                  </span>
                </div>

                <!-- Category -->
                <div
                  class="mt-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-600"
                >
                  <BookOpen :size="15" />

                  <span>Materi Pembelajaran</span>
                </div>

                <!-- Title -->
                <h1
                  class="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
                >
                  {{ product.title }}
                </h1>

                <!-- Description -->
                <p
                  v-if="product.description"
                  class="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg"
                >
                  {{ product.description }}
                </p>

                <p
                  v-else
                  class="mt-5 max-w-2xl text-base leading-7 text-slate-500"
                >
                  Materi pembelajaran untuk membantu kamu memahami materi
                  perkuliahan secara lebih terstruktur.
                </p>

                <!-- PRODUCT INFO -->
                <div class="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
                  <!-- Course -->
                  <div
                    class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"
                    >
                      <BookOpen :size="19" />
                    </div>

                    <div class="min-w-0">
                      <p class="text-xs font-medium text-slate-400">
                        Mata Kuliah
                      </p>

                      <p class="mt-1 truncate text-sm font-bold text-slate-800">
                        {{ courseName }}
                      </p>

                      <p class="mt-0.5 text-xs text-slate-500">
                        {{ productCode }}
                      </p>
                    </div>
                  </div>

                  <!-- Product ID -->
                  <div
                    class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"
                    >
                      <FileText :size="19" />
                    </div>

                    <div class="min-w-0">
                      <p class="text-xs font-medium text-slate-400">
                        ID Produk
                      </p>

                      <p
                        class="mt-1 truncate font-mono text-sm font-bold text-slate-800"
                        :title="productIdentifier"
                      >
                        {{ productIdentifier }}
                      </p>

                      <p class="mt-0.5 text-xs text-slate-500">
                        Produk #{{ product.id }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PRICE CARD -->
              <aside class="lg:sticky lg:top-6">
                <div
                  class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50"
                >
                  <!-- Price header -->
                  <div class="border-b border-slate-100 p-6 sm:p-7">
                    <p class="text-sm font-medium text-slate-500">
                      Harga produk
                    </p>

                    <div class="mt-2 flex items-end gap-2">
                      <span
                        class="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
                      >
                        {{ formatPrice(product.price) }}
                      </span>
                    </div>

                    <p class="mt-2 text-xs leading-5 text-slate-400">
                      Harga sudah termasuk akses digital ke materi yang dibeli.
                    </p>
                  </div>

                  <!-- Detail harga -->
                  <div
                    class="border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-7"
                  >
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-slate-500"> Harga materi </span>

                      <span class="font-semibold text-slate-800">
                        {{ formatPrice(product.price) }}
                      </span>
                    </div>

                    <div class="mt-3 flex items-center justify-between text-sm">
                      <span class="text-slate-500"> Jumlah </span>

                      <span class="font-semibold text-slate-800">
                        1 materi
                      </span>
                    </div>

                    <div class="mt-4 border-t border-slate-200 pt-4">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-900"> Total </span>

                        <span class="text-xl font-black text-indigo-600">
                          {{ formatPrice(product.price) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- CTA -->
                  <div class="p-6 sm:p-7">
                    <button
                      type="button"
                      class="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/25 active:translate-y-0"
                      @click="buyProduct"
                    >
                      <ShoppingCart :size="19" />

                      <span>Beli Sekarang</span>

                      <ArrowRight
                        :size="17"
                        class="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </button>

                    <!-- Trust -->
                    <div class="mt-5 space-y-3">
                      <div
                        class="flex items-center gap-2.5 text-xs text-slate-500"
                      >
                        <ShieldCheck
                          :size="16"
                          class="shrink-0 text-green-600"
                        />

                        <span> Pembayaran diproses secara aman </span>
                      </div>

                      <div
                        class="flex items-center gap-2.5 text-xs text-slate-500"
                      >
                        <LockKeyhole
                          :size="16"
                          class="shrink-0 text-green-600"
                        />

                        <span> Akses materi diberikan secara digital </span>
                      </div>

                      <div
                        class="flex items-center gap-2.5 text-xs text-slate-500"
                      >
                        <CheckCircle2
                          :size="16"
                          class="shrink-0 text-green-600"
                        />

                        <span> Informasi akses dikirim ke email pembeli </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <!-- DETAIL -->
        <section class="py-10 sm:py-14">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <!-- About -->
              <article
                class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
                  >
                    <Info :size="19" />
                  </div>

                  <div>
                    <h2 class="text-lg font-black text-slate-950">
                      Tentang Produk
                    </h2>

                    <p class="text-xs text-slate-400">
                      Informasi materi pembelajaran
                    </p>
                  </div>
                </div>

                <div class="mt-6 border-t border-slate-100 pt-6">
                  <p class="text-sm leading-7 text-slate-600 sm:text-base">
                    {{
                      product.description || "Informasi produk belum tersedia."
                    }}
                  </p>
                </div>
              </article>

              <!-- Product identity -->
              <aside
                class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 class="font-bold text-slate-900">Informasi Produk</h3>

                <div class="mt-5 space-y-4">
                  <div>
                    <p class="text-xs text-slate-400">Program Studi</p>

                    <p class="mt-1 text-sm font-semibold text-slate-800">
                      {{ programName }}
                    </p>
                  </div>

                  <div>
                    <p class="text-xs text-slate-400">Mata Kuliah</p>

                    <p class="mt-1 text-sm font-semibold text-slate-800">
                      {{ courseName }}
                    </p>
                  </div>

                  <div>
                    <p class="text-xs text-slate-400">ID Mata Kuliah</p>

                    <p class="mt-1 font-mono text-sm font-bold text-indigo-600">
                      {{ productCode }}
                    </p>
                  </div>

                  <div>
                    <p class="text-xs text-slate-400">Slug Produk</p>

                    <p
                      class="mt-1 break-all font-mono text-xs font-medium text-slate-600"
                    >
                      {{ productIdentifier }}
                    </p>
                  </div>

                  <div>
                    <p class="text-xs text-slate-400">ID Produk</p>

                    <p
                      class="mt-1 font-mono text-sm font-semibold text-slate-800"
                    >
                      #{{ product.id }}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </template>
  </div>
</template>
