<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { catalogService } from "../services/catalog.service";

import type { Course, StudyProgram } from "../types/catalog";

const route = useRoute();
const router = useRouter();

const program = ref<StudyProgram | null>(null);
const courses = ref<Course[]>([]);

const isLoading = ref(true);
const errorMessage = ref("");

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
  courses.value = await catalogService.getCourses({
    programId,
  });
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

    console.log("PROGRAM:", program.value);
    console.log("COURSES:", courses.value);
  } catch (error) {
    console.error("Gagal mengambil data program:", error);

    errorMessage.value = "Data program studi gagal dimuat.";
  } finally {
    isLoading.value = false;
  }
};

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
    <!-- HEADER -->
    <!-- ================================================================ -->

    <section class="border-b border-slate-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <!-- Back -->
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

        <!-- Loading -->
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-4 w-32 rounded bg-slate-200" />

          <div class="mt-4 h-10 max-w-lg rounded bg-slate-200" />

          <div class="mt-3 h-5 max-w-2xl rounded bg-slate-200" />
        </div>

        <!-- Program -->
        <div v-else-if="program">
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              class="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-black text-indigo-600"
            >
              {{ program.code?.charAt(0) || "P" }}
            </div>

            <div>
              <p
                class="text-sm font-bold uppercase tracking-wide text-indigo-600"
              >
                {{ program.code }}
              </p>

              <h1
                class="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
              >
                {{ program.name }}
              </h1>

              <p
                v-if="program.description"
                class="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base"
              >
                {{ program.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- COURSES -->
    <!-- ================================================================ -->

    <section class="py-10 sm:py-14">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Section title -->
        <div class="mb-6">
          <p class="text-sm font-bold text-indigo-600">Mata Kuliah</p>

          <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Pilih mata kuliah
          </h2>

          <p class="mt-2 text-sm text-slate-500">
            Temukan materi belajar berdasarkan mata kuliah yang kamu ambil.
          </p>
        </div>

        <!-- Error -->
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <p class="font-semibold text-red-700">
            {{ errorMessage }}
          </p>

          <button
            type="button"
            class="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700"
            @click="loadData"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Loading -->
        <div
          v-else-if="isLoading"
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="item in 6"
            :key="item"
            class="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        </div>

        <!-- Courses -->
        <div
          v-else-if="courses.length > 0"
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <button
            v-for="course in courses"
            :key="course.id"
            type="button"
            class="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            @click="openCourse(course)"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Code -->
              <span
                class="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600"
              >
                {{ course.code }}
              </span>

              <span
                class="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600"
              >
                →
              </span>
            </div>

            <h3 class="mt-5 text-base font-bold leading-6 text-slate-900">
              {{ course.name }}
            </h3>

            <p
              v-if="course.description"
              class="mt-2 line-clamp-3 text-sm leading-5 text-slate-500"
            >
              {{ course.description }}
            </p>

            <div class="mt-5 text-sm font-bold text-indigo-600">
              Lihat materi
            </div>
          </button>
        </div>

        <!-- Empty -->
        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl"
          >
            📚
          </div>

          <h3 class="mt-4 font-bold text-slate-800">Belum ada mata kuliah</h3>

          <p class="mt-1 text-sm text-slate-500">
            Belum terdapat mata kuliah untuk program studi ini.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
