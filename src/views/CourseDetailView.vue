<script setup lang="ts">
import { ArrowLeft, Check, ShoppingCart } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { catalogService } from "../services/catalog.service";
import { cartStore } from "../stores/cart.store";

import type { Course, Product } from "../types/catalog";

const route = useRoute();
const router = useRouter();

/**
 * Total item dalam keranjang.
 */
const totalItems = cartStore.totalItems;

/**
 * Data mata kuliah.
 */
const course = computed<Course | null>(() => {
  return courseData.value;
});

/**
 * State internal data course.
 */

const courseData = ref<Course | null>(null);

/**
 * State halaman.
 */
const isLoading = ref(true);
const errorMessage = ref("");

/**
 * ID mata kuliah dari URL.
 */
const courseId = Number(route.params.id);

/**
 * Validasi course ID.
 */
const isValidCourseId = computed(() => {
  return Number.isInteger(courseId) && courseId > 0;
});

/**
 * Load detail mata kuliah.
 */
const loadCourse = async (): Promise<void> => {
  if (!isValidCourseId.value) {
    errorMessage.value = "ID mata kuliah tidak valid.";
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await catalogService.getCourse(courseId);

    courseData.value = result;

    console.log("COURSE:", result);
    console.log("PRODUCTS:", result.products ?? []);
  } catch (error) {
    console.error("Gagal mengambil course:", error);

    courseData.value = null;
    errorMessage.value = "Data mata kuliah gagal dimuat.";
  } finally {
    isLoading.value = false;
  }
};

/**
 * Daftar produk dari mata kuliah.
 */
const products = computed<Product[]>(() => {
  return courseData.value?.products ?? [];
});

/**
 * Tambahkan produk ke keranjang.
 */
const addToCart = (product: Product): void => {
  /**
   * Jika sudah ada di keranjang,
   * jangan tambahkan lagi.
   */
  if (cartStore.isInCart(product.id)) {
    return;
  }

  /**
   * Pastikan course tersedia.
   */
  if (!courseData.value) {
    console.error("Course belum tersedia.");

    return;
  }

  /**
   * Masukkan product + informasi course
   * ke dalam keranjang.
   */
  cartStore.addItem(product, {
    id: courseData.value.id,
    code: courseData.value.code,
    name: courseData.value.name,
  });

  console.log("Produk berhasil ditambahkan:", {
    course: {
      id: courseData.value.id,
      code: courseData.value.code,
      name: courseData.value.name,
    },
    product,
  });
};

/**
 * Buka detail produk.
 */
const openProduct = (product: Product): void => {
  router.push({
    name: "product-detail",
    params: {
      slug: product.slug,
    },
  });
};

/**
 * Buka halaman keranjang.
 */
const goToCart = (): void => {
  router.push("/cart");
};

/**
 * Kembali ke halaman sebelumnya.
 */
const goBack = (): void => {
  router.back();
};

onMounted(() => {
  loadCourse();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- HEADER -->
    <section class="border-b border-slate-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <!-- TOP ACTIONS -->
        <div class="mb-6 flex items-center justify-between gap-4">
          <!-- BACK -->
          <button
            type="button"
            class="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600"
            @click="goBack"
          >
            <ArrowLeft
              :size="17"
              :stroke-width="2"
              class="transition-transform duration-200 group-hover:-translate-x-0.5"
            />

            <span>Kembali</span>
          </button>

          <!-- CART -->
          <button
            type="button"
            class="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            @click="goToCart"
          >
            <ShoppingCart :size="18" />

            <span>Keranjang</span>

            <span
              v-if="totalItems > 0"
              class="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-black text-white"
            >
              {{ totalItems }}
            </span>
          </button>
        </div>

        <!-- LOADING COURSE -->
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-4 w-32 rounded bg-slate-200"></div>

          <div class="mt-4 h-10 max-w-2xl rounded bg-slate-200"></div>

          <div class="mt-3 h-5 max-w-3xl rounded bg-slate-200"></div>
        </div>

        <!-- COURSE -->
        <div v-else-if="course">
          <div class="flex items-start gap-4">
            <!-- ICON -->
            <div
              class="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-indigo-100 text-xl font-black text-indigo-600"
            >
              📚
            </div>

            <!-- COURSE INFO -->
            <div class="min-w-0">
              <p
                class="text-sm font-bold uppercase tracking-wide text-indigo-600"
              >
                {{ course.code }}
              </p>

              <h1
                class="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
              >
                {{ course.name }}
              </h1>

              <div
                v-if="course.studyProgram"
                class="mt-4 text-sm text-slate-400"
              >
                Program Studi:

                <span class="font-semibold text-slate-600">
                  {{ course.studyProgram.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRODUCTS -->
    <section class="py-10 sm:py-14">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- SECTION HEADER -->
        <div class="mb-7">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-bold text-indigo-600">Materi Belajar</p>

              <h2
                class="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
              >
                Pilih materi yang kamu butuhkan
              </h2>

              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Pilih produk belajar sesuai kebutuhanmu.
              </p>
            </div>

            <!-- CART SUMMARY -->
            <button
              v-if="totalItems > 0"
              type="button"
              class="hidden items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 sm:inline-flex"
              @click="goToCart"
            >
              <ShoppingCart :size="17" />

              <span> Lihat Keranjang ({{ totalItems }}) </span>
            </button>
          </div>
        </div>

        <!-- ERROR -->
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <p class="font-semibold text-red-700">
            {{ errorMessage }}
          </p>

          <button
            type="button"
            class="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
            @click="loadCourse"
          >
            Coba Lagi
          </button>
        </div>

        <!-- PRODUCT LOADING -->
        <div
          v-else-if="isLoading"
          class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="item in 6"
            :key="item"
            class="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
          ></div>
        </div>

        <!-- PRODUCT LIST -->
        <div
          v-else-if="products.length > 0"
          class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <article
            v-for="product in products"
            :key="product.id"
            class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
          >
            <!-- THUMBNAIL -->
            <div
              class="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 to-slate-100"
            >
              <img
                v-if="product.thumbnail"
                :src="product.thumbnail"
                :alt="product.title"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />

              <div v-else class="text-5xl">📖</div>

              <!-- PRODUCT TYPE -->
              <div
                class="absolute left-4 top-4 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-indigo-600 shadow-sm"
              >
                Materi
              </div>
            </div>

            <!-- CONTENT -->
            <div class="flex flex-1 flex-col p-5">
              <!-- TITLE -->
              <h3 class="text-lg font-bold leading-6 text-slate-900">
                {{ product.title }}
              </h3>

              <!-- DESCRIPTION -->
              <p
                v-if="product.description"
                class="mt-2 line-clamp-3 text-sm leading-6 text-slate-500"
              >
                {{ product.description }}
              </p>

              <!-- PRICE + ACTION -->
              <div class="mt-auto pt-6">
                <!-- PRICE -->
                <div class="mb-4">
                  <p class="text-xs font-medium text-slate-400">Harga</p>

                  <p class="mt-0.5 text-xl font-black text-slate-950">
                    Rp
                    {{ Number(product.price).toLocaleString("id-ID") }}
                  </p>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="grid grid-cols-2 gap-3">
                  <!-- ADD TO CART -->
                  <button
                    type="button"
                    class="inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-bold transition"
                    :class="
                      cartStore.isInCart(product.id)
                        ? 'border-green-200 bg-green-50 text-green-600'
                        : 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    "
                    :disabled="cartStore.isInCart(product.id)"
                    @click="addToCart(product)"
                  >
                    <Check v-if="cartStore.isInCart(product.id)" :size="16" />

                    <ShoppingCart v-else :size="16" />

                    <span>
                      {{
                        cartStore.isInCart(product.id)
                          ? "Ditambahkan"
                          : "Keranjang"
                      }}
                    </span>
                  </button>

                  <!-- DETAIL -->
                  <button
                    type="button"
                    class="rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                    @click="openProduct(product)"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- EMPTY -->
        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl"
          >
            📚
          </div>

          <h3 class="mt-4 font-bold text-slate-800">Belum ada materi</h3>

          <p class="mt-1 text-sm text-slate-500">
            Belum terdapat produk materi untuk mata kuliah ini.
          </p>
        </div>

        <!-- MOBILE CART BUTTON -->
        <div v-if="totalItems > 0" class="mt-8 sm:hidden">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            @click="goToCart"
          >
            <ShoppingCart :size="18" />

            <span> Lihat Keranjang ({{ totalItems }}) </span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
