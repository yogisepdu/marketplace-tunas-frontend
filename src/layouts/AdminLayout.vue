<script setup lang="ts">
import { Menu } from "lucide-vue-next";
import { ref } from "vue";

import AdminSidebar from "../components/admin/AdminSidebar.vue";

const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="flex min-h-screen">
      <AdminSidebar
        :open="sidebarOpen"
        :collapsed="sidebarCollapsed"
        @close="sidebarOpen = false"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      />

      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        @click="sidebarOpen = false"
      />

      <div class="min-w-0 flex-1">
        <header class="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            class="mr-3 rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            @click="sidebarOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800">
              Administrator
            </p>
            <p class="truncate text-xs text-slate-500">
              Kelola Marketplace Tunas
            </p>
          </div>

          <div class="hidden rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:block">
            Sistem aktif
          </div>
        </header>

        <main class="p-4 sm:p-6 lg:p-8">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>
