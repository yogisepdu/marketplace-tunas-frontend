<template>
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div
        class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white"
            >
              T
            </div>

            <span class="font-bold text-slate-900"> Marketplace Tunas </span>
          </div>

          <p class="mt-3 max-w-md text-sm leading-6 text-slate-500">
            Platform materi belajar digital untuk membantu mahasiswa belajar
            dengan lebih terarah.
          </p>
        </div>

        <div class="text-sm text-slate-500">
          © {{ new Date().getFullYear() }} Marketplace Tunas
        </div>
      </div>
    </div>
  </footer>
</template>
