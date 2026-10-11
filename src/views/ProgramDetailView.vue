<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Search,
  Sparkles,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { catalogService } from "../services/catalog.service";

import type { Course, StudyProgram } from "../types/catalog";

const route = useRoute();
const router = useRouter();

const program = ref<StudyProgram | null>(null);
const courses = ref<Course[]>([]);

const isLoading = ref(true);
const errorMessage = ref("");

const searchQuery = ref("");
const selectedSemester = ref<number | "all">("all");

const programId = Number(route.params.id);

/*
|--------------------------------------------------------------------------
| Load Program
|--------------------------------------------------------------------------
*/

const loadProgram = async () => {
  program.value = await catalogService.getProgram(programId);
};

/*
|--------------------------------------------------------------------------
| Load Courses
|--------------------------------------------------------------------------
*/

const loadCourses = async () => {
  const data = await catalogService.getCourses({
    programId,
  });

  // Hanya tampilkan course yang aktif
  courses.value = data.filter((course) => course.isActive !== false);
};

/*
|--------------------------------------------------------------------------
| Load Data
|--------------------------------------------------------------------------
*/

const loadData = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await Promise.all([loadProgram(), loadCourses()]);
  } catch (error) {
    console.error(error);
    errorMessage.value = "Data program studi gagal dimuat.";
  } finally {
    isLoading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Semester List
|--------------------------------------------------------------------------
*/

const semesters = computed(() => {
  const values = courses.value
    .map((course) => course.semester)
    .filter(
      (semester): semester is number =>
        semester !== null && semester !== undefined,
    );

  return [...new Set(values)].sort((a, b) => a - b);
});

/*
|--------------------------------------------------------------------------
| Filter Courses
|--------------------------------------------------------------------------
*/

const filteredCourses = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();

  return courses.value.filter((course) => {
    const matchesSearch =
      !keyword ||
      course.name.toLowerCase().includes(keyword) ||
      course.code.toLowerCase().includes(keyword);

    const matchesSemester =
      selectedSemester.value === "all" ||
      course.semester === selectedSemester.value;

    return matchesSearch && matchesSemester;
  });
});

/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

const openCourse = (course: Course) => {
  router.push({
    name: "course-detail",
    params: {
      id: course.id,
    },
  });
};

const goBack = () => {
  router.back();
};

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- ================================================================ -->
    <!-- HERO / HEADER -->
    <!-- ================================================================ -->

    <section
      class="relative overflow-hidden border-b border-slate-200 bg-white"
    >
      <!-- Decorative background -->
      <div
        class="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl"
      />

      <div
        class="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-violet-100/50 blur-3xl"
      />

      <div
        class="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8"
      >
        <!-- Back -->
        <button
          type="button"
          class="group mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600"
          @click="goBack"
        >
          <ArrowLeft
            :size="17"
            :stroke-width="2"
            class="transition-transform duration-200 group-hover:-translate-x-0.5"
          />

          <span>Kembali</span>
        </button>

        <!-- Loading -->
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-4 w-32 rounded-lg bg-slate-200" />
          <div class="mt-4 h-10 max-w-xl rounded-xl bg-slate-200" />
          <div class="mt-3 h-5 max-w-2xl rounded-lg bg-slate-200" />
        </div>

        <!-- Program -->
        <div v-else-if="program">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <!-- Icon -->
            <div
              class="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-black text-white shadow-lg shadow-indigo-200"
            >
              {{ program.code?.charAt(0) || "P" }}
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600"
                >
                  <Sparkles :size="13" />
                  Program Studi
                </span>

                <span
                  class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                >
                  {{ program.code }}
                </span>
              </div>

              <h1
                class="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl"
              >
                {{ program.name }}
              </h1>

              <p
                v-if="program.description"
                class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base"
              >
                {{ program.description }}
              </p>

              <!-- Course Count -->
              <div
                class="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500"
              >
                <BookOpen :size="16" class="text-indigo-500" />

                <span> {{ courses.length }} mata kuliah tersedia </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- COURSE CATALOG -->
    <!-- ================================================================ -->

    <section class="py-7 sm:py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div
          class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p
              class="text-xs font-black uppercase tracking-widest text-indigo-600"
            >
              Katalog Materi
            </p>

            <h2
              class="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              Pilih mata kuliah
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Pilih mata kuliah untuk melihat materi pembelajaran yang tersedia.
            </p>
          </div>

          <!-- Result Count -->
          <div
            v-if="!isLoading"
            class="self-start rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 sm:self-auto"
          >
            {{ filteredCourses.length }} hasil
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- SEARCH & FILTER -->
        <!-- ============================================================ -->

        <div
          class="sticky top-3 z-20 mb-6 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur"
        >
          <div class="flex flex-col gap-3">
            <!-- Search -->
            <div class="relative">
              <Search
                :size="18"
                class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari mata kuliah atau kode..."
                class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <!-- Semester Filter -->
            <div
              v-if="semesters.length > 0"
              class="flex gap-2 overflow-x-auto pb-1"
            >
              <button
                type="button"
                class="flex-none rounded-full px-4 py-2 text-xs font-bold transition"
                :class="
                  selectedSemester === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                "
                @click="selectedSemester = 'all'"
              >
                Semua
              </button>

              <button
                v-for="semester in semesters"
                :key="semester"
                type="button"
                class="flex-none rounded-full px-4 py-2 text-xs font-bold transition"
                :class="
                  selectedSemester === semester
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                "
                @click="selectedSemester = semester"
              >
                Semester {{ semester }}
              </button>
            </div>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- ERROR -->
        <!-- ============================================================ -->

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="font-bold text-red-700">
                {{ errorMessage }}
              </p>

              <p class="mt-1 text-sm text-red-600">
                Silakan coba muat ulang data mata kuliah.
              </p>
            </div>

            <button
              type="button"
              class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              @click="loadData"
            >
              Coba Lagi
            </button>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- LOADING SKELETON -->
        <!-- ============================================================ -->

        <div
          v-else-if="isLoading"
          class="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div
            v-for="item in 8"
            :key="item"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div class="aspect-[16/10] animate-pulse bg-slate-200" />

            <div class="p-3.5 sm:p-4">
              <div class="h-4 w-16 animate-pulse rounded bg-slate-200" />
              <div class="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
              <div class="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div
                class="mt-4 h-9 w-full animate-pulse rounded-xl bg-slate-200"
              />
            </div>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- COURSE GRID -->
        <!-- ============================================================ -->

        <div
          v-else-if="filteredCourses.length > 0"
          class="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
        >
          <button
            v-for="course in filteredCourses"
            :key="course.id"
            type="button"
            class="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60 active:scale-[0.98]"
            @click="openCourse(course)"
          >
            <!-- ====================================================== -->
            <!-- COURSE IMAGE -->
            <!-- ====================================================== -->

            <div
              class="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600"
            >
              <img
                v-if="course.image"
                :src="course.image"
                :alt="course.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />

              <!-- Fallback -->
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <BookOpen
                  :size="34"
                  :stroke-width="1.5"
                  class="text-white/80"
                />
              </div>

              <!-- Overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
              />

              <!-- Code -->
              <span
                class="absolute left-2.5 top-2.5 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-black text-indigo-600 shadow-sm backdrop-blur sm:text-xs"
              >
                {{ course.code }}
              </span>

              <!-- Semester -->
              <span
                v-if="course.semester"
                class="absolute bottom-2.5 right-2.5 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur"
              >
                Sem. {{ course.semester }}
              </span>
            </div>

            <!-- ====================================================== -->
            <!-- COURSE CONTENT -->
            <!-- ====================================================== -->

            <div class="p-3 sm:p-4">
              <h3
                class="line-clamp-2 min-h-[40px] text-sm font-extrabold leading-5 text-slate-900 sm:text-base"
              >
                {{ course.name }}
              </h3>

              <!-- Meta -->
              <div
                class="mt-2 flex min-h-[18px] flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-400 sm:text-xs"
              >
                <span v-if="course.credits"> {{ course.credits }} SKS </span>

                <span
                  v-if="course.credits && course.semester"
                  class="text-slate-300"
                >
                  •
                </span>

                <span v-if="course.semester">
                  Semester {{ course.semester }}
                </span>
              </div>

              <!-- CTA -->
              <div
                class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"
              >
                <span class="text-xs font-extrabold text-indigo-600 sm:text-sm">
                  Lihat materi
                </span>

                <span
                  class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white"
                >
                  <ArrowRight
                    :size="14"
                    :stroke-width="2.5"
                    class="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </div>
          </button>
        </div>

        <!-- ============================================================ -->
        <!-- EMPTY SEARCH -->
        <!-- ============================================================ -->

        <div
          v-else-if="courses.length > 0"
          class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"
          >
            <Search :size="24" />
          </div>

          <h3 class="mt-4 font-bold text-slate-800">
            Mata kuliah tidak ditemukan
          </h3>

          <p class="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Coba gunakan kata kunci lain atau pilih semester yang berbeda.
          </p>

          <button
            type="button"
            class="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
            @click="
              searchQuery = '';
              selectedSemester = 'all';
            "
          >
            Reset Filter
          </button>
        </div>

        <!-- ============================================================ -->
        <!-- EMPTY COURSE -->
        <!-- ============================================================ -->

        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500"
          >
            <BookOpen :size="25" />
          </div>

          <h3 class="mt-4 font-bold text-slate-800">Belum ada mata kuliah</h3>

          <p class="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Belum terdapat mata kuliah untuk program studi ini.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
