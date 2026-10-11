<script setup lang="ts">
import {
  ArrowLeft,
  FileUp,
  ImagePlus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-vue-next";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { adminService } from "../../services/admin.service";
import type {
  AdminCourse,
  AdminProduct,
  AdminProductFile,
  ProductStatus,
} from "../../types/admin";

const route = useRoute();
const router = useRouter();

const id = route.params.id ? Number(route.params.id) : null;
const isEdit = Boolean(id);

const courses = ref<AdminCourse[]>([]);
const files = ref<AdminProductFile[]>([]);
const materialFiles = ref<File[]>([]);
const imageFile = ref<File | null>(null);
const imagePreview = ref("");

const loading = ref(false);
const saving = ref(false);
const error = ref("");

const form = reactive<{
  courseId: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  thumbnail: string;
  status: ProductStatus;
}>({
  courseId: "",
  title: "",
  slug: "",
  description: "",
  price: "",
  thumbnail: "",
  status: "DRAFT",
});

const makeSlug = (): string => {
  return form.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const selectImage = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;

  imageFile.value = file;

  if (file) {
    imagePreview.value = URL.createObjectURL(file);
  }
};

const selectMaterials = (event: Event): void => {
  const input = event.target as HTMLInputElement;

  materialFiles.value = Array.from(input.files ?? []);
};

const formatSize = (size: number | null): string => {
  if (!size) {
    return "-";
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const load = async (): Promise<void> => {
  loading.value = true;
  error.value = "";

  try {
    courses.value = await adminService.getCourses();

    if (id) {
      const product = await adminService.getProduct(id);

      Object.assign(form, {
        courseId: String(product.courseId),
        title: product.title,
        slug: product.slug,
        description: product.description || "",
        price: String(product.price ?? ""),
        thumbnail: product.thumbnail || "",
        status: product.status as ProductStatus,
      });

      imagePreview.value = form.thumbnail;

      files.value = await adminService.getProductFiles(id);
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Gagal memuat data produk.";
  } finally {
    loading.value = false;
  }
};

const save = async (): Promise<void> => {
  error.value = "";

  if (!form.courseId || !form.title.trim() || !form.slug.trim()) {
    error.value = "Mata kuliah, judul, dan slug wajib diisi.";
    return;
  }

  saving.value = true;

  try {
    const payload: Partial<AdminProduct> = {
      courseId: Number(form.courseId),
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      price: Number(form.price || 0),
      thumbnail: form.thumbnail || null,
      status: form.status,
    };

    const saved =
      isEdit && id
        ? await adminService.updateProduct(id, payload)
        : await adminService.createProduct(payload);

    let thumbnail = form.thumbnail || null;

    /*
     * Upload thumbnail jika admin memilih file baru.
     */
    if (imageFile.value) {
      const uploaded = await adminService.uploadImage(imageFile.value);

      thumbnail = uploaded.url;
    }

    /*
     * Simpan URL thumbnail ke produk.
     */
    if (thumbnail !== saved.thumbnail) {
      await adminService.updateProduct(saved.id, {
        thumbnail,
      });
    }

    /*
     * Upload semua file materi.
     */
    for (const file of materialFiles.value) {
      await adminService.uploadProductFile(saved.id, file);
    }

    router.replace("/admin/products");
  } catch (e: any) {
    error.value =
      e?.response?.data?.message ||
      "Gagal menyimpan produk atau mengupload file.";
  } finally {
    saving.value = false;
  }
};

const removeFile = async (file: AdminProductFile): Promise<void> => {
  if (!confirm(`Hapus materi ${file.fileName}?`)) {
    return;
  }

  try {
    await adminService.deleteProductFile(file.id);

    files.value = files.value.filter((item) => item.id !== file.id);
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Gagal menghapus materi.";
  }
};

onMounted(load);
</script>

<template>
  <section class="mx-auto max-w-4xl">
    <!-- Back -->
    <button
      type="button"
      class="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500"
      @click="router.push('/admin/products')"
    >
      <ArrowLeft class="h-4 w-4" />
      Kembali
    </button>

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <!-- Header -->
      <div class="border-b border-slate-200 px-6 py-5">
        <h1 class="text-xl font-bold text-slate-900">
          {{ isEdit ? "Edit Materi / Produk" : "Tambah Materi / Produk" }}
        </h1>

        <p class="mt-1 text-sm text-slate-500">
          Produk digital dapat memiliki thumbnail dan beberapa file materi.
        </p>
      </div>

      <form class="space-y-5 p-6" @submit.prevent="save">
        <!-- Error -->
        <div
          v-if="error"
          class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ error }}
        </div>

        <!-- Mata Kuliah -->
        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700">
            Mata Kuliah *
          </label>

          <select
            v-model="form.courseId"
            class="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
          >
            <option value="">Pilih mata kuliah</option>

            <option
              v-for="item in courses"
              :key="item.id"
              :value="String(item.id)"
            >
              {{ item.code }} — {{ item.name }}
            </option>
          </select>
        </div>

        <!-- Judul & Slug -->
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-semibold"> Judul * </label>

            <input
              v-model="form.title"
              @blur="!form.slug && (form.slug = makeSlug())"
              class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
              placeholder="Modul Analisis Sistem"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold"> Slug * </label>

            <input
              v-model="form.slug"
              class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
              placeholder="modul-analisis-sistem"
            />
          </div>
        </div>

        <!-- Harga & Status -->
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-semibold"> Harga (Rp) </label>

            <input
              v-model="form.price"
              type="number"
              min="0"
              class="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm"
              placeholder="50000"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold"> Status </label>

            <select
              v-model="form.status"
              class="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
            >
              <option value="DRAFT">Draft</option>

              <option value="ACTIVE">Aktif</option>

              <option value="INACTIVE">Nonaktif</option>
            </select>
          </div>
        </div>

        <!-- Thumbnail -->
        <div>
          <label class="mb-2 block text-sm font-semibold">
            Thumbnail Produk
          </label>

          <label
            class="flex h-12 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 text-sm text-slate-600"
          >
            <ImagePlus class="h-5 w-5" />

            {{ imageFile?.name || "Pilih JPG / PNG / WEBP" }}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="selectImage"
            />
          </label>

          <!-- Preview -->
          <div
            v-if="imagePreview"
            class="relative mt-3 w-fit overflow-hidden rounded-xl border"
          >
            <img
              :src="imagePreview"
              alt="Thumbnail"
              class="h-44 w-72 object-cover"
            />

            <button
              v-if="imageFile"
              type="button"
              class="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
              @click="
                imageFile = null;
                imagePreview = form.thumbnail;
              "
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- File Materi -->
        <div>
          <label class="mb-2 block text-sm font-semibold"> File Materi </label>

          <label
            class="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 text-sm text-slate-500 hover:bg-slate-50"
          >
            <FileUp class="mb-2 h-7 w-7" />

            <span> Pilih satu atau beberapa file materi </span>

            <span class="mt-1 text-xs">
              PDF, Word, PowerPoint, Excel, ZIP/RAR — maksimal 50 MB/file
            </span>

            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              class="hidden"
              @change="selectMaterials"
            />
          </label>

          <!-- File yang akan diupload -->
          <div v-if="materialFiles.length" class="mt-3 space-y-2">
            <div
              v-for="file in materialFiles"
              :key="file.name + file.size"
              class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
            >
              <span class="truncate">
                {{ file.name }}
              </span>

              <span class="ml-3 shrink-0 text-xs text-slate-500">
                {{ formatSize(file.size) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Materi Tersimpan -->
        <div v-if="isEdit" class="rounded-xl border border-slate-200 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-semibold text-slate-800">Materi tersimpan</h2>

            <span class="text-xs text-slate-500">
              {{ files.length }} file
            </span>
          </div>

          <div v-if="!files.length" class="text-sm text-slate-500">
            Belum ada materi.
          </div>

          <div
            v-for="file in files"
            :key="file.id"
            class="flex items-center justify-between border-t border-slate-100 py-3 text-sm"
          >
            <div class="min-w-0">
              <div class="truncate font-medium">
                {{ file.fileName }}
              </div>

              <div class="text-xs text-slate-500">
                {{ formatSize(file.fileSize) }}
                ·
                {{ file.mimeType || "file" }}
              </div>
            </div>

            <button
              type="button"
              class="ml-3 rounded-lg p-2 text-red-500 hover:bg-red-50"
              @click="removeFile(file)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Deskripsi -->
        <div>
          <label class="mb-2 block text-sm font-semibold"> Deskripsi </label>

          <textarea
            v-model="form.description"
            rows="6"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Masukkan deskripsi produk..."
          ></textarea>
        </div>

        <!-- Action -->
        <div class="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            @click="router.push('/admin/products')"
          >
            Batal
          </button>

          <button
            type="submit"
            :disabled="loading || saving"
            class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Upload v-if="saving" class="h-4 w-4 animate-pulse" />

            <Save v-else class="h-4 w-4" />

            {{ saving ? "Menyimpan & mengupload..." : "Simpan" }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
