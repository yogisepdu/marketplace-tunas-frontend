<script setup lang="ts">
import { ArrowLeft, CheckCircle2, Clock3, Loader2 } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { catalogService } from "../services/catalog.service";
import { checkoutService } from "../services/checkout.service";
import type { Product } from "../types/catalog";

import { loadMidtransSnap } from "../services/midtrans";
import { paymentService } from "../services/payment.service";

const route = useRoute();
const router = useRouter();

/*
|--------------------------------------------------------------------------
| Product
|--------------------------------------------------------------------------
*/

const product = ref<Product | null>(null);
const productSlug = String(route.query.product || "");

const isLoadingProduct = ref(true);

/*
|--------------------------------------------------------------------------
| Buyer
|--------------------------------------------------------------------------
*/

const name = ref("");
const email = ref("");
const whatsapp = ref("");

const quantity = ref(1);

/*
|--------------------------------------------------------------------------
| Checkout
|--------------------------------------------------------------------------
*/

const isSubmitting = ref(false);
const errorMessage = ref("");

/*
|--------------------------------------------------------------------------
| Order
|--------------------------------------------------------------------------
*/

const orderNumber = ref("");

const isExistingOrder = ref(false);
const isCheckingExistingOrder = ref(true);

const isPaid = ref(false);

/*
|--------------------------------------------------------------------------
| Payment
|--------------------------------------------------------------------------
*/

const paymentError = ref("");
const isPaymentLoading = ref(false);

/*
|--------------------------------------------------------------------------
| Local Storage Key
|--------------------------------------------------------------------------
*/

const PENDING_ORDER_STORAGE_KEY = "marketplace_pending_order";

/*
|--------------------------------------------------------------------------
| Format Price
|--------------------------------------------------------------------------
*/

const formatPrice = (price: number | string) => {
  const value = Number(price);

  if (!Number.isFinite(value) || value <= 0) {
    return "Gratis";
  }

  return `Rp ${value.toLocaleString("id-ID")}`;
};

/*
|--------------------------------------------------------------------------
| Total Price
|--------------------------------------------------------------------------
*/

const totalPrice = computed(() => {
  if (!product.value) {
    return 0;
  }

  return Number(product.value.price) * quantity.value;
});

/*
|--------------------------------------------------------------------------
| Save Pending Order
|--------------------------------------------------------------------------
*/

const savePendingOrder = () => {
  if (!orderNumber.value || !product.value) {
    return;
  }

  const pendingOrder = {
    orderNumber: orderNumber.value,
    productSlug: product.value.slug,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(pendingOrder));
};

/*
|--------------------------------------------------------------------------
| Clear Pending Order
|--------------------------------------------------------------------------
*/

const clearPendingOrder = () => {
  localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
};

/*
|--------------------------------------------------------------------------
| Load Product
|--------------------------------------------------------------------------
*/

const loadProduct = async () => {
  if (!productSlug) {
    errorMessage.value = "Produk tidak ditemukan.";
    isLoadingProduct.value = false;
    return;
  }

  isLoadingProduct.value = true;
  errorMessage.value = "";

  try {
    product.value = await catalogService.getProduct(productSlug);
  } catch (error) {
    console.error("Gagal mengambil produk:", error);

    errorMessage.value = "Produk gagal dimuat. Silakan kembali dan coba lagi.";
  } finally {
    isLoadingProduct.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Restore Pending Order
|--------------------------------------------------------------------------
|
| Fungsi ini dijalankan setiap kali halaman checkout
| dibuka kembali.
|
*/

const restorePendingOrder = async () => {
  isCheckingExistingOrder.value = true;

  try {
    const saved = localStorage.getItem(PENDING_ORDER_STORAGE_KEY);

    if (!saved) {
      return;
    }

    let pendingOrder: {
      orderNumber?: string;
      productSlug?: string;
      savedAt?: string;
    };

    try {
      pendingOrder = JSON.parse(saved);
    } catch (error) {
      console.error("Data pending order tidak valid:", error);

      clearPendingOrder();
      return;
    }

    if (!pendingOrder.orderNumber) {
      clearPendingOrder();
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Jangan mengambil pending order milik produk lain
    |--------------------------------------------------------------------------
    */

    if (
      product.value &&
      pendingOrder.productSlug &&
      pendingOrder.productSlug !== product.value.slug
    ) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Ambil status terbaru dari backend
    |--------------------------------------------------------------------------
    */

    const order = await paymentService.getOrderStatus(pendingOrder.orderNumber);

    /*
    |--------------------------------------------------------------------------
    | Order sudah PAID
    |--------------------------------------------------------------------------
    */

    if (order.status === "PAID") {
      orderNumber.value = order.orderNumber;
      isPaid.value = true;
      isExistingOrder.value = false;

      clearPendingOrder();

      /*
      | Isi data customer agar informasi tetap tampil
      */

      if (order.customer) {
        name.value = order.customer.name || "";
        email.value = order.customer.email || "";
        whatsapp.value = order.customer.whatsapp || "";
      }

      if (order.items?.length) {
        quantity.value = order.items[0].quantity || 1;
      }

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Order masih PENDING
    |--------------------------------------------------------------------------
    */

    if (order.status === "PENDING") {
      orderNumber.value = order.orderNumber;
      isExistingOrder.value = true;
      isPaid.value = false;

      /*
      | Pulihkan data pembeli
      */

      if (order.customer) {
        name.value = order.customer.name || "";
        email.value = order.customer.email || "";
        whatsapp.value = order.customer.whatsapp || "";
      }

      /*
      | Pulihkan quantity
      */

      if (order.items?.length) {
        quantity.value = order.items[0].quantity || 1;
      }

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Status lain
    |--------------------------------------------------------------------------
    |
    | Misalnya:
    | CANCELLED
    | EXPIRED
    | FAILED
    |
    */

    clearPendingOrder();
    orderNumber.value = "";
    isExistingOrder.value = false;
    isPaid.value = false;
  } catch (error) {
    console.error("Gagal memulihkan pending order:", error);

    /*
    | Jangan membuat user terjebak dengan
    | localStorage yang sudah tidak valid.
    */

    clearPendingOrder();
    orderNumber.value = "";
    isExistingOrder.value = false;
    isPaid.value = false;
  } finally {
    isCheckingExistingOrder.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Wait For Payment Confirmation
|--------------------------------------------------------------------------
|
| Setelah Midtrans memberi callback onSuccess,
| kita TIDAK langsung menganggap order PAID.
|
| Kita tunggu webhook Midtrans masuk ke backend,
| kemudian cek status order beberapa kali.
|
*/

const waitForPaymentConfirmation = async () => {
  if (!orderNumber.value) {
    return false;
  }

  /*
  | Maksimal 10 kali pengecekan.
  | Interval 2 detik.
  | Total sekitar 20 detik.
  */

  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const order = await paymentService.getOrderStatus(orderNumber.value);

      console.log(`Pengecekan status pembayaran ${attempt}/10:`, order.status);

      /*
      |--------------------------------------------------------------------------
      | PAID
      |--------------------------------------------------------------------------
      */

      if (order.status === "PAID") {
        isPaid.value = true;
        isExistingOrder.value = false;

        clearPendingOrder();

        return true;
      }

      /*
      |--------------------------------------------------------------------------
      | Jika masih PENDING
      |--------------------------------------------------------------------------
      */

      if (order.status === "PENDING") {
        /*
        | Tunggu sebelum pengecekan berikutnya.
        */
        if (attempt < 10) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | Status lain
      |--------------------------------------------------------------------------
      */

      clearPendingOrder();
      isExistingOrder.value = false;

      return false;
    } catch (error) {
      console.error(`Gagal mengecek status pembayaran (${attempt}/10):`, error);

      if (attempt < 10) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  return false;
};

/*
|--------------------------------------------------------------------------
| Start Payment
|--------------------------------------------------------------------------
*/

const startPayment = async () => {
  if (!orderNumber.value) {
    return;
  }

  paymentError.value = "";
  isPaymentLoading.value = true;

  try {
    /*
    |--------------------------------------------------------------------------
    | Cek status order TERLEBIH DAHULU
    |--------------------------------------------------------------------------
    */

    const order = await paymentService.getOrderStatus(orderNumber.value);

    /*
    |--------------------------------------------------------------------------
    | Sudah dibayar
    |--------------------------------------------------------------------------
    */

    if (order.status === "PAID") {
      isPaid.value = true;
      isExistingOrder.value = false;

      clearPendingOrder();

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Order bukan PENDING
    |--------------------------------------------------------------------------
    */

    if (order.status !== "PENDING") {
      clearPendingOrder();

      orderNumber.value = "";
      isExistingOrder.value = false;

      paymentError.value =
        "Pesanan ini sudah tidak dapat dilanjutkan pembayarannya.";

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Buat / ambil Snap Token
    |--------------------------------------------------------------------------
    */

    const payment = await paymentService.createSnapPayment(orderNumber.value);

    /*
    |--------------------------------------------------------------------------
    | Load Midtrans Snap
    |--------------------------------------------------------------------------
    */

    await loadMidtransSnap();

    if (!window.snap) {
      throw new Error("Midtrans Snap belum tersedia.");
    }

    /*
    |--------------------------------------------------------------------------
    | Buka Midtrans
    |--------------------------------------------------------------------------
    */

    window.snap.pay(payment.snapToken, {
      /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        |
        | Jangan langsung menganggap PAID.
        | Tunggu webhook backend.
        |
        */

      onSuccess: async (result) => {
        console.log("MIDTRANS SUCCESS:", result);

        paymentError.value = "";
        isPaymentLoading.value = true;

        try {
          const confirmed = await waitForPaymentConfirmation();

          if (!confirmed) {
            paymentError.value =
              "Pembayaran sedang diproses. Silakan tunggu beberapa saat lalu periksa kembali status pesanan Anda.";
          }
        } finally {
          isPaymentLoading.value = false;
        }
      },

      /*
        |--------------------------------------------------------------------------
        | PENDING
        |--------------------------------------------------------------------------
        */

      onPending: (result) => {
        console.log("MIDTRANS PENDING:", result);

        paymentError.value =
          "Pembayaran belum selesai. Anda dapat melanjutkan pembayaran dari halaman ini.";
      },

      /*
        |--------------------------------------------------------------------------
        | ERROR
        |--------------------------------------------------------------------------
        */

      onError: (result) => {
        console.error("MIDTRANS ERROR:", result);

        paymentError.value = "Pembayaran gagal. Silakan coba lagi.";
      },

      /*
        |--------------------------------------------------------------------------
        | CLOSE
        |--------------------------------------------------------------------------
        |
        | JANGAN menghapus localStorage.
        | Order tetap PENDING dan dapat dilanjutkan.
        |
        */

      onClose: () => {
        console.log("Customer menutup pembayaran Midtrans.");

        /*
          | Order sengaja tetap disimpan.
          */
        savePendingOrder();
      },
    });
  } catch (error: any) {
    console.error("Gagal membuat pembayaran:", error);

    paymentError.value =
      error?.response?.data?.message ||
      error?.message ||
      "Gagal membuat sesi pembayaran.";
  } finally {
    isPaymentLoading.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Submit Checkout
|--------------------------------------------------------------------------
*/

const submitCheckout = async () => {
  /*
  | Kalau sudah ada order, jangan membuat order baru.
  */

  if (isExistingOrder.value) {
    return;
  }

  if (isPaid.value) {
    return;
  }

  if (!product.value) {
    return;
  }

  errorMessage.value = "";

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  if (!name.value.trim()) {
    errorMessage.value = "Nama wajib diisi.";

    return;
  }

  if (!email.value.trim()) {
    errorMessage.value = "Email wajib diisi.";

    return;
  }

  if (!whatsapp.value.trim()) {
    errorMessage.value = "Nomor WhatsApp wajib diisi.";

    return;
  }

  if (quantity.value < 1) {
    errorMessage.value = "Jumlah produk minimal 1.";

    return;
  }

  isSubmitting.value = true;

  try {
    /*
    |--------------------------------------------------------------------------
    | Create Order
    |--------------------------------------------------------------------------
    */

    const order = await checkoutService.create({
      productId: product.value.id,
      quantity: quantity.value,
      name: name.value.trim(),
      email: email.value.trim(),
      whatsapp: whatsapp.value.trim(),
    });

    console.log("ORDER BERHASIL DIBUAT:", order);

    /*
    |--------------------------------------------------------------------------
    | Simpan order
    |--------------------------------------------------------------------------
    */

    orderNumber.value = order.orderNumber;

    isExistingOrder.value = false;
    isPaid.value = false;

    /*
    |--------------------------------------------------------------------------
    | Simpan ke localStorage
    |--------------------------------------------------------------------------
    */

    savePendingOrder();
  } catch (error: any) {
    console.error("Checkout gagal:", error);

    errorMessage.value =
      error?.response?.data?.message || "Checkout gagal. Silakan coba lagi.";
  } finally {
    isSubmitting.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Back To Product
|--------------------------------------------------------------------------
*/

const backToProduct = () => {
  if (!product.value) {
    router.push("/");
    return;
  }

  router.push({
    name: "product-detail",
    params: {
      slug: product.value.slug,
    },
  });
};

/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  /*
  | Hanya load product SATU KALI.
  */

  await loadProduct();

  /*
  | Setelah product tersedia,
  | baru cek pending order.
  */

  if (product.value) {
    await restorePendingOrder();
  } else {
    isCheckingExistingOrder.value = false;
  }
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-8">
    <div class="mx-auto max-w-5xl">
      <!-- ========================================================= -->
      <!-- Loading Product -->
      <!-- ========================================================= -->

      <div
        v-if="isLoadingProduct"
        class="rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <div class="flex flex-col items-center justify-center gap-3">
          <Loader2 :size="28" class="animate-spin text-indigo-600" />

          <p class="text-slate-500">Memuat informasi produk...</p>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- Product Error -->
      <!-- ========================================================= -->

      <div
        v-else-if="errorMessage && !product"
        class="rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <p class="mb-4 text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="button"
          class="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          @click="router.push('/')"
        >
          Kembali ke Beranda
        </button>
      </div>

      <!-- ========================================================= -->
      <!-- Checking Existing Order -->
      <!-- ========================================================= -->

      <div
        v-else-if="isCheckingExistingOrder"
        class="rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <div class="flex flex-col items-center justify-center gap-3">
          <Loader2 :size="28" class="animate-spin text-indigo-600" />

          <p class="text-slate-500">Memeriksa pesanan sebelumnya...</p>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- Payment Already PAID -->
      <!-- ========================================================= -->

      <div
        v-else-if="isPaid"
        class="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <div
          class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
        >
          <CheckCircle2 :size="36" :stroke-width="2" />
        </div>

        <h1 class="text-2xl font-bold text-slate-900">Pembayaran Berhasil</h1>

        <p class="mt-3 text-slate-600">Pesanan Anda telah berhasil dibayar.</p>

        <div class="mt-5 rounded-xl bg-slate-100 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
            Nomor Order
          </p>

          <p class="mt-1 font-mono font-semibold text-slate-900">
            {{ orderNumber }}
          </p>
        </div>

        <div
          class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left"
        >
          <p class="text-sm leading-6 text-emerald-800">
            Akses produk akan dikirimkan ke email yang digunakan saat checkout
            setelah proses pembayaran berhasil diproses.
          </p>
        </div>

        <button
          type="button"
          class="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800"
          @click="backToProduct"
        >
          Kembali ke Produk
        </button>
      </div>

      <!-- ========================================================= -->
      <!-- Existing PENDING Order -->
      <!-- ========================================================= -->

      <div
        v-else-if="isExistingOrder"
        class="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm"
      >
        <div class="text-center">
          <div
            class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600"
          >
            <Clock3 :size="34" :stroke-width="2" />
          </div>

          <h1 class="text-2xl font-bold text-slate-900">
            Pesanan Belum Dibayar
          </h1>

          <p class="mt-3 leading-6 text-slate-600">
            Kami menemukan pesanan yang sebelumnya belum selesai dibayar.
          </p>
        </div>

        <div class="mt-6 rounded-xl bg-slate-50 p-5">
          <div class="flex items-center justify-between gap-4">
            <span class="text-sm text-slate-500"> Nomor Order </span>

            <span class="font-mono text-sm font-semibold text-slate-900">
              {{ orderNumber }}
            </span>
          </div>

          <div
            v-if="product"
            class="mt-3 flex items-start justify-between gap-4 border-t border-slate-200 pt-3"
          >
            <span class="text-sm text-slate-500"> Produk </span>

            <span class="text-right text-sm font-semibold text-slate-900">
              {{ product.title }}
            </span>
          </div>

          <div
            v-if="product"
            class="mt-3 flex items-center justify-between gap-4 border-t border-slate-200 pt-3"
          >
            <span class="text-sm text-slate-500"> Total </span>

            <span class="text-lg font-bold text-indigo-600">
              {{ formatPrice(totalPrice) }}
            </span>
          </div>
        </div>

        <div
          class="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
        >
          Pesanan ini tetap tersimpan. Anda dapat melanjutkan pembayaran tanpa
          membuat order baru.
        </div>

        <button
          type="button"
          :disabled="isPaymentLoading"
          class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          @click="startPayment"
        >
          <Loader2 v-if="isPaymentLoading" :size="18" class="animate-spin" />

          {{
            isPaymentLoading
              ? "Menyiapkan Pembayaran..."
              : "Lanjutkan Pembayaran"
          }}
        </button>

        <div
          v-if="paymentError"
          class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
        >
          {{ paymentError }}
        </div>

        <button
          type="button"
          class="mt-4 w-full text-sm font-semibold text-slate-500 transition hover:text-slate-700"
          @click="backToProduct"
        >
          Kembali ke Produk
        </button>
      </div>

      <!-- ========================================================= -->
      <!-- Newly Created Order -->
      <!-- ========================================================= -->

      <div
        v-else-if="orderNumber"
        class="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <div
          class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
        >
          <Clock3 :size="34" :stroke-width="2" />
        </div>

        <h1 class="text-2xl font-bold text-slate-900">Order Berhasil Dibuat</h1>

        <p class="mt-3 text-slate-600">
          Silakan lanjutkan pembayaran untuk menyelesaikan pesanan Anda.
        </p>

        <div class="mt-5 rounded-xl bg-slate-100 px-4 py-3">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
            Nomor Order
          </p>

          <p class="mt-1 font-mono font-semibold text-slate-900">
            {{ orderNumber }}
          </p>
        </div>

        <button
          type="button"
          :disabled="isPaymentLoading"
          class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          @click="startPayment"
        >
          <Loader2 v-if="isPaymentLoading" :size="18" class="animate-spin" />

          {{ isPaymentLoading ? "Menyiapkan Pembayaran..." : "Bayar Sekarang" }}
        </button>

        <div
          v-if="paymentError"
          class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
        >
          {{ paymentError }}
        </div>

        <p class="mt-4 text-xs leading-5 text-slate-400">
          Pesanan Anda tetap tersimpan apabila Anda menutup halaman pembayaran.
        </p>
      </div>

      <!-- ========================================================= -->
      <!-- Checkout -->
      <!-- ========================================================= -->

      <div v-else-if="product" class="grid gap-6 lg:grid-cols-2">
        <!-- ======================================================= -->
        <!-- Product -->
        <!-- ======================================================= -->

        <section class="rounded-2xl bg-white p-6 shadow-sm">
          <button
            type="button"
            class="group mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600"
            @click="backToProduct"
          >
            <ArrowLeft
              :size="17"
              :stroke-width="2"
              class="transition-transform duration-200 group-hover:-translate-x-0.5"
            />

            <span> Kembali ke Produk </span>
          </button>

          <p
            class="text-sm font-semibold uppercase tracking-wide text-indigo-600"
          >
            Checkout
          </p>

          <h1 class="mt-2 text-2xl font-bold text-slate-900">
            {{ product.title }}
          </h1>

          <p v-if="product.description" class="mt-3 leading-7 text-slate-600">
            {{ product.description }}
          </p>

          <!-- Product Price -->
          <div class="mt-6 rounded-xl bg-slate-50 p-4">
            <div class="flex items-center justify-between">
              <span class="text-slate-500"> Harga </span>

              <span class="font-semibold text-slate-900">
                {{ formatPrice(product.price) }}
              </span>
            </div>

            <!-- Quantity -->
            <div class="mt-3 flex items-center justify-between">
              <span class="text-slate-500"> Jumlah </span>

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="quantity <= 1"
                  @click="quantity--"
                >
                  −
                </button>

                <span class="min-w-6 text-center font-semibold">
                  {{ quantity }}
                </span>

                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 transition hover:bg-slate-100"
                  @click="quantity++"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Total -->
            <div class="mt-4 border-t border-slate-200 pt-4">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-900"> Total </span>

                <span class="text-xl font-bold text-indigo-600">
                  {{ formatPrice(totalPrice) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- ======================================================= -->
        <!-- Buyer Form -->
        <!-- ======================================================= -->

        <section class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold text-slate-900">Data Pembeli</h2>

          <p class="mt-2 text-sm leading-6 text-slate-500">
            Data ini digunakan untuk membuat order dan mengirimkan informasi
            akses produk setelah pembayaran berhasil.
          </p>

          <!-- Error -->
          <div
            v-if="errorMessage"
            class="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
          >
            {{ errorMessage }}
          </div>

          <form class="mt-6 space-y-5" @submit.prevent="submitCheckout">
            <!-- Name -->
            <div>
              <label
                for="name"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Nama Lengkap
                <span class="text-red-500">*</span>
              </label>

              <input
                id="name"
                v-model="name"
                type="text"
                autocomplete="name"
                placeholder="Masukkan nama lengkap"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <!-- Email -->
            <div>
              <label
                for="email"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
                <span class="text-red-500">*</span>
              </label>

              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="contoh@email.com"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <!-- WhatsApp -->
            <div>
              <label
                for="whatsapp"
                class="mb-2 block text-sm font-medium text-slate-700"
              >
                Nomor WhatsApp
                <span class="text-red-500">*</span>
              </label>

              <input
                id="whatsapp"
                v-model="whatsapp"
                type="tel"
                autocomplete="tel"
                placeholder="081234567890"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />

              {{
                isSubmitting ? "Membuat Order..." : "Lanjutkan ke Pembayaran"
              }}
            </button>

            <p class="text-center text-xs leading-5 text-slate-400">
              Setelah order dibuat, Anda akan diarahkan ke halaman pembayaran
              Midtrans.
            </p>
          </form>
        </section>
      </div>
    </div>
  </main>
</template>
