<script setup lang="ts">
import logoUT from "../../assets/logo.png";

import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl"
  >
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8"
    >
      <!-- Logo -->
      <RouterLink
        to="/"
        class="flex items-center gap-2.5"
        aria-label="Marketplace Tunas"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 transition duration-200 group-hover:ring-indigo-200"
        >
          <img
            :src="logoUT"
            alt="Logo Universitas Terbuka"
            class="h-full w-full object-contain p-2"
          />
        </div>

        <div class="hidden sm:block">
          <div class="text-[15px] font-bold tracking-tight text-slate-900">
            Marketplace Tunas
          </div>

          <div class="text-[10px] font-medium text-slate-500">
            Materi belajar digital
          </div>
        </div>
      </RouterLink>

      <!-- Desktop Navigation -->
      <nav class="hidden items-center gap-8 lg:flex">
        <RouterLink
          to="/"
          class="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
        >
          Beranda
        </RouterLink>

        <a
          href="#program"
          class="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
        >
          Program Studi
        </a>

        <a
          href="#materi"
          class="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
        >
          Materi
        </a>
      </nav>

      <!-- Desktop Actions -->
      <!-- Desktop Actions -->
      <div class="hidden items-center gap-3 lg:flex">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
          aria-label="Keranjang"
          title="Keranjang"
          @click="router.push('/cart')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.8"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.328 1.228m0 0L6.75 15.75A2.25 2.25 0 0 0 8.932 17.5h7.136a2.25 2.25 0 0 0 2.182-1.75l1.7-7.65H5.051ZM9 21h.008v.008H9V21Zm6 0h.008v.008H15V21Z"
            />
          </svg>
        </button>

        <button
          type="button"
          class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          @click="router.push('/admin/login')"
        >
          Masuk
        </button>
      </div>

      <!-- Mobile Actions -->
      <div class="flex items-center gap-1 lg:hidden">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
          aria-label="Keranjang"
          title="Keranjang"
          @click="router.push('/cart')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.8"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.328 1.228m0 0L6.75 15.75A2.25 2.25 0 0 0 8.932 17.5h7.136a2.25 2.25 0 0 0 2.182-1.75l1.7-7.65H5.051ZM9 21h.008v.008H9V21Zm6 0h.008v.008H15V21Z"
            />
          </svg>
        </button>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          aria-label="Profil"
          @click="router.push('/admin/login')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.8"
            stroke="currentColor"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
