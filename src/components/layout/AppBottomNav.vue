<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden"
  >
    <div class="mx-auto grid max-w-md grid-cols-4 gap-1">
      <!-- Home -->
      <RouterLink
        to="/"
        class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-indigo-600"
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
            d="m2.25 12 8.954-8.954a1.125 1.125 0 0 1 1.592 0L21.75 12M4.5 9.75V21h15V9.75M9 21v-6.75h6V21"
          />
        </svg>

        <span class="text-[11px] font-semibold"> Beranda </span>
      </RouterLink>

      <!-- Materi -->
      <button
        type="button"
        class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-slate-500 transition hover:text-indigo-600"
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
            d="M12 6.75a6.75 6.75 0 0 0-6.75-6.75H3.75v15h1.5A6.75 6.75 0 0 1 12 21.75m0-15A6.75 6.75 0 0 1 18.75 0h1.5v15h-1.5A6.75 6.75 0 0 0 12 21.75m0-15v15"
          />
        </svg>

        <span class="text-[11px] font-medium"> Materi </span>
      </button>

      <!-- Keranjang -->
      <button
        type="button"
        class="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-slate-500 transition hover:text-indigo-600"
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

        <span class="text-[11px] font-medium"> Keranjang </span>
      </button>

      <!-- Akun -->
      <button
        type="button"
        class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-slate-500 transition hover:text-indigo-600"
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

        <span class="text-[11px] font-medium"> Akun </span>
      </button>
    </div>
  </nav>
</template>
