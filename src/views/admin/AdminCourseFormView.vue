<script setup lang="ts">
import { ArrowLeft, ImagePlus, Save, Upload, X } from "lucide-vue-next";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { adminService } from "../../services/admin.service";
import type { AdminProgram } from "../../types/admin";

const route = useRoute();
const router = useRouter();
const id = route.params.id ? Number(route.params.id) : null;
const isEdit = Boolean(id);
const programs = ref<AdminProgram[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const imageFile = ref<File | null>(null);
const imagePreview = ref("");
const form = reactive({
  studyProgramId: "",
  code: "",
  name: "",
  semester: "",
  credits: "",
  image: "",
  isActive: true,
});
const selectImage = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = f;
  if (f) imagePreview.value = URL.createObjectURL(f);
};
const clearImage = () => {
  imageFile.value = null;
  imagePreview.value = form.image || "";
};
const load = async () => {
  loading.value = true;
  try {
    programs.value = await adminService.getPrograms();
    if (id) {
      const d = await adminService.getCourse(id);
      Object.assign(form, {
        studyProgramId: String(d.studyProgramId),
        code: d.code,
        name: d.name,
        semester: d.semester == null ? "" : String(d.semester),
        credits: d.credits == null ? "" : String(d.credits),
        image: d.image || "",
        isActive: d.isActive,
      });
      imagePreview.value = form.image;
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Gagal memuat data.";
  } finally {
    loading.value = false;
  }
};
const save = async () => {
  error.value = "";
  if (!form.studyProgramId || !form.code.trim() || !form.name.trim()) {
    error.value = "Program studi, kode, dan nama wajib diisi.";
    return;
  }
  saving.value = true;
  try {
    const payload = {
      studyProgramId: Number(form.studyProgramId),
      code: form.code.trim(),
      name: form.name.trim(),
      semester: form.semester ? Number(form.semester) : null,
      credits: form.credits ? Number(form.credits) : null,
      image: form.image || null,
      isActive: form.isActive,
    };
    const saved =
      isEdit && id
        ? await adminService.updateCourse(id, payload)
        : await adminService.createCourse(payload);
    let image = form.image || null;
    if (imageFile.value)
      image = (await adminService.uploadImage(imageFile.value)).url;
    if (image !== saved.image)
      await adminService.updateCourse(saved.id, { image });
    router.replace("/admin/courses");
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Gagal menyimpan data.";
  } finally {
    saving.value = false;
  }
};
onMounted(load);
</script>
<template>
  <section class="mx-auto max-w-3xl">
    <button
      type="button"
      class="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500"
      @click="router.push('/admin/courses')"
    >
      <ArrowLeft class="h-4 w-4" /> Kembali
    </button>
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 px-6 py-5">
        <h1 class="text-xl font-bold text-slate-900">
          {{ isEdit ? "Edit Mata Kuliah" : "Tambah Mata Kuliah" }}
        </h1>
      </div>
      <form class="space-y-5 p-6" @submit.prevent="save">
        <div
          v-if="error"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ error }}
        </div>
        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700"
            >Program Studi *</label
          ><select
            v-model="form.studyProgramId"
            class="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
          >
            <option value="">Pilih program studi</option>
            <option
              v-for="item in programs"
              :key="item.id"
              :value="String(item.id)"
            >
              {{ item.name }}
            </option>
          </select>
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"
              >Kode *</label
            ><input
              v-model="form.code"
              class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"
              >Nama Mata Kuliah *</label
            ><input
              v-model="form.name"
              class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
            />
          </div>
        </div>
        <div class="grid gap-5 sm:grid-cols-3">
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"
              >Semester</label
            ><input
              v-model="form.semester"
              type="number"
              min="1"
              class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"
              >SKS</label
            ><input
              v-model="form.credits"
              type="number"
              min="1"
              class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"
              >Gambar</label
            ><label
              class="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-sm text-slate-600"
              ><ImagePlus class="h-4 w-4" />
              {{ imageFile?.name || "Pilih gambar"
              }}<input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="selectImage"
            /></label>
          </div>
        </div>
        <div
          v-if="imagePreview"
          class="relative w-fit overflow-hidden rounded-xl border border-slate-200"
        >
          <img
            :src="imagePreview"
            alt="Preview"
            class="h-40 w-64 object-cover"
          /><button
            v-if="imageFile"
            type="button"
            class="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
            @click="clearImage"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
          ><input v-model="form.isActive" type="checkbox" /><span
            ><span class="block text-sm font-semibold">Mata kuliah aktif</span
            ><span class="text-xs text-slate-500"
              >Tampilkan pada katalog.</span
            ></span
          ></label
        >
        <div class="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            class="rounded-xl border px-4 py-2.5 text-sm"
            @click="router.push('/admin/courses')"
          >
            Batal</button
          ><button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Upload v-if="saving" class="h-4 w-4" /><Save
              v-else
              class="h-4 w-4"
            />
            {{ saving ? "Mengupload..." : "Simpan" }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
