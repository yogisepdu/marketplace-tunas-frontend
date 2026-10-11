<script setup lang="ts">
import { ArrowLeft, ImagePlus, Save, Upload, X } from "lucide-vue-next";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { adminService } from "../../services/admin.service";

const route = useRoute();
const router = useRouter();
const id = route.params.id ? Number(route.params.id) : null;
const isEdit = Boolean(id);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const imageFile = ref<File | null>(null);
const imagePreview = ref("");

const form = reactive({
  name: "",
  code: "",
  description: "",
  image: "",
  isActive: true,
});

const selectImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = file;
  if (file) imagePreview.value = URL.createObjectURL(file);
};
const clearImage = () => {
  imageFile.value = null;
  imagePreview.value = form.image || "";
};

const load = async () => {
  if (!id) return;
  loading.value = true;
  try {
    const data = await adminService.getProgram(id);
    Object.assign(form, {
      name: data.name || "",
      code: data.code || "",
      description: data.description || "",
      image: data.image || "",
      isActive: data.isActive,
    });
    imagePreview.value = form.image;
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Gagal memuat data.";
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  error.value = "";
  if (!form.name.trim()) {
    error.value = "Nama program wajib diisi.";
    return;
  }
  saving.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || null,
      description: form.description.trim() || null,
      image: form.image || null,
      isActive: form.isActive,
    };
    const saved =
      isEdit && id
        ? await adminService.updateProgram(id, payload)
        : await adminService.createProgram(payload);
    let image = form.image || null;
    if (imageFile.value)
      image = (await adminService.uploadImage(imageFile.value)).url;
    if (image !== saved.image)
      await adminService.updateProgram(saved.id, { image });
    router.replace("/admin/programs");
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
      class="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      @click="router.push('/admin/programs')"
    >
      <ArrowLeft class="h-4 w-4" /> Kembali
    </button>
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 px-6 py-5">
        <h1 class="text-xl font-bold text-slate-900">
          {{ isEdit ? "Edit Program Studi" : "Tambah Program Studi" }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Lengkapi informasi program studi.
        </p>
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
            >Nama Program *</label
          ><input
            v-model="form.name"
            :disabled="loading || saving"
            class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500"
            placeholder="S1 Sistem Informasi"
          />
        </div>
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"
              >Kode</label
            ><input
              v-model="form.code"
              :disabled="loading || saving"
              class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500"
              placeholder="SI"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"
              >Gambar</label
            ><label
              class="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
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
        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700"
            >Deskripsi</label
          ><textarea
            v-model="form.description"
            :disabled="loading || saving"
            rows="5"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <label
          class="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
          ><input
            v-model="form.isActive"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-indigo-600"
          /><span
            ><span class="block text-sm font-semibold text-slate-700"
              >Program aktif</span
            ><span class="text-xs text-slate-500"
              >Tampilkan program pada katalog.</span
            ></span
          ></label
        >
        <div class="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
            @click="router.push('/admin/programs')"
          >
            Batal</button
          ><button
            type="submit"
            :disabled="loading || saving"
            class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Upload v-if="saving" class="h-4 w-4 animate-pulse" /><Save
              v-else
              class="h-4 w-4"
            />
            {{ saving ? "Mengupload & menyimpan..." : "Simpan" }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
