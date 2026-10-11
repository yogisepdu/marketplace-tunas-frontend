<script setup lang="ts">
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import api from "../../services/api";

import logoUT from "../../assets/logo.png";

const router = useRouter();

const email = ref("");
const password = ref("");

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const isFormValid = computed(() => {
  return email.value.trim() !== "" && password.value !== "";
});

const handleLogin = async () => {
  errorMessage.value = "";

  if (!email.value.trim() || !password.value) {
    errorMessage.value = "Email dan password wajib diisi.";
    return;
  }

  try {
    isLoading.value = true;

    const response = await api.post("/auth/admin/login", {
      email: email.value.trim(),
      password: password.value,
    });

    const data = response.data?.data;

    if (!data?.accessToken || !data?.admin) {
      throw new Error("Response login tidak valid.");
    }

    /*
     * Simpan token
     */
    localStorage.setItem("admin_access_token", data.accessToken);

    /*
     * Simpan informasi admin
     */
    localStorage.setItem("admin_user", JSON.stringify(data.admin));

    /*
     * Arahkan ke dashboard
     */
    await router.replace("/admin");
  } catch (error: any) {
    console.error("Admin login error:", error);

    const message =
      error?.response?.data?.message || "Email atau password salah.";

    errorMessage.value = Array.isArray(message) ? message.join(", ") : message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="grid min-h-screen lg:grid-cols-2">
      <!-- Branding -->
      <section class="relative hidden overflow-hidden bg-slate-950 lg:flex">
        <div
          class="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"
        />

        <div
          class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
        />

        <div
          class="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-white/20"
            >
              <img
                :src="logoUT"
                alt="Logo Universitas Terbuka"
                class="h-full w-full object-contain p-1.5"
              />
            </div>

            <div>
              <p class="text-lg font-bold leading-tight text-white">
                Marketplace Tunas
              </p>

              <p class="mt-0.5 text-xs font-medium text-slate-400">
                Admin Panel
              </p>
            </div>
          </div>

          <div class="max-w-lg">
            <p
              class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400"
            >
              Administrator
            </p>

            <h1
              class="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl"
            >
              Kelola Marketplace
              <span class="text-indigo-400"> Tunas </span>
              dengan mudah.
            </h1>

            <p class="mt-6 max-w-md text-base leading-7 text-slate-400">
              Kelola program studi, mata kuliah, materi, pesanan, pelanggan, dan
              aktivitas marketplace melalui dashboard administrator.
            </p>
          </div>

          <p class="text-xs text-slate-500">
            © {{ new Date().getFullYear() }} Marketplace Tunas. Admin Dashboard.
          </p>
        </div>
      </section>

      <!-- Login -->
      <section
        class="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8"
      >
        <div class="w-full max-w-md">
          <!-- Mobile branding -->
          <div class="mb-10 text-center lg:hidden">
            <div
              class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600"
            >
              <ShieldCheck class="h-6 w-6 text-white" />
            </div>

            <h1 class="text-xl font-bold">Marketplace Tunas</h1>

            <p class="mt-1 text-sm text-slate-500">Admin Panel</p>
          </div>

          <!-- Heading -->
          <div class="mb-8">
            <p class="mb-2 text-sm font-semibold text-indigo-600">
              Selamat datang kembali
            </p>

            <h2 class="text-3xl font-bold tracking-tight text-slate-900">
              Login Admin
            </h2>

            <p class="mt-2 text-sm leading-6 text-slate-500">
              Masuk menggunakan akun administrator Anda untuk melanjutkan ke
              dashboard.
            </p>
          </div>

          <!-- Error -->
          <div
            v-if="errorMessage"
            class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          >
            <p class="text-sm font-medium text-red-700">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-5" @submit.prevent="handleLogin">
            <!-- Email -->
            <div>
              <label
                for="email"
                class="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <div class="relative">
                <Mail
                  class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="admin@example.com"
                  class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label
                for="password"
                class="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div class="relative">
                <LockKeyhole
                  class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Masukkan password"
                  class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

                <button
                  type="button"
                  class="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="h-5 w-5" />

                  <Eye v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              class="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span v-if="isLoading"> Memproses... </span>

              <template v-else>
                <span>Masuk ke Dashboard</span>

                <ArrowRight
                  class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
              </template>
            </button>
          </form>

          <!-- Security -->
          <div
            class="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <ShieldCheck class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div>
              <p class="text-xs font-semibold text-slate-700">
                Akses khusus administrator
              </p>

              <p class="mt-1 text-xs leading-5 text-slate-500">
                Halaman ini hanya dapat digunakan oleh akun administrator yang
                memiliki akses ke dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<style scoped>
/* Sembunyikan tombol reveal password bawaan browser */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

/* Chromium / Edge */
input[type="password"]::-webkit-credentials-auto-fill-button,
input[type="password"]::-webkit-password-reveal-button {
  display: none !important;
  appearance: none;
}
</style>
