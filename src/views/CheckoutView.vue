<script setup lang="ts">
import { ArrowLeft, CheckCircle2, Clock3, Loader2 } from "lucide-vue-next";

import { computed, onMounted, ref } from "vue";

import { useRouter } from "vue-router";

import { checkoutService } from "../services/checkout.service";
import { loadMidtransSnap } from "../services/midtrans";
import { paymentService } from "../services/payment.service";

import { cartStore } from "../stores/cart.store";

const router = useRouter();

/* -------------------------------------------------------------------------- */
/* Cart                                                                       */
/* -------------------------------------------------------------------------- */

const items = cartStore.items;

const totalProductTypes = computed(() => {
  return items.value.length;
});

const totalItems = computed(() => {
  return items.value.reduce((total, item) => total + item.quantity, 0);
});

const totalPrice = computed(() => {
  return items.value.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );
});

/* -------------------------------------------------------------------------- */
/* Customer                                                                   */
/* -------------------------------------------------------------------------- */

const name = ref("");
const email = ref("");
const whatsapp = ref("");

/* -------------------------------------------------------------------------- */
/* Loading / status                                                           */
/* -------------------------------------------------------------------------- */

const isSubmitting = ref(false);
const isCheckingExistingOrder = ref(true);

const errorMessage = ref("");
const paymentStatusMessage = ref("");

const showPaymentContainer = ref(false);

/* -------------------------------------------------------------------------- */
/* Pending order                                                              */
/* -------------------------------------------------------------------------- */

const PENDING_ORDER_STORAGE_KEY = "marketplace_pending_order";

const orderNumber = ref("");
const checkoutToken = ref("");

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatPrice = (value: number | string): string => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Rp0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const savePendingOrder = () => {
  if (!orderNumber.value || !checkoutToken.value) {
    return;
  }

  const pendingOrder = {
    orderNumber: orderNumber.value,
    checkoutToken: checkoutToken.value,

    items: items.value.map((item) => ({
      productId: item.id,
      title: item.title,
      quantity: item.quantity,
    })),

    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(pendingOrder));
};

const clearPendingOrder = () => {
  localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);

  orderNumber.value = "";
  checkoutToken.value = "";
};

/* -------------------------------------------------------------------------- */
/* Restore pending order                                                      */
/* -------------------------------------------------------------------------- */

const restorePendingOrder = async () => {
  const saved = localStorage.getItem(PENDING_ORDER_STORAGE_KEY);

  if (!saved) {
    return;
  }

  try {
    const pendingOrder = JSON.parse(saved);

    if (!pendingOrder?.orderNumber || !pendingOrder?.checkoutToken) {
      clearPendingOrder();
      return;
    }

    orderNumber.value = String(pendingOrder.orderNumber);

    checkoutToken.value = String(pendingOrder.checkoutToken);

    const order = await paymentService.getOrderStatus(
      orderNumber.value,
      checkoutToken.value,
    );

    if (!order) {
      clearPendingOrder();
      return;
    }

    if (order.status === "PAID" || order.status === "SETTLEMENT") {
      clearPendingOrder();

      paymentStatusMessage.value = "Pesanan ini sudah berhasil dibayar.";

      return;
    }

    if (
      order.status === "CANCELLED" ||
      order.status === "EXPIRED" ||
      order.status === "FAILED"
    ) {
      clearPendingOrder();

      return;
    }

    paymentStatusMessage.value =
      "Anda memiliki pesanan yang masih menunggu pembayaran.";
  } catch (error) {
    console.error("Gagal memulihkan pending order:", error);

    clearPendingOrder();
  }
};

/* -------------------------------------------------------------------------- */
/* Start payment                                                              */
/* -------------------------------------------------------------------------- */

const startPayment = async () => {
  if (!orderNumber.value || !checkoutToken.value) {
    throw new Error("Informasi pembayaran tidak lengkap.");
  }

  const currentOrder = await paymentService.getOrderStatus(
    orderNumber.value,
    checkoutToken.value,
  );

  if (currentOrder.status === "PAID" || currentOrder.status === "SETTLEMENT") {
    paymentStatusMessage.value = "Pesanan sudah dibayar.";

    clearPendingOrder();

    return;
  }

  if (
    currentOrder.status === "CANCELLED" ||
    currentOrder.status === "EXPIRED" ||
    currentOrder.status === "FAILED"
  ) {
    clearPendingOrder();

    throw new Error(
      "Pesanan sudah tidak dapat dibayar. Silakan buat checkout baru.",
    );
  }

  const payment = await paymentService.createSnapPayment(
    orderNumber.value,
    checkoutToken.value,
  );

  if (!payment?.snapToken) {
    throw new Error("Token pembayaran Midtrans tidak tersedia.");
  }

  await loadMidtransSnap();

  if (!window.snap) {
    throw new Error("Midtrans Snap belum berhasil dimuat.");
  }

  showPaymentContainer.value = true;

  window.snap.pay(payment.snapToken, {
    onSuccess: async () => {
      paymentStatusMessage.value =
        "Pembayaran berhasil. Menunggu konfirmasi server...";

      try {
        const latest = await paymentService.getOrderStatus(
          orderNumber.value,
          checkoutToken.value,
        );

        if (latest.status === "PAID" || latest.status === "SETTLEMENT") {
          cartStore.clearCart();

          clearPendingOrder();

          paymentStatusMessage.value = "Pembayaran berhasil dikonfirmasi.";

          router.push("/orders");
        }
      } catch (error) {
        console.error("Gagal mengecek status pembayaran:", error);
      }
    },

    onPending: () => {
      paymentStatusMessage.value = "Pembayaran masih menunggu penyelesaian.";
    },

    onError: () => {
      paymentStatusMessage.value = "Pembayaran gagal diproses.";
    },

    onClose: () => {
      paymentStatusMessage.value =
        "Halaman pembayaran ditutup. Pesanan tetap tersimpan.";
    },
  });
};

/* -------------------------------------------------------------------------- */
/* Submit checkout                                                            */
/* -------------------------------------------------------------------------- */

const submitCheckout = async () => {
  errorMessage.value = "";

  paymentStatusMessage.value = "";

  if (items.value.length === 0) {
    errorMessage.value = "Keranjang masih kosong.";

    return;
  }

  if (!name.value.trim()) {
    errorMessage.value = "Nama lengkap wajib diisi.";

    return;
  }

  if (!email.value.trim()) {
    errorMessage.value = "Email wajib diisi.";

    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.value.trim())) {
    errorMessage.value = "Format email tidak valid.";

    return;
  }

  const invalidItem = items.value.find(
    (item) => !Number.isInteger(item.quantity) || item.quantity < 1,
  );

  if (invalidItem) {
    errorMessage.value = `Jumlah produk "${invalidItem.title}" tidak valid.`;

    return;
  }

  isSubmitting.value = true;

  try {
    const order = await checkoutService.create({
      name: name.value.trim(),
      email: email.value.trim(),
      whatsapp: whatsapp.value.trim(),

      items: items.value.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    });

    orderNumber.value = order.orderNumber;

    checkoutToken.value = order.checkoutToken || "";

    if (!checkoutToken.value) {
      throw new Error("Checkout token tidak diterima dari server.");
    }

    savePendingOrder();

    await startPayment();
  } catch (error: any) {
    console.error("Gagal membuat pembayaran:", error);

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      "Checkout gagal diproses. Silakan coba lagi.";
  } finally {
    isSubmitting.value = false;
  }
};

/* -------------------------------------------------------------------------- */
/* Mounted                                                                    */
/* -------------------------------------------------------------------------- */

onMounted(async () => {
  if (items.value.length === 0) {
    isCheckingExistingOrder.value = false;

    return;
  }

  try {
    await restorePendingOrder();
  } finally {
    isCheckingExistingOrder.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="border-b border-slate-200 bg-white">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
      >
        <div>
          <p
            class="text-sm font-semibold uppercase tracking-wide text-indigo-600"
          >
            Marketplace
          </p>

          <h1 class="text-xl font-bold text-slate-900">Checkout</h1>
        </div>

        <button
          type="button"
          class="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
          @click="router.push('/cart')"
        >
          <ArrowLeft
            :size="17"
            :stroke-width="2"
            class="transition-transform duration-200 group-hover:-translate-x-0.5"
          />

          <span>Kembali ke Keranjang</span>
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading -->
      <div
        v-if="isCheckingExistingOrder"
        class="flex min-h-[400px] items-center justify-center"
      >
        <div class="text-center">
          <Loader2 :size="36" class="mx-auto animate-spin text-indigo-600" />

          <p class="mt-4 text-sm font-medium text-slate-600">
            Memeriksa pesanan sebelumnya...
          </p>
        </div>
      </div>

      <!-- Empty cart -->
      <div
        v-else-if="items.length === 0"
        class="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"
        >
          <ArrowLeft :size="28" class="text-slate-400" />
        </div>

        <h2 class="mt-5 text-xl font-bold text-slate-900">
          Keranjang masih kosong
        </h2>

        <p class="mt-2 text-sm leading-6 text-slate-500">
          Silakan pilih produk terlebih dahulu sebelum melanjutkan ke checkout.
        </p>

        <button
          type="button"
          class="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          @click="router.push('/cart')"
        >
          Kembali ke Keranjang
        </button>
      </div>

      <!-- Checkout -->
      <div v-else class="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <!-- LEFT -->
        <div class="space-y-6">
          <!-- Product list -->
          <section class="rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <p
                class="text-sm font-semibold uppercase tracking-wide text-indigo-600"
              >
                Pesanan
              </p>

              <h2 class="mt-1 text-2xl font-bold text-slate-900">
                Produk yang Dibeli
              </h2>

              <p class="mt-2 text-sm text-slate-500">
                {{ totalProductTypes }} jenis produk · {{ totalItems }} item
              </p>
            </div>

            <div class="mt-6 space-y-4">
              <article
                v-for="item in items"
                :key="item.id"
                class="rounded-xl border border-slate-200 p-4"
              >
                <div class="flex gap-4">
                  <!-- Thumbnail -->
                  <div
                    class="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100"
                  >
                    <img
                      v-if="item.thumbnail"
                      :src="item.thumbnail"
                      :alt="item.title"
                      class="h-full w-full object-cover"
                    />

                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center text-xs text-slate-400"
                    >
                      No Image
                    </div>
                  </div>

                  <!-- Product information -->
                  <div class="min-w-0 flex-1">
                    <p
                      v-if="item.courseCode"
                      class="text-xs font-bold uppercase tracking-wide text-indigo-600"
                    >
                      {{ item.courseCode }}
                    </p>

                    <p
                      v-if="item.courseName"
                      class="mt-1 text-sm font-semibold text-slate-700"
                    >
                      {{ item.courseName }}
                    </p>

                    <h3 class="mt-1 font-semibold text-slate-900">
                      {{ item.title }}
                    </h3>

                    <div
                      class="mt-3 flex flex-wrap items-center justify-between gap-3"
                    >
                      <p class="text-sm text-slate-500">
                        {{ item.quantity }} ×
                        {{ formatPrice(item.price) }}
                      </p>

                      <p class="font-semibold text-slate-900">
                        {{ formatPrice(Number(item.price) * item.quantity) }}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <!-- Total -->
            <div class="mt-6 border-t border-slate-200 pt-5">
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-600">
                  Total Pembayaran
                </span>

                <span class="text-xl font-bold text-indigo-600">
                  {{ formatPrice(totalPrice) }}
                </span>
              </div>
            </div>
          </section>

          <!-- Customer form -->
          <section class="rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <p
                class="text-sm font-semibold uppercase tracking-wide text-indigo-600"
              >
                Data Pemesan
              </p>

              <h2 class="mt-1 text-xl font-bold text-slate-900">
                Informasi Pelanggan
              </h2>

              <p class="mt-2 text-sm text-slate-500">
                Pastikan data yang Anda masukkan sudah benar.
              </p>
            </div>

            <form class="mt-6 space-y-5" @submit.prevent="submitCheckout">
              <!-- Name -->
              <div>
                <label
                  for="name"
                  class="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nama Lengkap
                </label>

                <input
                  id="name"
                  v-model="name"
                  type="text"
                  autocomplete="name"
                  placeholder="Masukkan nama lengkap"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  :disabled="isSubmitting"
                />
              </div>

              <!-- Email -->
              <div>
                <label
                  for="email"
                  class="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="contoh@email.com"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  :disabled="isSubmitting"
                />
              </div>

              <!-- WhatsApp -->
              <div>
                <label
                  for="whatsapp"
                  class="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nomor WhatsApp
                </label>

                <input
                  id="whatsapp"
                  v-model="whatsapp"
                  type="tel"
                  autocomplete="tel"
                  placeholder="08xxxxxxxxxx"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  :disabled="isSubmitting"
                />
              </div>

              <!-- Error -->
              <div
                v-if="errorMessage"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {{ errorMessage }}
              </div>

              <!-- Payment status -->
              <div
                v-if="paymentStatusMessage"
                class="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700"
              >
                {{ paymentStatusMessage }}
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting || isCheckingExistingOrder"
              >
                <Loader2 v-if="isSubmitting" :size="18" class="animate-spin" />

                <span>
                  {{
                    isSubmitting ? "Memproses..." : "Lanjutkan ke Pembayaran"
                  }}
                </span>
              </button>
            </form>
          </section>
        </div>

        <!-- RIGHT -->
        <aside class="h-fit lg:sticky lg:top-6">
          <section class="rounded-2xl bg-white p-6 shadow-sm">
            <p
              class="text-sm font-semibold uppercase tracking-wide text-indigo-600"
            >
              Ringkasan
            </p>

            <h2 class="mt-1 text-xl font-bold text-slate-900">
              Ringkasan Pesanan
            </h2>

            <div class="mt-6 space-y-4">
              <div
                v-for="item in items"
                :key="`summary-${item.id}`"
                class="flex items-start justify-between gap-4"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-slate-700">
                    {{ item.title }}
                  </p>

                  <p class="mt-1 text-xs text-slate-500">
                    {{ item.quantity }} ×
                    {{ formatPrice(item.price) }}
                  </p>
                </div>

                <p class="shrink-0 text-sm font-semibold text-slate-900">
                  {{ formatPrice(Number(item.price) * item.quantity) }}
                </p>
              </div>
            </div>

            <div class="mt-6 border-t border-slate-200 pt-5">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-500"> Subtotal </span>

                <span class="text-sm font-semibold text-slate-900">
                  {{ formatPrice(totalPrice) }}
                </span>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <span class="text-sm text-slate-500"> Diskon </span>

                <span class="text-sm font-semibold text-slate-900"> Rp0 </span>
              </div>

              <div
                class="mt-4 flex items-center justify-between border-t border-slate-200 pt-4"
              >
                <span class="font-semibold text-slate-900"> Total </span>

                <span class="text-xl font-bold text-indigo-600">
                  {{ formatPrice(totalPrice) }}
                </span>
              </div>
            </div>

            <div class="mt-6 rounded-xl bg-slate-50 p-4">
              <div class="flex items-start gap-3">
                <Clock3 :size="18" class="mt-0.5 shrink-0 text-slate-500" />

                <div>
                  <p class="text-sm font-semibold text-slate-700">
                    Pembayaran aman
                  </p>

                  <p class="mt-1 text-xs leading-5 text-slate-500">
                    Anda akan diarahkan ke halaman pembayaran Midtrans setelah
                    checkout berhasil dibuat.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>

    <!-- Midtrans payment modal/container -->
    <div
      v-if="showPaymentContainer"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-sm font-semibold uppercase tracking-wide text-indigo-600"
            >
              Pembayaran
            </p>

            <h2 class="mt-1 text-xl font-bold text-slate-900">
              Menunggu Pembayaran
            </h2>
          </div>

          <button
            type="button"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            @click="showPaymentContainer = false"
          >
            ×
          </button>
        </div>

        <div class="mt-6 rounded-xl bg-slate-50 p-5 text-center">
          <CheckCircle2 :size="42" class="mx-auto text-indigo-600" />

          <p class="mt-4 text-sm leading-6 text-slate-600">
            Silakan selesaikan pembayaran pada halaman Midtrans.
          </p>

          <p v-if="orderNumber" class="mt-3 text-xs text-slate-400">
            Order:
            <span class="font-semibold text-slate-600">
              {{ orderNumber }}
            </span>
          </p>
        </div>

        <button
          type="button"
          class="mt-6 w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="showPaymentContainer = false"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>
