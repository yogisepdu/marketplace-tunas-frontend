<script setup lang="ts">
import { onMounted, ref } from "vue";

import ProductCard from "../components/ui/ProductCard.vue";

import { ArrowRight } from "lucide-vue-next";

import { benefits } from "../data/benefits";

import { catalogService } from "../services/catalog.service";

import type { Product, StudyProgram } from "../types/catalog";

import { useRouter } from "vue-router";

import logoUT from "../assets/logo.png";

const searchQuery = ref("");

const router = useRouter();

/*
|--------------------------------------------------------------------------
| Image URL
|--------------------------------------------------------------------------
*/

const API_URL = import.meta.env.VITE_API_URL;

const MEDIA_BASE_URL = API_URL.replace(/\/api\/?$/, "");

const getProgramImageUrl = (image?: string | null) => {
  if (!image) return "";

  // Jika image sudah berupa URL lengkap
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  // Jika image diawali "/"
  // Contoh: /uploads/study-programs/sistem-informasi.png
  if (image.startsWith("/")) {
    return `${MEDIA_BASE_URL}${image}`;
  }

  // Jika image tidak diawali "/"
  // Contoh: uploads/study-programs/sistem-informasi.png
  return `${MEDIA_BASE_URL}/${image}`;
};

/*
|--------------------------------------------------------------------------
| Program Studi
|--------------------------------------------------------------------------
*/

const programs = ref<StudyProgram[]>([]);
const isLoadingPrograms = ref(false);
const programError = ref("");

/*
|--------------------------------------------------------------------------
| Products
|--------------------------------------------------------------------------
*/

const products = ref<Product[]>([]);
const isLoadingProducts = ref(false);
const productError = ref("");

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

const handleSearch = () => {
  console.log("Search:", searchQuery.value);
};

/*
|--------------------------------------------------------------------------
| Load Programs
|--------------------------------------------------------------------------
*/

const loadPrograms = async () => {
  isLoadingPrograms.value = true;
  programError.value = "";

  try {
    programs.value = await catalogService.getPrograms();

    console.log("PROGRAM STUDI DARI BACKEND:", programs.value);
  } catch (error) {
    console.error("Gagal mengambil program studi:", error);

    programError.value = "Program studi gagal dimuat. Silakan coba lagi.";
  } finally {
    isLoadingPrograms.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Load Products
|--------------------------------------------------------------------------
*/

const loadProducts = async () => {
  isLoadingProducts.value = true;
  productError.value = "";

  try {
    products.value = await catalogService.getProducts();

    console.log("PRODUCTS DARI BACKEND:", products.value);
  } catch (error) {
    console.error("Gagal mengambil produk:", error);

    productError.value = "Materi gagal dimuat. Silakan coba lagi.";
  } finally {
    isLoadingProducts.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Open Program
|--------------------------------------------------------------------------
*/

const openProgram = (program: StudyProgram) => {
  router.push({
    name: "program-detail",
    params: {
      id: program.id,
    },
  });
};

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {
  loadPrograms();
  loadProducts();
});
</script>

<template>
  <div class="overflow-hidden">
    <!-- ================================================================ -->
    <!-- HERO -->
    <!-- ================================================================ -->

    <section class="relative">
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-slate-50"
      ></div>

      <div
        class="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-20"
      >
        <div class="mx-auto max-w-3xl text-center">
          <!-- Badge -->
          <div
            class="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>

            Platform materi belajar digital
          </div>

          <!-- Heading -->
          <h1
            class="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
          >
            Belajar lebih
            <span class="text-indigo-600">terarah.</span>
          </h1>

          <p
            class="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg"
          >
            Temukan ringkasan materi, latihan soal, dan paket belajar untuk
            membantu persiapan kuliah dan ujian.
          </p>

          <!-- Search -->
          <form class="mx-auto mt-8 max-w-2xl" @submit.prevent="handleSearch">
            <div
              class="flex items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60"
            >
              <div class="flex flex-1 items-center px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-3 h-5 w-5 flex-none text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                  />
                </svg>

                <input
                  v-model="searchQuery"
                  type="search"
                  placeholder="Cari materi atau mata kuliah..."
                  class="w-full border-0 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                class="hidden rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 sm:block"
              >
                Cari
              </button>
            </div>
          </form>

          <!-- Quick category -->
          <div class="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              Sistem Informasi
            </button>

            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              Ringkasan Materi
            </button>

            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              Latihan Soal
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- PROGRAM STUDI -->
    <!-- ================================================================ -->

    <section id="program" class="bg-white py-12 sm:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="mb-8 flex items-end justify-between gap-4">
          <div>
            <p class="text-sm font-bold text-indigo-600">
              Jelajahi berdasarkan program studi
            </p>

            <h2
              class="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
            >
              Program Studi
            </h2>

            <p
              class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base"
            >
              Pilih program studi untuk menemukan materi yang kamu butuhkan.
            </p>
          </div>

          <button
            type="button"
            class="group hidden items-center gap-1.5 text-sm font-bold text-indigo-600 transition-colors duration-200 hover:text-indigo-700 sm:inline-flex"
          >
            <span>Lihat semua</span>

            <ArrowRight
              :size="17"
              :stroke-width="2"
              class="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>

        <!-- Loading -->
        <div
          v-if="isLoadingPrograms"
          class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="item in 3"
            :key="item"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <!-- Image Skeleton -->
            <div class="aspect-[16/9] animate-pulse bg-slate-100"></div>

            <!-- Content Skeleton -->
            <div class="space-y-3 p-5">
              <div class="h-4 w-24 animate-pulse rounded bg-slate-200"></div>

              <div class="h-6 w-3/4 animate-pulse rounded bg-slate-200"></div>

              <div class="h-4 w-full animate-pulse rounded bg-slate-200"></div>

              <div class="h-4 w-2/3 animate-pulse rounded bg-slate-200"></div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div
          v-else-if="programError"
          class="rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="font-semibold text-red-700">
                Gagal memuat program studi
              </p>

              <p class="mt-1 text-sm text-red-600">
                {{ programError }}
              </p>
            </div>

            <button
              type="button"
              class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              @click="loadPrograms"
            >
              Coba Lagi
            </button>
          </div>
        </div>

        <!-- Data -->
        <div
          v-else-if="programs.length > 0"
          class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <button
            v-for="program in programs"
            :key="program.id"
            type="button"
            class="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
            @click="openProgram(program)"
          >
            <!-- ====================================================== -->
            <!-- PROGRAM IMAGE -->
            <!-- ====================================================== -->

            <div
              class="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-indigo-100 via-slate-100 to-white"
            >
              <!-- Actual Image -->
              <img
                v-if="program.image"
                :src="getProgramImageUrl(program.image)"
                :alt="`Logo ${program.name}`"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />

              <!-- Fallback -->
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600"
              >
                <div class="text-center text-white">
                  <div
                    class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black ring-1 ring-white/30 backdrop-blur-sm"
                  >
                    {{ program.code?.charAt(0) || "P" }}
                  </div>

                  <p
                    class="mt-3 text-xs font-semibold tracking-wide text-white/80"
                  >
                    {{ program.code || "PROGRAM" }}
                  </p>
                </div>
              </div>

              <!-- Gradient Overlay -->
              <div
                class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent opacity-70"
              ></div>

              <!-- Program Badge -->
              <div
                class="absolute left-4 top-4 rounded-full border border-white/30 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-700 shadow-sm backdrop-blur-sm"
              >
                Program Studi
              </div>

              <!-- Code -->
              <div
                v-if="program.code"
                class="absolute bottom-3 left-4 rounded-lg bg-slate-950/75 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-sm"
              >
                {{ program.code }}
              </div>
            </div>

            <!-- ====================================================== -->
            <!-- CONTENT -->
            <!-- ====================================================== -->

            <div class="p-5">
              <!-- Name -->
              <h3
                class="line-clamp-2 text-base font-bold leading-6 text-slate-900 transition-colors duration-200 group-hover:text-indigo-600"
              >
                {{ program.name }}
              </h3>

              <!-- Description -->
              <p
                v-if="program.description"
                class="mt-2 line-clamp-2 text-xs leading-5 text-slate-500"
              >
                {{ program.description }}
              </p>

              <!-- Action -->
              <div
                class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"
              >
                <span class="text-sm font-bold text-indigo-600">
                  Lihat materi
                </span>

                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white"
                >
                  <ArrowRight
                    :size="16"
                    :stroke-width="2"
                    class="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </div>
          </button>
        </div>

        <!-- Empty -->
        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl"
          >
            📚
          </div>

          <p class="mt-4 font-semibold text-slate-700">
            Belum ada program studi.
          </p>

          <p class="mt-1 text-sm text-slate-500">
            Program studi akan ditampilkan setelah tersedia.
          </p>
        </div>

        <!-- Mobile -->
        <button
          type="button"
          class="mt-4 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-indigo-600 sm:hidden"
        >
          Lihat semua program studi
        </button>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- PRODUCTS -->
    <!-- ================================================================ -->

    <section id="materi" class="bg-slate-50 py-12 sm:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <p class="text-sm font-bold text-indigo-600">Pilihan mahasiswa</p>

            <h2
              class="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
            >
              Materi Populer
            </h2>

            <p class="mt-2 text-sm text-slate-500">
              Materi yang dapat membantu kamu belajar lebih efektif.
            </p>
          </div>

          <button
            type="button"
            class="hidden text-sm font-bold text-indigo-600 hover:text-indigo-700 sm:block"
          >
            Lihat semua →
          </button>
        </div>

        <!-- Loading Products -->
        <div
          v-if="isLoadingProducts"
          class="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
        >
          <div
            v-for="item in 4"
            :key="item"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div class="aspect-[16/10] animate-pulse bg-slate-100"></div>

            <div class="space-y-3 p-4">
              <div class="h-3 w-20 animate-pulse rounded bg-slate-200"></div>

              <div class="h-10 animate-pulse rounded bg-slate-200"></div>

              <div class="h-6 w-28 animate-pulse rounded bg-slate-200"></div>
            </div>
          </div>
        </div>

        <!-- Error Products -->
        <div
          v-else-if="productError"
          class="rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="font-semibold text-red-700">Gagal memuat materi</p>

              <p class="mt-1 text-sm text-red-600">
                {{ productError }}
              </p>
            </div>

            <button
              type="button"
              class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              @click="loadProducts"
            >
              Coba Lagi
            </button>
          </div>
        </div>

        <!-- Products -->
        <div
          v-else-if="products.length > 0"
          class="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Empty -->
        <div
          v-else
          class="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl"
          >
            📚
          </div>

          <p class="mt-4 font-semibold text-slate-700">Belum ada materi.</p>

          <p class="mt-1 text-sm text-slate-500">
            Materi belajar akan ditampilkan setelah tersedia.
          </p>
        </div>

        <button
          type="button"
          class="mt-6 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-indigo-600 shadow-sm sm:hidden"
        >
          Lihat semua materi
        </button>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- WHY MARKETPLACE TUNAS -->
    <!-- ================================================================ -->

    <section class="bg-white py-12 sm:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <p class="text-sm font-bold text-indigo-600">
            Kenapa Marketplace Tunas?
          </p>

          <h2
            class="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
          >
            Semua yang kamu butuhkan untuk belajar
          </h2>

          <p class="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Kami membuat proses menemukan dan mendapatkan materi belajar menjadi
            lebih sederhana.
          </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-3">
          <div
            v-for="benefit in benefits"
            :key="benefit.title"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-6"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl"
            >
              {{ benefit.icon }}
            </div>

            <h3 class="mt-5 font-bold text-slate-900">
              {{ benefit.title }}
            </h3>

            <p class="mt-2 text-sm leading-6 text-slate-500">
              {{ benefit.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- CTA -->
    <!-- ================================================================ -->

    <section class="bg-slate-950 py-14 sm:py-20">
      <div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div
          class="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-indigo-900/20 ring-1 ring-slate-200"
        >
          <img
            :src="logoUT"
            alt="Logo Universitas Terbuka"
            class="h-full w-full object-contain p-2"
          />
        </div>

        <h2
          class="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl"
        >
          Siap belajar lebih terarah?
        </h2>

        <p
          class="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base"
        >
          Temukan materi belajar yang sesuai dengan mata kuliahmu dan mulai
          belajar dengan lebih mudah.
        </p>

        <button
          type="button"
          class="mt-7 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500"
        >
          Jelajahi Materi
        </button>
      </div>
    </section>
  </div>
</template>
