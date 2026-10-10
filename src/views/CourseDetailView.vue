<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { catalogService } from "../services/catalog.service";
import type { Course, Product } from "../types/catalog";

const route = useRoute();
const router = useRouter();

const course = ref<Course | null>(null);

const isLoading = ref(true);
const errorMessage = ref("");

const courseId = Number(route.params.id);

const loadCourse = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    course.value = await catalogService.getCourse(courseId);

    console.log("COURSE:", course.value);
    console.log("PRODUCTS:", course.value.products);
  } catch (error) {
    console.error("Gagal mengambil course:", error);

    errorMessage.value = "Data mata kuliah gagal dimuat.";
  } finally {
    isLoading.value = false;
  }
};

const products = computed<Product[]>(() => {
  return course.value?.products ?? [];
});

const openProduct = (product: Product) => {
  router.push({
    name: "product-detail",
    params: {
      slug: product.slug,
    },
  });
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
        <!-- BACK -->
        <button
          type="button"
          class="group mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600"
          @click="router.back()"
        >
          <ArrowLeft
            :size="17"
            :stroke-width="2"
            class="transition-transform duration-200 group-hover:-translate-x-0.5"
          />

          <span>Kembali</span>
        </button>

        <!-- LOADING -->
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-4 w-32 rounded bg-slate-200" />

          <div class="mt-4 h-10 max-w-2xl rounded bg-slate-200" />

          <div class="mt-3 h-5 max-w-3xl rounded bg-slate-200" />
        </div>

        <!-- COURSE -->
        <div v-else-if="course">
          <div class="flex items-start gap-4">
            <div
              class="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-indigo-100 text-xl font-black text-indigo-600"
            >
              📚
            </div>

            <div>
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

              <p
                v-if="course.description"
                class="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base"
              >
                {{ course.description }}
              </p>

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
        <div class="mb-7">
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
          />
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

              <div
                class="absolute left-4 top-4 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-indigo-600 shadow-sm"
              >
                Materi
              </div>
            </div>

            <!-- CONTENT -->
            <div class="flex flex-1 flex-col p-5">
              <h3 class="text-lg font-bold leading-6 text-slate-900">
                {{ product.title }}
              </h3>

              <p
                v-if="product.description"
                class="mt-2 line-clamp-3 text-sm leading-6 text-slate-500"
              >
                {{ product.description }}
              </p>

              <div class="mt-auto pt-6">
                <div class="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p class="text-xs font-medium text-slate-400">Harga</p>

                    <p class="mt-0.5 text-xl font-black text-slate-950">
                      Rp {{ Number(product.price).toLocaleString("id-ID") }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  class="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                  @click="openProduct(product)"
                >
                  Lihat Detail
                </button>
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
      </div>
    </section>
  </div>
</template>
