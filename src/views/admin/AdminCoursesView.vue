<script setup lang="ts">
import { Edit3, Search, Trash2 } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import AdminPageHeader from "../../components/admin/AdminPageHeader.vue";
import AdminTable from "../../components/admin/AdminTable.vue";
import { adminService } from "../../services/admin.service";
import type { AdminCourse, AdminProgram } from "../../types/admin";

const router = useRouter();
const courses = ref<AdminCourse[]>([]);
const programs = ref<AdminProgram[]>([]);
const loading = ref(true);
const search = ref("");
const programId = ref("");

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return courses.value.filter((item) => {
    const matchesSearch =
      !q ||
      [item.name, item.code, item.studyProgram?.name || ""].some((v) =>
        v.toLowerCase().includes(q),
      );
    const matchesProgram =
      !programId.value || String(item.studyProgramId) === programId.value;
    return matchesSearch && matchesProgram;
  });
});

const load = async () => {
  loading.value = true;
  try {
    const [courseData, programData] = await Promise.all([
      adminService.getCourses(),
      adminService.getPrograms(),
    ]);
    courses.value = courseData;
    programs.value = programData;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const remove = async (item: AdminCourse) => {
  if (!confirm(`Hapus mata kuliah "${item.name}"?`)) return;
  try {
    await adminService.deleteCourse(item.id);
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
      title="Mata Kuliah"
      description="Kelola mata kuliah berdasarkan program studi."
      action-label="Tambah Mata Kuliah"
      :show-action="true"
      @action="router.push('/admin/courses/create')"
    />

    <div class="mb-4 grid gap-3 sm:grid-cols-2">
      <div class="relative">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Cari kode atau nama..."
          class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
      <select
        v-model="programId"
        class="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500"
      >
        <option value="">Semua Program Studi</option>
        <option
          v-for="item in programs"
          :key="item.id"
          :value="String(item.id)"
        >
          {{ item.name }}
        </option>
      </select>
    </div>

    <AdminTable
      :loading="loading"
      :empty="!loading && filtered.length === 0"
      empty-text="Belum ada mata kuliah."
    >
      <template #head>
        <th class="px-5 py-4">Mata Kuliah</th>
        <th class="px-5 py-4">Program Studi</th>
        <th class="px-5 py-4">Semester</th>
        <th class="px-5 py-4">SKS</th>
        <th class="px-5 py-4">Status</th>
        <th class="px-5 py-4 text-right">Aksi</th>
      </template>
      <tr v-for="item in filtered" :key="item.id" class="hover:bg-slate-50">
        <td class="px-5 py-4">
          <p class="font-semibold text-slate-800">{{ item.name }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ item.code }}</p>
        </td>
        <td class="px-5 py-4 text-slate-600">
          {{ item.studyProgram?.name || `Program #${item.studyProgramId}` }}
        </td>
        <td class="px-5 py-4 text-slate-600">{{ item.semester ?? "—" }}</td>
        <td class="px-5 py-4 text-slate-600">{{ item.credits ?? "—" }}</td>
        <td class="px-5 py-4">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="
              item.isActive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            "
            >{{ item.isActive ? "Aktif" : "Nonaktif" }}</span
          >
        </td>
        <td class="px-5 py-4">
          <div class="flex justify-end gap-1">
            <button
              class="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
              @click="router.push(`/admin/courses/${item.id}/edit`)"
            >
              <Edit3 class="h-4 w-4" />
            </button>
            <button
              class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
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
