<script setup lang="ts">
import {
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Package,
  Users,
  X,
} from "lucide-vue-next";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

defineProps<{
  open: boolean;
  collapsed: boolean;
}>();

const emit = defineEmits<{
  close: [];
  toggleCollapse: [];
}>();

const route = useRoute();
const router = useRouter();

const menu = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Program Studi", icon: GraduationCap, to: "/admin/programs" },
  { label: "Mata Kuliah", icon: BookOpen, to: "/admin/courses" },
  { label: "Materi / Produk", icon: Package, to: "/admin/products" },
  { label: "Pesanan", icon: ClipboardList, to: "/admin/orders" },
  { label: "Pengguna", icon: Users, to: "/admin/users" },
];

const adminUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem("admin_user") || "null");
  } catch {
    return null;
  }
});

const isActive = (to: string) =>
  to === "/admin"
    ? route.path === "/admin"
    : route.path === to || route.path.startsWith(`${to}/`);

const logout = () => {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_user");
  router.replace("/admin/login");
};
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0"
    :class="[
      open ? 'translate-x-0' : '-translate-x-full',
      collapsed ? 'lg:w-20' : 'lg:w-72',
    ]"
  >
    <div class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
      <div v-if="!collapsed" class="flex min-w-0 items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
          <Boxes class="h-5 w-5 text-white" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-slate-900">Marketplace Tunas</p>
          <p class="text-xs text-slate-500">Admin Panel</p>
        </div>
      </div>

      <div v-else class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
        <Boxes class="h-5 w-5 text-white" />
      </div>

      <button
        type="button"
        class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        @click="emit('close')"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <div v-if="!collapsed" class="border-b border-slate-100 px-4 py-4">
      <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
          {{ adminUser?.name?.charAt(0)?.toUpperCase() || "A" }}
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-800">
            {{ adminUser?.name || "Administrator" }}
          </p>
          <p class="truncate text-xs text-slate-500">
            {{ adminUser?.email || "Admin" }}
          </p>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto p-3">
      <RouterLink
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        :title="collapsed ? item.label : undefined"
        class="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition"
        :class="isActive(item.to)
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
        @click="emit('close')"
      >
        <component
          :is="item.icon"
          class="h-5 w-5 shrink-0"
          :class="isActive(item.to) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"
        />
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="border-t border-slate-200 p-3">
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        :class="collapsed ? 'justify-center' : ''"
        title="Keluar"
        @click="logout"
      >
        <LogOut class="h-5 w-5 shrink-0" />
        <span v-if="!collapsed">Keluar</span>
      </button>
    </div>

    <button
      type="button"
      class="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 lg:flex"
      @click="emit('toggleCollapse')"
    >
      <ChevronRight v-if="collapsed" class="h-4 w-4" />
      <ChevronLeft v-else class="h-4 w-4" />
    </button>
  </aside>
</template>
