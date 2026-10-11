<script setup lang="ts">
import { ArrowLeft, CheckCircle2, Clock3, Loader2 } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { catalogService } from "../services/catalog.service";
import { checkoutService } from "../services/checkout.service";
import { loadMidtransSnap } from "../services/midtrans";
import { paymentService } from "../services/payment.service";

import type { CartItem } from "../stores/cart.store";
import { cartStore } from "../stores/cart.store";

const route = useRoute();
const router = useRouter();

/* -------------------------------------------------------------------------- */
/* Checkout source                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Ada 2 jenis checkout:
 *
 * 1. direct
 *    User menekan "Beli Sekarang" dari halaman detail produk.
 *
 * 2. cart
 *    User masuk ke Cart lalu menekan tombol checkout.
 */
const checkoutMode = computed<"direct" | "cart">(() => {
  return route.query.mode === "direct" ? "direct" : "cart";
});

/**
 * Slug produk yang digunakan untuk direct checkout.
 *
 * Contoh:
 * /checkout?mode=direct&product=modul-sistem-informasi
 */
const directProductSlug = computed<string>(() => {
  return String(route.query.product || "");
});

/**
 * Cart tetap menjadi sumber data untuk checkout mode cart.
 */
const cartItems = cartStore.items;

/**
 * Produk yang benar-benar akan dibeli pada halaman checkout.
 *
 * DIRECT:
 *   checkoutItems = 1 produk dari Product Detail
 *
 * CART:
 *   checkoutItems = seluruh produk dari Cart
 */
const checkoutItems = ref<CartItem[]>([]);

/* -------------------------------------------------------------------------- */
/* Checkout totals                                                            */
/* -------------------------------------------------------------------------- */

const totalProductTypes = computed<number>(() => {
  return checkoutItems.value.length;
});

const totalItems = computed<number>(() => {
  return checkoutItems.value.reduce((total, item) => total + item.quantity, 0);
});

const totalPrice = computed<number>(() => {
  return checkoutItems.value.reduce(
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

const hasPendingOrder = computed<boolean>(() => {
  return Boolean(orderNumber.value && checkoutToken.value);
});

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

/**
 * Mengambil daftar product ID dari checkout saat ini.
 */
const getCurrentProductIds = (): number[] => {
  return checkoutItems.value
    .map((item) => Number(item.id))
    .filter((id) => Number.isInteger(id));
};

/**
 * Mengambil daftar product ID dari pending order.
 */
const getPendingProductIds = (pendingOrder: any): number[] => {
  if (!Array.isArray(pendingOrder?.items)) {
    return [];
  }

  return pendingOrder.items
    .map((item: { productId: number | string }) => Number(item.productId))
    .filter((id: number) => Number.isInteger(id));
};

/**
 * Membandingkan daftar produk.
 *
 * Quantity tidak dibandingkan.
 *
 * Artinya:
 *
 * Produk A quantity 1
 * Produk A quantity 2
 *
 * tetap dianggap produk yang sama.
 *
 * Yang dibandingkan hanya product ID.
 */
const isSameProductSet = (
  currentProductIds: number[],
  pendingProductIds: number[],
): boolean => {
  if (currentProductIds.length === 0 || pendingProductIds.length === 0) {
    return false;
  }

  if (currentProductIds.length !== pendingProductIds.length) {
    return false;
  }

  const sortedCurrentIds = [...currentProductIds].sort((a, b) => a - b);

  const sortedPendingIds = [...pendingProductIds].sort((a, b) => a - b);

  return sortedCurrentIds.every(
    (productId, index) => productId === sortedPendingIds[index],
  );
};

/**
 * Mengecek apakah pending order yang tersimpan
 * adalah untuk produk yang sama dengan checkout sekarang.
 *
 * Ini yang menentukan apakah form customer disabled.
 */
const isSamePendingOrder = computed<boolean>(() => {
  if (!hasPendingOrder.value) {
    return false;
  }

  const saved = localStorage.getItem(PENDING_ORDER_STORAGE_KEY);

  if (!saved) {
    return false;
  }

  try {
    const pendingOrder = JSON.parse(saved);

    const currentProductIds = getCurrentProductIds();
    const pendingProductIds = getPendingProductIds(pendingOrder);

    return isSameProductSet(currentProductIds, pendingProductIds);
  } catch (error) {
    console.error("Gagal membaca pending order:", error);

    return false;
  }
});

/**
 * Form customer hanya disabled jika:
 *
 * 1. Sedang submit
 * atau
 * 2. Ada pending order untuk produk yang sama.
 *
 * Jika pending order produknya berbeda,
 * form tetap enabled.
 */
const isCustomerFormDisabled = computed<boolean>(() => {
  return isSubmitting.value || isSamePendingOrder.value;
});

/* -------------------------------------------------------------------------- */
/* Prepare checkout items                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Menyiapkan produk yang akan dibeli.
 *
 * DIRECT:
 *   Ambil satu produk berdasarkan slug dari URL.
 *
 * CART:
 *   Ambil seluruh produk dari cartStore.
 */
const prepareCheckoutItems = async (): Promise<void> => {
  /* ------------------------------------------------------------------------ */
  /* Checkout dari Cart                                                       */
  /* ------------------------------------------------------------------------ */

  if (checkoutMode.value === "cart") {
    checkoutItems.value = cartItems.value.map((item) => ({
      ...item,
    }));

    return;
  }

  /* ------------------------------------------------------------------------ */
  /* Direct checkout                                                          */
  /* ------------------------------------------------------------------------ */

  if (!directProductSlug.value) {
    throw new Error("Produk checkout tidak ditemukan.");
  }

  const directProduct = await catalogService.getProduct(
    directProductSlug.value,
  );

  if (!directProduct) {
    throw new Error("Produk tidak ditemukan.");
  }

  /**
   * Produk direct tidak dimasukkan ke cart.
   *
   * Kita hanya membuat object CartItem sementara
   * untuk kebutuhan tampilan dan proses checkout.
   */
  checkoutItems.value = [
    {
      id: directProduct.id,
      courseId: directProduct.courseId,
      courseCode: null,
      courseName: null,
      title: directProduct.title,
      slug: directProduct.slug,
      description: directProduct.description ?? null,
      price: Number(directProduct.price),
      thumbnail: directProduct.thumbnail ?? null,
      quantity: 1,
    },
  ];
};

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

const goBack = (): void => {
  if (checkoutMode.value === "cart") {
    router.push("/cart");
    return;
  }

  /**
   * Direct checkout:
   * kembali ke halaman detail produk sebelumnya.
   */
  router.back();
};

/* -------------------------------------------------------------------------- */
/* Pending order - save                                                       */
/* -------------------------------------------------------------------------- */

const savePendingOrder = (): void => {
  if (!orderNumber.value || !checkoutToken.value) {
    return;
  }

  const pendingOrder = {
    orderNumber: orderNumber.value,
    checkoutToken: checkoutToken.value,

    /**
     * Simpan mode supaya pending order dari Cart
     * tidak digunakan pada Direct Checkout.
     */
    mode: checkoutMode.value,

    /**
     * Simpan product ID supaya pending order
     * hanya dipulihkan jika produknya sama.
     */
    items: checkoutItems.value.map((item) => ({
      productId: item.id,
      title: item.title,
      quantity: item.quantity,
    })),

    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(PENDING_ORDER_STORAGE_KEY, JSON.stringify(pendingOrder));
};

/* -------------------------------------------------------------------------- */
/* Pending order - clear                                                      */
/* -------------------------------------------------------------------------- */

const clearPendingOrder = (): void => {
  localStorage.removeItem(PENDING_ORDER_STORAGE_KEY);

  orderNumber.value = "";
  checkoutToken.value = "";
};

/* -------------------------------------------------------------------------- */
/* Restore pending order                                                      */
/* -------------------------------------------------------------------------- */

const restorePendingOrder = async (): Promise<void> => {
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

    /* ---------------------------------------------------------------------- */
    /* Validasi mode checkout                                                 */
    /* ---------------------------------------------------------------------- */

    /**
     * Pending order dari direct checkout tidak boleh
     * dipakai pada checkout cart.
     *
     * Begitu juga sebaliknya.
     */
    if (pendingOrder.mode && pendingOrder.mode !== checkoutMode.value) {
      clearPendingOrder();
      return;
    }

    /* ---------------------------------------------------------------------- */
    /* Validasi produk                                                        */
    /* ---------------------------------------------------------------------- */

    const currentProductIds = getCurrentProductIds();

    const pendingProductIds = getPendingProductIds(pendingOrder);

    /**
     * INI BAGIAN PALING PENTING.
     *
     * Pending order hanya boleh dipulihkan
     * jika produk checkout sekarang sama dengan
     * produk yang ada di pending order.
     */
    const sameProduct = isSameProductSet(currentProductIds, pendingProductIds);

    /**
     * Jika produknya berbeda:
     *
     * - jangan restore order lama
     * - jangan restore customer lama
     * - jangan isi orderNumber
     * - jangan isi checkoutToken
     * - hapus pending order lama
     *
     * Setelah ini user akan membuat checkout baru.
     */
    if (!sameProduct) {
      clearPendingOrder();

      paymentStatusMessage.value =
        "Produk checkout berbeda dari pesanan sebelumnya. Silakan melanjutkan checkout baru.";

      return;
    }

    /* ---------------------------------------------------------------------- */
    /* Ambil order dari backend                                                */
    /* ---------------------------------------------------------------------- */

    /**
     * Backend menjadi sumber data utama.
     */
    const savedOrderNumber = String(pendingOrder.orderNumber);

    const savedCheckoutToken = String(pendingOrder.checkoutToken);

    const order = await paymentService.getOrderStatus(
      savedOrderNumber,
      savedCheckoutToken,
    );

    if (!order) {
      clearPendingOrder();
      return;
    }

    /* ---------------------------------------------------------------------- */
    /* Simpan identitas order                                                  */
    /* ---------------------------------------------------------------------- */

    orderNumber.value = savedOrderNumber;
    checkoutToken.value = savedCheckoutToken;

    /* ---------------------------------------------------------------------- */
    /* Customer                                                                */
    /* ---------------------------------------------------------------------- */

    /**
     * Pulihkan data customer dari order database.
     *
     * Karena produknya sudah dipastikan sama,
     * data ini memang boleh digunakan kembali.
     */
    name.value = order.customer?.name ?? "";

    email.value = order.customer?.email ?? "";

    whatsapp.value = order.customer?.whatsapp ?? "";

    /* ---------------------------------------------------------------------- */
    /* Product / Order Items                                                   */
    /* ---------------------------------------------------------------------- */

    /**
     * Order dari backend menjadi sumber kebenaran produk
     * yang benar-benar sudah dipesan.
     *
     * Kita tetap mempertahankan informasi visual dari
     * checkoutItems yang sudah tersedia jika productId-nya sama.
     */
    const existingItems = checkoutItems.value;

    checkoutItems.value = order.items.map((orderItem) => {
      const existingItem = existingItems.find(
        (item) => item.id === Number(orderItem.productId),
      );

      return {
        id: Number(orderItem.productId),

        courseId: existingItem?.courseId ?? 0,

        courseCode: existingItem?.courseCode ?? null,

        courseName: existingItem?.courseName ?? null,

        title: orderItem.productTitle,

        slug: existingItem?.slug ?? "",

        description: existingItem?.description ?? null,

        price: Number(orderItem.unitPrice),

        thumbnail: existingItem?.thumbnail ?? null,

        /**
         * Quantity diambil dari database,
         * bukan dari localStorage/cart.
         */
        quantity: Number(orderItem.quantity),
      };
    });

    /* ---------------------------------------------------------------------- */
    /* Already paid                                                           */
    /* ---------------------------------------------------------------------- */

    if (order.status === "PAID" || order.status === "SETTLEMENT") {
      clearPendingOrder();

      paymentStatusMessage.value = "Pesanan ini sudah berhasil dibayar.";

      return;
    }

    /* ---------------------------------------------------------------------- */
    /* Failed / expired                                                       */
    /* ---------------------------------------------------------------------- */

    if (
      order.status === "CANCELLED" ||
      order.status === "EXPIRED" ||
      order.status === "FAILED"
    ) {
      clearPendingOrder();

      paymentStatusMessage.value =
        "Pesanan sebelumnya sudah tidak dapat dilanjutkan. Silakan membuat checkout baru.";

      return;
    }

    /* ---------------------------------------------------------------------- */
    /* Pending                                                                 */
    /* ---------------------------------------------------------------------- */

    paymentStatusMessage.value =
      `Pesanan ${order.orderNumber} masih menunggu pembayaran. ` +
      "Data pesanan telah dipulihkan dan Anda dapat melanjutkan pembayaran.";
  } catch (error) {
    console.error("Gagal restore pending order:", error);

    clearPendingOrder();

    paymentStatusMessage.value =
      "Pesanan sebelumnya tidak dapat dipulihkan. Silakan membuat checkout baru.";
  }
};

/* -------------------------------------------------------------------------- */
/* Start payment                                                              */
/* -------------------------------------------------------------------------- */

const startPayment = async (): Promise<void> => {
  if (!orderNumber.value || !checkoutToken.value) {
    throw new Error("Informasi pembayaran tidak lengkap.");
  }

  const currentOrder = await paymentService.getOrderStatus(
    orderNumber.value,
    checkoutToken.value,
  );

  /* ------------------------------------------------------------------------ */
  /* Already paid                                                             */
  /* ------------------------------------------------------------------------ */

  if (currentOrder.status === "PAID" || currentOrder.status === "SETTLEMENT") {
    paymentStatusMessage.value = "Pesanan sudah dibayar.";

    clearPendingOrder();

    /**
     * Hanya checkout dari Cart yang boleh
     * mengosongkan Cart.
     */
    if (checkoutMode.value === "cart") {
      cartStore.clearCart();
    }

    return;
  }

  /* ------------------------------------------------------------------------ */
  /* Invalid order status                                                     */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Create Midtrans payment                                                  */
  /* ------------------------------------------------------------------------ */

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
          /**
           * Hanya kosongkan Cart jika user
           * melakukan checkout dari Cart.
           *
           * Direct checkout tidak menyentuh Cart.
           */
          if (checkoutMode.value === "cart") {
            cartStore.clearCart();
          }

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

const submitCheckout = async (): Promise<void> => {
  errorMessage.value = "";
  paymentStatusMessage.value = "";

  /* ------------------------------------------------------------------------ */
  /* Validate products                                                        */
  /* ------------------------------------------------------------------------ */

  if (checkoutItems.value.length === 0) {
    errorMessage.value =
      checkoutMode.value === "direct"
        ? "Produk checkout tidak ditemukan."
        : "Keranjang masih kosong.";

    return;
  }

  /* ------------------------------------------------------------------------ */
  /* Validate customer                                                        */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Validate quantity                                                        */
  /* ------------------------------------------------------------------------ */

  const invalidItem = checkoutItems.value.find(
    (item) => !Number.isInteger(item.quantity) || item.quantity < 1,
  );

  if (invalidItem) {
    errorMessage.value = `Jumlah produk "${invalidItem.title}" tidak valid.`;

    return;
  }

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */

  isSubmitting.value = true;

  try {
    /* ---------------------------------------------------------------------- */
    /* Pending order                                                          */
    /* ---------------------------------------------------------------------- */

    /**
     * Jika orderNumber + checkoutToken tersedia,
     * kita hanya boleh melanjutkan pembayaran
     * jika order tersebut memang untuk produk
     * yang sedang checkout.
     */
    if (orderNumber.value && checkoutToken.value) {
      const saved = localStorage.getItem(PENDING_ORDER_STORAGE_KEY);

      let canReusePendingOrder = false;

      if (saved) {
        try {
          const pendingOrder = JSON.parse(saved);

          const currentProductIds = getCurrentProductIds();

          const pendingProductIds = getPendingProductIds(pendingOrder);

          canReusePendingOrder = isSameProductSet(
            currentProductIds,
            pendingProductIds,
          );
        } catch (error) {
          console.error("Gagal memvalidasi pending order:", error);
        }
      }

      /**
       * Safety check tambahan.
       *
       * Jika ternyata orderNumber/token ada tetapi
       * produknya berbeda, jangan pernah gunakan order lama.
       */
      if (canReusePendingOrder) {
        await startPayment();
        return;
      }

      /**
       * Pending order tidak cocok.
       *
       * Hapus token lama dan lanjut membuat
       * order baru di bawah.
       */
      clearPendingOrder();
    }

    /* ---------------------------------------------------------------------- */
    /* Create new order                                                        */
    /* ---------------------------------------------------------------------- */

    const order = await checkoutService.create({
      name: name.value.trim(),
      email: email.value.trim(),
      whatsapp: whatsapp.value.trim(),

      items: checkoutItems.value.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    });

    orderNumber.value = order.orderNumber;

    checkoutToken.value = order.checkoutToken || "";

    if (!checkoutToken.value) {
      throw new Error("Checkout token tidak diterima dari server.");
    }

    /**
     * Simpan order sebelum membuka Midtrans.
     *
     * Jadi apabila user refresh ketika
     * Midtrans belum selesai, order tetap bisa
     * dipulihkan.
     */
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
  try {
    /**
     * Tentukan dahulu sumber checkout:
     *
     * direct → ambil produk dari API
     * cart   → ambil produk dari cartStore
     */
    await prepareCheckoutItems();

    if (checkoutItems.value.length === 0) {
      errorMessage.value =
        checkoutMode.value === "direct"
          ? "Produk checkout tidak ditemukan."
          : "Keranjang masih kosong.";

      return;
    }

    /**
     * Setelah produk siap, baru cek apakah
     * ada pending order.
     */
    await restorePendingOrder();
  } catch (error) {
    console.error("Gagal menyiapkan checkout:", error);

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Gagal menyiapkan halaman checkout.";
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
          @click="goBack"
        >
          <ArrowLeft
            :size="17"
            :stroke-width="2"
            class="transition-transform duration-200 group-hover:-translate-x-0.5"
          />

          <span>
            {{ checkoutMode === "cart" ? "Kembali ke Keranjang" : "Kembali" }}
          </span>
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
            Menyiapkan checkout...
          </p>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="checkoutItems.length === 0"
        class="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"
        >
          <ArrowLeft :size="28" class="text-slate-400" />
        </div>

        <h2 class="mt-5 text-xl font-bold text-slate-900">
          Produk tidak tersedia
        </h2>

        <p class="mt-2 text-sm leading-6 text-slate-500">
          {{
            errorMessage ||
            "Silakan pilih produk terlebih dahulu sebelum melanjutkan ke checkout."
          }}
        </p>

        <button
          type="button"
          class="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          @click="goBack"
        >
          Kembali
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
                v-for="item in checkoutItems"
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
                <template v-if="isSamePendingOrder">
                  Data pemesan dari pesanan sebelumnya telah dipulihkan karena
                  produk yang dipilih sama. Anda dapat langsung melanjutkan
                  pembayaran.
                </template>

                <template v-else>
                  Pastikan data yang Anda masukkan sudah benar.
                </template>
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
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  :disabled="isCustomerFormDisabled"
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
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  :disabled="isCustomerFormDisabled"
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
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  :disabled="isCustomerFormDisabled"
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
                    isSubmitting
                      ? "Memproses..."
                      : isSamePendingOrder
                        ? "Lanjutkan Pembayaran"
                        : "Lanjutkan ke Pembayaran"
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
                v-for="item in checkoutItems"
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
