<script setup lang="ts">
import { Search, UserRound } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";

import AdminPageHeader from "../../components/admin/AdminPageHeader.vue";
import AdminTable from "../../components/admin/AdminTable.vue";
import { adminService } from "../../services/admin.service";
import type { AdminCustomer } from "../../types/admin";

const users = ref<AdminCustomer[]>([]);
const loading = ref(true);
const search = ref("");

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();

  if (!q) {
    return users.value;
  }

  return users.value.filter((item) => {
    const values = [
      item.name,
      item.email,
      item.whatsapp ?? "",
      String(item.id),
    ];

    return values.some((value) => value.toLowerCase().includes(q));
  });
});

const load = async () => {
  loading.value = true;

  try {
    users.value = await adminService.getCustomers();
  } catch (error) {
    console.error("Gagal mengambil data pengguna:", error);

    users.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

onMounted(load);
</script>

<template>
  <section>
    <AdminPageHeader
      title="Pengguna"
      description="Lihat data pelanggan marketplace."
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
          placeholder="Cari nama, email, atau WhatsApp..."
          class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>

    <!-- Table -->
    <AdminTable
      :loading="loading"
      :empty="!loading && filtered.length === 0"
      empty-text="Belum ada pengguna."
    >
      <template #head>
        <th class="px-5 py-4">Pengguna</th>

        <th class="px-5 py-4">WhatsApp</th>

        <th class="px-5 py-4">Pesanan</th>

        <th class="px-5 py-4">Terdaftar</th>
      </template>

      <tr v-for="item in filtered" :key="item.id" class="hover:bg-slate-50">
        <!-- Customer -->
        <td class="px-5 py-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            >
              <UserRound class="h-4 w-4" />
            </div>

            <div>
              <p class="font-semibold text-slate-800">
                {{ item.name || "Tanpa nama" }}
              </p>

              <p class="text-xs text-slate-400">
                {{ item.email || "—" }}
              </p>
            </div>
          </div>
        </td>

        <!-- WhatsApp -->
        <td class="px-5 py-4 text-slate-600">
          {{ item.whatsapp || "—" }}
        </td>

        <!-- Orders Count -->
        <td class="px-5 py-4">
          <span
            class="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
          >
            {{ item._count?.orders ?? 0 }} pesanan
          </span>
        </td>

        <!-- Created -->
        <td class="px-5 py-4 text-xs text-slate-500">
          {{ formatDate(item.createdAt) }}
        </td>
      </tr>
    </AdminTable>
  </section>
</template>
