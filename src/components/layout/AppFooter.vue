<script setup lang="ts">
import logoUT from "../../assets/logo.png";

const currentYear = new Date().getFullYear();
</script>

<template>
  <footer
    class="relative overflow-hidden border-t border-indigo-900/30 bg-indigo-950"
  >
    <!-- Decorative background -->
    <div
      class="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl"
    ></div>

    <div
      class="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl"
    ></div>

    <div
      class="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl"
    ></div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- =========================================================
           TOP BRAND BANNER
      ========================================================== -->
      <div class="border-b border-white/10 py-8 sm:py-10">
        <div
          class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <!-- Brand -->
          <div class="flex items-center gap-4">
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg shadow-black/10 ring-1 ring-white/10"
            >
              <img
                :src="logoUT"
                alt="Logo Universitas Terbuka"
                class="h-full w-full object-contain"
              />
            </div>

            <div>
              <div
                class="text-lg font-bold tracking-tight text-white sm:text-xl"
              >
                Marketplace Tunas
              </div>

              <div
                class="mt-1 flex items-center gap-2 text-xs font-medium text-slate-400"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>

                Platform materi belajar digital
              </div>
            </div>
          </div>

          <!-- Small badge -->
          <div
            class="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.7"
              stroke="currentColor"
              class="h-4 w-4 text-indigo-400"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>

            Belajar lebih terarah
          </div>
        </div>
      </div>

      <!-- =========================================================
           MAIN FOOTER CONTENT
      ========================================================== -->
      <div class="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        <!-- Brand Description -->
        <div class="sm:col-span-2 lg:col-span-2">
          <div class="max-w-md">
            <h2
              class="text-sm font-bold uppercase tracking-[0.18em] text-indigo-400"
            >
              Tentang Marketplace Tunas
            </h2>

            <p class="mt-4 text-sm leading-7 text-slate-400 sm:text-[15px]">
              Marketplace Tunas merupakan platform materi belajar digital yang
              dirancang untuk membantu mahasiswa menemukan materi, referensi,
              dan sumber belajar secara lebih mudah, terstruktur, dan praktis.
            </p>

            <!-- Feature pills -->
            <div class="mt-6 flex flex-wrap gap-2">
              <span
                class="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300"
              >
                Materi Digital
              </span>

              <span
                class="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300"
              >
                Program Studi
              </span>

              <span
                class="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300"
              >
                Belajar Online
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div>
          <h3 class="text-sm font-bold uppercase tracking-[0.16em] text-white">
            Navigasi
          </h3>

          <ul class="mt-5 space-y-3">
            <li>
              <RouterLink
                to="/"
                class="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <span
                  class="h-1 w-1 rounded-full bg-slate-600 transition group-hover:bg-indigo-400"
                ></span>
                Beranda
              </RouterLink>
            </li>

            <li>
              <a
                href="#program"
                class="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <span
                  class="h-1 w-1 rounded-full bg-slate-600 transition group-hover:bg-indigo-400"
                ></span>
                Program Studi
              </a>
            </li>

            <li>
              <a
                href="#materi"
                class="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <span
                  class="h-1 w-1 rounded-full bg-slate-600 transition group-hover:bg-indigo-400"
                ></span>
                Materi
              </a>
            </li>
          </ul>
        </div>

        <!-- Information -->
        <div>
          <h3 class="text-sm font-bold uppercase tracking-[0.16em] text-white">
            Informasi
          </h3>

          <ul class="mt-5 space-y-3">
            <li>
              <a
                href="#"
                class="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <span
                  class="h-1 w-1 rounded-full bg-slate-600 transition group-hover:bg-indigo-400"
                ></span>
                Tentang Kami
              </a>
            </li>

            <li>
              <a
                href="#"
                class="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <span
                  class="h-1 w-1 rounded-full bg-slate-600 transition group-hover:bg-indigo-400"
                ></span>
                Bantuan
              </a>
            </li>

            <li>
              <a
                href="#"
                class="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <span
                  class="h-1 w-1 rounded-full bg-slate-600 transition group-hover:bg-indigo-400"
                ></span>
                Kebijakan Privasi
              </a>
            </li>

            <li>
              <a
                href="#"
                class="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <span
                  class="h-1 w-1 rounded-full bg-slate-600 transition group-hover:bg-indigo-400"
                ></span>
                Syarat & Ketentuan
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- =========================================================
           BOTTOM BAR
      ========================================================== -->
      <div
        class="flex flex-col gap-5 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <!-- Copyright -->
        <div class="text-xs leading-5 text-slate-500">
          © {{ currentYear }}
          <span class="font-semibold text-slate-400"> Marketplace Tunas </span>
          . All rights reserved.
        </div>

        <!-- Social / Status -->
        <div class="flex items-center gap-2">
          <!-- Instagram -->
          <a
            href="#"
            aria-label="Instagram"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.7"
              stroke="currentColor"
              class="h-4 w-4"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Zm1.5-4.87h.01"
              />
            </svg>
          </a>

          <!-- Facebook -->
          <a
            href="#"
            aria-label="Facebook"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.7"
              stroke="currentColor"
              class="h-4 w-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 3h3v4h-3c-1.1 0-2 .9-2 2v2h5l-1 4h-4v6h-4v-6H6v-4h3V9a6 6 0 0 1 6-6Z"
              />
            </svg>
          </a>

          <!-- Email -->
          <a
            href="mailto:"
            aria-label="Email"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.7"
              stroke="currentColor"
              class="h-4 w-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m3.75 6 7.055 5.29a1.95 1.95 0 0 0 2.39 0L20.25 6"
              />
            </svg>
          </a>

          <!-- Online Status -->
          <div
            class="ml-2 hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 sm:flex"
          >
            <span
              class="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            ></span>

            <span class="text-[11px] font-medium text-slate-400"> Online </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
