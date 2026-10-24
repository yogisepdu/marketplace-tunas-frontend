<script setup lang="ts">
import { Edit3, Search, Trash2 } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import AdminPageHeader from "../../components/admin/AdminPageHeader.vue";
import AdminTable from "../../components/admin/AdminTable.vue";
import { adminService } from "../../services/admin.service";
import type { AdminProgram } from "../../types/admin";

const router = useRouter();
const programs = ref<AdminProgram[]>([]);
const loading = ref(true);
const search = ref("");
const error = ref("");

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return programs.value;
  return programs.value.filter((item) =>
    [item.name, item.code || ""].some((v) => v.toLowerCase().includes(q)),
  );
});

const load = async () => {
  loading.value = true;
  error.value = "";
  try {
    programs.value = await adminService.getPrograms();
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Gagal memuat program studi.";
  } finally {
    loading.value = false;
  }
};

const remove = async (item: AdminProgram) => {
  if (!confirm(`Hapus program "${item.name}"?`)) return;
  try {
    await adminService.deleteProgram(item.id);
    await load();
  } catch (e: any) {
    alert(e?.response?.data?.message || "Gagal menghapus data.");
  }
};

onMounted(load);
</script>

<template>
  <section>
    <AdminPageHeader
      title="Program Studi"
      description="Kelola program studi yang tampil di katalog."
      action-label="Tambah Program"
      :show-action="true"
      @action="router.push('/admin/programs/create')"
    />

    <div
      v-if="error"
      class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row">
      <div class="relative max-w-md flex-1">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Cari nama atau kode..."
          class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>

    <AdminTable
      :loading="loading"
      :empty="!loading && filtered.length === 0"
      empty-text="Belum ada program studi."
    >
      <template #head>
        <th class="px-5 py-4">Program</th>
        <th class="px-5 py-4">Kode</th>
        <th class="px-5 py-4">Mata Kuliah</th>
        <th class="px-5 py-4">Status</th>
        <th class="px-5 py-4 text-right">Aksi</th>
      </template>

      <tr v-for="item in filtered" :key="item.id" class="hover:bg-slate-50">
        <td class="px-5 py-4">
          <p class="font-semibold text-slate-800">{{ item.name }}</p>
          <p class="mt-1 max-w-md truncate text-xs text-slate-400">
            {{ item.description || "—" }}
          </p>
        </td>
        <td class="px-5 py-4 text-slate-600">{{ item.code || "—" }}</td>
        <td class="px-5 py-4 text-slate-600">
          {{ item._count?.courses ?? "—" }}
        </td>
        <td class="px-5 py-4">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="
              item.isActive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            "
          >
            {{ item.isActive ? "Aktif" : "Nonaktif" }}
          </span>
        </td>
        <td class="px-5 py-4">
          <div class="flex justify-end gap-1">
            <button
              class="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
              title="Edit"
              @click="router.push(`/admin/programs/${item.id}/edit`)"
            >
              <Edit3 class="h-4 w-4" />
            </button>
            <button
              class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              title="Hapus"
              @click="remove(item)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    </AdminTable>
  </section>
</template>
