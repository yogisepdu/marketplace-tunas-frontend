<script setup lang="ts">
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  GraduationCap,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import AdminStatCard from "../../components/admin/AdminStatCard.vue";
import { adminService } from "../../services/admin.service";

const router = useRouter();

const loading = ref(true);
const refreshing = ref(false);
const errorMessage = ref("");

const counts = ref({
  programs: 0,
  courses: 0,
  products: 0,
  orders: 0,
  users: 0,
});

const orders = ref<any[]>([]);

const adminUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem("admin_user") || "null");
  } catch {
    return null;
  }
});

const displayName = computed(() => {
  return (
    adminUser.value?.name ||
    adminUser.value?.fullName ||
    adminUser.value?.username ||
    "Administrator"
  );
});

const recentOrders = computed(() => {
  return [...orders.value]
    .sort((a, b) => {
      const dateA = new Date(a?.createdAt || a?.created_at || 0).getTime();

      const dateB = new Date(b?.createdAt || b?.created_at || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 6);
});

const paidOrders = computed(() => {
  return orders.value.filter((order) => {
    const status = normalizeStatus(order?.status);

    return [
      "PAID",
      "SETTLEMENT",
      "CAPTURE",
      "SUCCESS",
      "COMPLETED",
      "LUNAS",
    ].includes(status);
  }).length;
});

const pendingOrders = computed(() => {
  return orders.value.filter((order) => {
    const status = normalizeStatus(order?.status);

    return [
      "PENDING",
      "WAITING",
      "WAITING_PAYMENT",
      "UNPAID",
      "MENUNGGU",
    ].includes(status);
  }).length;
});

const cancelledOrders = computed(() => {
  return orders.value.filter((order) => {
    const status = normalizeStatus(order?.status);

    return [
      "CANCELLED",
      "CANCELED",
      "FAILED",
      "EXPIRED",
      "REJECTED",
      "BATAL",
    ].includes(status);
  }).length;
});

const totalRevenue = computed(() => {
  return orders.value.reduce((total, order) => {
    const status = normalizeStatus(order?.status);

    const isPaid = [
      "PAID",
      "SETTLEMENT",
      "CAPTURE",
      "SUCCESS",
      "COMPLETED",
      "LUNAS",
    ].includes(status);

    if (!isPaid) {
      return total;
    }

    return total + getOrderTotal(order);
  }, 0);
});

function normalizeStatus(status: unknown): string {
  return String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function getOrderNumber(order: any): string {
  return order?.orderNumber || order?.order_number || `#${order?.id ?? "-"}`;
}

function getCustomerName(order: any): string {
  return (
    order?.customer?.name ||
    order?.customerName ||
    order?.customer_name ||
    order?.user?.name ||
    "Pelanggan"
  );
}

function getCustomerEmail(order: any): string {
  return (
    order?.customer?.email ||
    order?.customerEmail ||
    order?.customer_email ||
    order?.user?.email ||
    "-"
  );
}

function getOrderTotal(order: any): number {
  const value =
    order?.totalAmount ??
    order?.total_amount ??
    order?.total ??
    order?.grandTotal ??
    order?.grand_total ??
    0;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getOrderItemsCount(order: any): number {
  if (!Array.isArray(order?.items)) {
    return 0;
  }

  return order.items.reduce((total: number, item: any) => {
    return total + Number(item?.quantity || 1);
  }, 0);
}

function formatCurrency(value: number | string): string {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(number) ? number : 0);
}

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: unknown): string {
  const normalized = normalizeStatus(status);

  const labels: Record<string, string> = {
    PAID: "Lunas",
    SETTLEMENT: "Lunas",
    CAPTURE: "Lunas",
    SUCCESS: "Berhasil",
    COMPLETED: "Selesai",
    LUNAS: "Lunas",

    PENDING: "Menunggu",
    WAITING: "Menunggu",
    WAITING_PAYMENT: "Menunggu Pembayaran",
    UNPAID: "Belum Dibayar",
    MENUNGGU: "Menunggu",

    CANCELLED: "Dibatalkan",
    CANCELED: "Dibatalkan",
    FAILED: "Gagal",
    EXPIRED: "Kedaluwarsa",
    REJECTED: "Ditolak",
    BATAL: "Dibatalkan",
  };

  return labels[normalized] || String(status || "Tidak diketahui");
}

function getStatusClass(status: unknown): string {
  const normalized = normalizeStatus(status);

  if (
    ["PAID", "SETTLEMENT", "CAPTURE", "SUCCESS", "COMPLETED", "LUNAS"].includes(
      normalized,
    )
  ) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (
    ["PENDING", "WAITING", "WAITING_PAYMENT", "UNPAID", "MENUNGGU"].includes(
      normalized,
    )
  ) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (
    [
      "CANCELLED",
      "CANCELED",
      "FAILED",
      "EXPIRED",
      "REJECTED",
      "BATAL",
    ].includes(normalized)
  ) {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }

  return "bg-slate-50 text-slate-600 ring-slate-200";
}

function getStatusIcon(status: unknown) {
  const normalized = normalizeStatus(status);

  if (
    ["PAID", "SETTLEMENT", "CAPTURE", "SUCCESS", "COMPLETED", "LUNAS"].includes(
      normalized,
    )
  ) {
    return CheckCircle2;
  }

  if (
    [
      "CANCELLED",
      "CANCELED",
      "FAILED",
      "EXPIRED",
      "REJECTED",
      "BATAL",
    ].includes(normalized)
  ) {
    return XCircle;
  }

  return Clock3;
}

/**
 * Load dashboard dengan request terpisah.
 *
 * Dengan cara ini, apabila salah satu endpoint gagal,
 * dashboard lainnya tetap bisa ditampilkan.
 */
async function load(showLoader = true) {
  if (showLoader) {
    loading.value = true;
  }

  errorMessage.value = "";

  const results = await Promise.allSettled([
    adminService.getPrograms(),
    adminService.getCourses(),
    adminService.getProducts(),
    adminService.getOrders(),
    adminService.getCustomers(),
  ]);

  const [
    programsResult,
    coursesResult,
    productsResult,
    ordersResult,
    customersResult,
  ] = results;

  let hasError = false;

  if (programsResult.status === "fulfilled") {
    counts.value.programs = programsResult.value?.length || 0;
  } else {
    hasError = true;
    console.error("Failed loading programs:", programsResult.reason);
  }

  if (coursesResult.status === "fulfilled") {
    counts.value.courses = coursesResult.value?.length || 0;
  } else {
    hasError = true;
    console.error("Failed loading courses:", coursesResult.reason);
  }

  if (productsResult.status === "fulfilled") {
    counts.value.products = productsResult.value?.length || 0;
  } else {
    hasError = true;
    console.error("Failed loading products:", productsResult.reason);
  }

  if (ordersResult.status === "fulfilled") {
    const orderData = ordersResult.value;

    counts.value.orders = orderData?.length || 0;
    orders.value = Array.isArray(orderData) ? orderData : [];
  } else {
    hasError = true;
    orders.value = [];

    console.error("Failed loading orders:", ordersResult.reason);
  }

  if (customersResult.status === "fulfilled") {
    counts.value.users = customersResult.value?.length || 0;
  } else {
    hasError = true;

    console.error("Failed loading customers:", customersResult.reason);
  }

  if (hasError) {
    errorMessage.value =
      "Sebagian data dashboard gagal dimuat. Silakan coba lagi.";
  }

  loading.value = false;
}

async function refreshDashboard() {
  refreshing.value = true;

  try {
    await load(false);
  } finally {
    refreshing.value = false;
  }
}

function goToOrders() {
  router.push("/admin/orders");
}

function goToPrograms() {
  router.push("/admin/programs");
}

function goToCourses() {
  router.push("/admin/courses");
}

function goToProducts() {
  router.push("/admin/products");
}

function goToCustomers() {
  router.push("/admin/customers");
}

onMounted(() => {
  load();
});
</script>

<template>
  <section class="space-y-6 pb-10">
    <!-- HERO -->
    <div
      class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-200 sm:p-8"
    >
      <div
        class="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
      />

      <div
        class="absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl"
      />

      <div
        class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <div
            class="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-300" />
            Marketplace Tunas Admin
          </div>

          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
            Selamat datang, {{ displayName }} 👋
          </h1>

          <p class="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
            Pantau katalog, pelanggan, dan pesanan marketplace dari satu
            dashboard.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="refreshing"
            @click="refreshDashboard"
          >
            <RefreshCw
              class="h-4 w-4"
              :class="{ 'animate-spin': refreshing }"
            />
            Refresh
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            @click="goToOrders"
          >
            <ShoppingBag class="h-4 w-4" />
            Kelola Pesanan
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- ERROR -->
    <div
      v-if="errorMessage"
      class="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      <div class="flex items-center gap-3">
        <XCircle class="h-5 w-5 shrink-0" />

        <span>{{ errorMessage }}</span>
      </div>

      <button
        type="button"
        class="font-semibold underline underline-offset-2"
        @click="load()"
      >
        Coba lagi
      </button>
    </div>

    <!-- STATISTICS -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <AdminStatCard
        label="Program Studi"
        :value="loading ? '—' : String(counts.programs)"
        :icon="GraduationCap"
        description="Program tersedia"
      />

      <AdminStatCard
        label="Mata Kuliah"
        :value="loading ? '—' : String(counts.courses)"
        :icon="BookOpen"
        description="Mata kuliah tersedia"
      />

      <AdminStatCard
        label="Materi / Produk"
        :value="loading ? '—' : String(counts.products)"
        :icon="Package"
        description="Produk marketplace"
      />

      <AdminStatCard
        label="Pesanan"
        :value="loading ? '—' : String(counts.orders)"
        :icon="ClipboardList"
        description="Total pesanan"
      />

      <AdminStatCard
        label="Pelanggan"
        :value="loading ? '—' : String(counts.users)"
        :icon="Users"
        description="Pengguna terdaftar"
      />
    </div>

    <!-- ORDER OVERVIEW -->
    <div class="grid gap-6 lg:grid-cols-3">
      <div
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-2"
      >
        <div class="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div class="flex items-center gap-2">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
                >
                  <ClipboardList class="h-5 w-5" />
                </div>

                <div>
                  <h2 class="font-bold text-slate-900">Pesanan Terbaru</h2>

                  <p class="text-xs text-slate-500">
                    Aktivitas pesanan marketplace terbaru
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="inline-flex items-center justify-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              @click="goToOrders"
            >
              Lihat semua
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- LOADING -->
        <div v-if="loading" class="divide-y divide-slate-100">
          <div
            v-for="item in 4"
            :key="item"
            class="flex animate-pulse items-center gap-4 px-5 py-4 sm:px-6"
          >
            <div class="h-11 w-11 rounded-xl bg-slate-100" />

            <div class="min-w-0 flex-1">
              <div class="h-4 w-32 rounded bg-slate-100" />

              <div class="mt-2 h-3 w-48 rounded bg-slate-100" />
            </div>

            <div class="hidden h-4 w-24 rounded bg-slate-100 sm:block" />

            <div class="h-6 w-20 rounded-full bg-slate-100" />
          </div>
        </div>

        <!-- EMPTY -->
        <div
          v-else-if="recentOrders.length === 0"
          class="px-6 py-14 text-center"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"
          >
            <ShoppingBag class="h-7 w-7" />
          </div>

          <h3 class="mt-4 font-semibold text-slate-900">Belum ada pesanan</h3>

          <p class="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Pesanan pelanggan akan muncul di sini setelah transaksi dibuat.
          </p>
        </div>

        <!-- ORDERS -->
        <div v-else class="divide-y divide-slate-100">
          <button
            v-for="order in recentOrders"
            :key="order.id"
            type="button"
            class="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
            @click="goToOrders"
          >
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 ring-1 ring-indigo-100"
            >
              <ShoppingBag class="h-5 w-5" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p
                  class="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-600"
                >
                  {{ getOrderNumber(order) }}
                </p>

                <span class="text-slate-300"> • </span>

                <p class="truncate text-xs text-slate-500">
                  {{ getCustomerName(order) }}
                </p>
              </div>

              <div
                class="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400"
              >
                <span>
                  {{ getCustomerEmail(order) }}
                </span>

                <span class="hidden sm:inline"> • </span>

                <span> {{ getOrderItemsCount(order) }} item </span>

                <span class="hidden sm:inline"> • </span>

                <span>
                  {{ formatDate(order?.createdAt || order?.created_at) }}
                </span>
              </div>
            </div>

            <div class="hidden text-right sm:block">
              <p class="text-sm font-bold text-slate-900">
                {{ formatCurrency(getOrderTotal(order)) }}
              </p>

              <p class="mt-1 text-xs text-slate-400">Total pesanan</p>
            </div>

            <div class="shrink-0">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1"
                :class="getStatusClass(order?.status)"
              >
                <component
                  :is="getStatusIcon(order?.status)"
                  class="h-3.5 w-3.5"
                />

                {{ getStatusLabel(order?.status) }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- ORDER SUMMARY -->
      <div class="space-y-6">
        <div
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-500">
                Nilai Pesanan Lunas
              </p>

              <p class="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {{ loading ? "—" : formatCurrency(totalRevenue) }}
              </p>
            </div>

            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
            >
              <TrendingUp class="h-5 w-5" />
            </div>
          </div>

          <div class="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" />

            Berdasarkan pesanan berstatus lunas
          </div>
        </div>

        <div
          class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div class="mb-5">
            <p class="font-bold text-slate-900">Ringkasan Pesanan</p>

            <p class="mt-1 text-xs text-slate-500">Kondisi pesanan saat ini</p>
          </div>

          <div class="space-y-3">
            <div
              class="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm"
                >
                  <CheckCircle2 class="h-4 w-4" />
                </div>

                <span class="text-sm font-semibold text-emerald-800">
                  Berhasil / Lunas
                </span>
              </div>

              <span class="text-lg font-bold text-emerald-700">
                {{ loading ? "—" : paidOrders }}
              </span>
            </div>

            <div
              class="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm"
                >
                  <Clock3 class="h-4 w-4" />
                </div>

                <span class="text-sm font-semibold text-amber-800">
                  Menunggu
                </span>
              </div>

              <span class="text-lg font-bold text-amber-700">
                {{ loading ? "—" : pendingOrders }}
              </span>
            </div>

            <div
              class="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm"
                >
                  <XCircle class="h-4 w-4" />
                </div>

                <span class="text-sm font-semibold text-rose-800">
                  Dibatalkan / Gagal
                </span>
              </div>

              <span class="text-lg font-bold text-rose-700">
                {{ loading ? "—" : cancelledOrders }}
              </span>
            </div>
          </div>

          <button
            type="button"
            class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            @click="goToOrders"
          >
            Buka halaman pesanan
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- QUICK ACTIONS -->
    <div
      class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div class="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-bold text-slate-900">Aksi Cepat</h2>

            <p class="mt-1 text-sm text-slate-500">
              Kelola bagian penting Marketplace Tunas.
            </p>
          </div>

          <div
            class="hidden h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:flex"
          >
            <Plus class="h-5 w-5" />
          </div>
        </div>
      </div>

      <div class="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5 sm:p-6">
        <button
          type="button"
          class="group rounded-2xl border border-slate-200 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm"
          @click="router.push('/admin/programs/create')"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100"
          >
            <GraduationCap class="h-5 w-5" />
          </div>

          <p class="mt-4 text-sm font-bold text-slate-900">Tambah Program</p>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Buat program studi baru
          </p>
        </button>

        <button
          type="button"
          class="group rounded-2xl border border-slate-200 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
          @click="router.push('/admin/courses/create')"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100"
          >
            <BookOpen class="h-5 w-5" />
          </div>

          <p class="mt-4 text-sm font-bold text-slate-900">
            Tambah Mata Kuliah
          </p>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Tambahkan mata kuliah
          </p>
        </button>

        <button
          type="button"
          class="group rounded-2xl border border-slate-200 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:shadow-sm"
          @click="router.push('/admin/products/create')"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100"
          >
            <Package class="h-5 w-5" />
          </div>

          <p class="mt-4 text-sm font-bold text-slate-900">Tambah Materi</p>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Upload produk atau materi
          </p>
        </button>

        <button
          type="button"
          class="group rounded-2xl border border-slate-200 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-sm"
          @click="goToOrders"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100"
          >
            <ClipboardList class="h-5 w-5" />
          </div>

          <p class="mt-4 text-sm font-bold text-slate-900">Kelola Pesanan</p>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Cek transaksi pelanggan
          </p>
        </button>

        <button
          type="button"
          class="group rounded-2xl border border-slate-200 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:shadow-sm"
          @click="goToCustomers"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-100"
          >
            <Users class="h-5 w-5" />
          </div>

          <p class="mt-4 text-sm font-bold text-slate-900">Pelanggan</p>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Lihat data pelanggan
          </p>
        </button>
      </div>
    </div>

    <!-- NAVIGATION SHORTCUTS -->
    <div class="grid gap-4 sm:grid-cols-3">
      <button
        type="button"
        class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
        @click="goToPrograms"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
          >
            <GraduationCap class="h-5 w-5" />
          </div>

          <div>
            <p class="text-sm font-bold text-slate-900">Program Studi</p>

            <p class="text-xs text-slate-500">{{ counts.programs }} program</p>
          </div>
        </div>

        <ChevronRight class="h-5 w-5 text-slate-300" />
      </button>

      <button
        type="button"
        class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
        @click="goToCourses"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
          >
            <BookOpen class="h-5 w-5" />
          </div>

          <div>
            <p class="text-sm font-bold text-slate-900">Mata Kuliah</p>

            <p class="text-xs text-slate-500">
              {{ counts.courses }} mata kuliah
            </p>
          </div>
        </div>

        <ChevronRight class="h-5 w-5 text-slate-300" />
      </button>

      <button
        type="button"
        class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
        @click="goToProducts"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"
          >
            <Package class="h-5 w-5" />
          </div>

          <div>
            <p class="text-sm font-bold text-slate-900">Produk / Materi</p>

            <p class="text-xs text-slate-500">{{ counts.products }} produk</p>
          </div>
        </div>

        <ChevronRight class="h-5 w-5 text-slate-300" />
      </button>
    </div>
  </section>
</template>
