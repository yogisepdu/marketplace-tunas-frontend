<script setup lang="ts">
import { Eye, Search } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";

import AdminModal from "../../components/admin/AdminModal.vue";
import AdminPageHeader from "../../components/admin/AdminPageHeader.vue";
import AdminTable from "../../components/admin/AdminTable.vue";
import { adminService } from "../../services/admin.service";
import type { AdminOrder } from "../../types/admin";

const orders = ref<AdminOrder[]>([]);
const loading = ref(true);
const search = ref("");
const selected = ref<AdminOrder | null>(null);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();

  if (!q) {
    return orders.value;
  }

  return orders.value.filter((item) => {
    const values = [
      String(item.id),
      item.orderNumber,
      item.customer?.name ?? "",
      item.customer?.email ?? "",
      item.customer?.whatsapp ?? "",
      item.status,
    ];

    return values.some((value) => value.toLowerCase().includes(q));
  });
});

const load = async () => {
  loading.value = true;

  try {
    orders.value = await adminService.getOrders();
  } catch (error) {
    console.error("Gagal mengambil data pesanan:", error);
    orders.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatCurrency = (value?: number | string | null) => {
  return Number(value ?? 0).toLocaleString("id-ID");
};

const statusClass = (status?: string) => {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "bg-amber-50 text-amber-700";

    case "EXPIRED":
      return "bg-slate-100 text-slate-600";

    case "CANCELLED":
    case "FAILED":
    case "REFUNDED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

onMounted(load);
</script>

<template>
  <section>
    <AdminPageHeader
      title="Pesanan"
      description="Pantau pesanan dan transaksi pelanggan."
    />

    <!-- Search -->
    <div class="mb-4 max-w-md">
      <div class="relative">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />

        <input
          v-model="search"
          type="search"
          placeholder="Cari nomor pesanan, pelanggan, email..."
          class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>

    <!-- Table -->
    <AdminTable
      :loading="loading"
      :empty="!loading && filtered.length === 0"
      empty-text="Belum ada pesanan."
    >
      <template #head>
        <th class="px-5 py-4">Pesanan</th>

        <th class="px-5 py-4">Pelanggan</th>

        <th class="px-5 py-4">Total</th>

        <th class="px-5 py-4">Status</th>

        <th class="px-5 py-4">Tanggal</th>

        <th class="px-5 py-4 text-right">Detail</th>
      </template>

      <tr v-for="item in filtered" :key="item.id" class="hover:bg-slate-50">
        <!-- Order -->
        <td class="px-5 py-4">
          <p class="font-semibold text-slate-800">
            {{ item.orderNumber }}
          </p>

          <p class="mt-1 text-xs text-slate-400">ID #{{ item.id }}</p>
        </td>

        <!-- Customer -->
        <td class="px-5 py-4">
          <p class="font-medium text-slate-700">
            {{ item.customer?.name || "—" }}
          </p>

          <p class="text-xs text-slate-400">
            {{ item.customer?.email || "—" }}
          </p>

          <p v-if="item.customer?.whatsapp" class="mt-1 text-xs text-slate-400">
            {{ item.customer.whatsapp }}
          </p>
        </td>

        <!-- Total -->
        <td class="px-5 py-4">
          <p class="font-semibold text-slate-700">
            Rp {{ formatCurrency(item.totalAmount) }}
          </p>

          <p class="mt-1 text-xs text-slate-400">
            {{ item.items?.length ?? 0 }} item
          </p>
        </td>

        <!-- Status -->
        <td class="px-5 py-4">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="statusClass(item.status)"
          >
            {{ item.status }}
          </span>
        </td>

        <!-- Date -->
        <td class="px-5 py-4 text-xs text-slate-500">
          {{ formatDate(item.createdAt) }}
        </td>

        <!-- Detail -->
        <td class="px-5 py-4 text-right">
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
            title="Lihat detail"
            @click="selected = item"
          >
            <Eye class="h-4 w-4" />
          </button>
        </td>
      </tr>
    </AdminTable>

    <!-- Detail Modal -->
    <AdminModal
      :open="Boolean(selected)"
      title="Detail Pesanan"
      @close="selected = null"
    >
      <div v-if="selected" class="space-y-5">
        <!-- Order Summary -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-xs text-slate-400">Nomor Pesanan</p>

            <p class="mt-1 font-semibold text-slate-800">
              {{ selected.orderNumber }}
            </p>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-xs text-slate-400">Status</p>

            <span
              class="mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="statusClass(selected.status)"
            >
              {{ selected.status }}
            </span>
          </div>

          <!-- Customer -->
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-xs text-slate-400">Pelanggan</p>

            <p class="mt-1 font-semibold text-slate-800">
              {{ selected.customer?.name || "—" }}
            </p>

            <p class="text-xs text-slate-500">
              {{ selected.customer?.email || "—" }}
            </p>

            <p
              v-if="selected.customer?.whatsapp"
              class="mt-1 text-xs text-slate-500"
            >
              {{ selected.customer.whatsapp }}
            </p>
          </div>

          <!-- Total -->
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-xs text-slate-400">Total</p>

            <p class="mt-1 text-lg font-bold text-slate-800">
              Rp {{ formatCurrency(selected.totalAmount) }}
            </p>
          </div>
        </div>

        <!-- Price Summary -->
        <div class="rounded-xl border border-slate-100 p-4">
          <p class="mb-3 text-sm font-semibold text-slate-800">
            Ringkasan Pembayaran
          </p>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500"> Subtotal </span>

              <span class="font-medium text-slate-700">
                Rp {{ formatCurrency(selected.subtotal) }}
              </span>
            </div>

            <div class="flex justify-between">
              <span class="text-slate-500"> Diskon </span>

              <span class="font-medium text-slate-700">
                Rp {{ formatCurrency(selected.discountAmount) }}
              </span>
            </div>

            <div class="border-t border-slate-100 pt-2 flex justify-between">
              <span class="font-semibold text-slate-700"> Total </span>

              <span class="font-bold text-slate-800">
                Rp {{ formatCurrency(selected.totalAmount) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div v-if="selected.items?.length">
          <p class="mb-2 text-sm font-semibold text-slate-800">Item Pesanan</p>

          <div class="space-y-2">
            <div
              v-for="item in selected.items"
              :key="item.id"
              class="rounded-xl border border-slate-100 p-3"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="font-medium text-slate-700">
                    {{ item.productTitle }}
                  </p>

                  <p class="mt-1 text-xs text-slate-400">
                    {{ item.quantity }} × Rp
                    {{ formatCurrency(item.unitPrice) }}
                  </p>
                </div>

                <p class="font-semibold text-slate-700">
                  Rp {{ formatCurrency(item.subtotal) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs text-slate-400">Dibuat</p>

            <p class="mt-1 text-sm text-slate-600">
              {{ formatDate(selected.createdAt) }}
            </p>
          </div>

          <div>
            <p class="text-xs text-slate-400">Dibayar</p>

            <p class="mt-1 text-sm text-slate-600">
              {{ formatDate(selected.paidAt) }}
            </p>
          </div>
        </div>
      </div>
    </AdminModal>
  </section>
</template>
