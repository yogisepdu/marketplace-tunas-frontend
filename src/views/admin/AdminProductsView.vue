<script setup lang="ts">
import { Edit3, Search, Trash2 } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import AdminPageHeader from "../../components/admin/AdminPageHeader.vue";
import AdminTable from "../../components/admin/AdminTable.vue";
import { adminService } from "../../services/admin.service";
import type { AdminProduct } from "../../types/admin";

const router = useRouter();
const products = ref<AdminProduct[]>([]);
const loading = ref(true);
const search = ref("");
const status = ref("");

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return products.value.filter((item) => {
    const matchesSearch = !q || [item.title, item.slug, item.course?.name || ""].some((v) => v.toLowerCase().includes(q));
    const matchesStatus = !status.value || item.status === status.value;
    return matchesSearch && matchesStatus;
  });
});

const load = async () => {
  loading.value = true;
  try {
    products.value = await adminService.getProducts();
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const remove = async (item: AdminProduct) => {
  if (!confirm(`Hapus materi "${item.title}"?`)) return;
  try {
    await adminService.deleteProduct(item.id);
    await load();
  } catch (e: any) {
    alert(e?.response?.data?.message || "Gagal menghapus data.");
  }
};

onMounted(load);
</script>

<template>
  <section>
    <AdminPageHeader title="Materi / Produk" description="Kelola produk materi yang dijual di marketplace." action-label="Tambah Materi" :show-action="true" @action="router.push('/admin/products/create')" />

    <div class="mb-4 grid gap-3 sm:grid-cols-2">
      <div class="relative">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input v-model="search" type="search" placeholder="Cari judul, slug, atau mata kuliah..." class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500" />
      </div>
      <select v-model="status" class="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500">
        <option value="">Semua Status</option>
        <option value="DRAFT">Draft</option>
        <option value="ACTIVE">Aktif</option>
        <option value="INACTIVE">Nonaktif</option>
      </select>
    </div>

    <AdminTable :loading="loading" :empty="!loading && filtered.length === 0" empty-text="Belum ada materi / produk.">
      <template #head>
        <th class="px-5 py-4">Produk</th>
        <th class="px-5 py-4">Mata Kuliah</th>
        <th class="px-5 py-4">Harga</th>
        <th class="px-5 py-4">Status</th>
        <th class="px-5 py-4 text-right">Aksi</th>
      </template>
      <tr v-for="item in filtered" :key="item.id" class="hover:bg-slate-50">
        <td class="px-5 py-4">
          <p class="font-semibold text-slate-800">{{ item.title }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ item.slug }}</p>
        </td>
        <td class="px-5 py-4 text-slate-600">{{ item.course?.name || `Course #${item.courseId}` }}</td>
        <td class="px-5 py-4 font-medium text-slate-700">Rp {{ Number(item.price || 0).toLocaleString("id-ID") }}</td>
        <td class="px-5 py-4">
          <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : item.status === 'DRAFT' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'">
            {{ item.status }}
          </span>
        </td>
        <td class="px-5 py-4">
          <div class="flex justify-end gap-1">
            <button class="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600" @click="router.push(`/admin/products/${item.id}/edit`)"><Edit3 class="h-4 w-4" /></button>
            <button class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" @click="remove(item)"><Trash2 class="h-4 w-4" /></button>
          </div>
        </td>
      </tr>
    </AdminTable>
  </section>
</template>
