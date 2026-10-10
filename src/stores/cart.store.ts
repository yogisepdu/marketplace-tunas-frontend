import { computed, ref } from "vue";
import type { Product } from "../types/catalog";

export interface CartItem {
  id: number;

  // Course
  courseId: number;
  courseCode?: string | null;
  courseName?: string | null;

  // Product
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  thumbnail?: string | null;

  // Cart
  quantity: number;
}

const STORAGE_KEY = "marketplace_cart";

/**
 * Membaca data keranjang dari localStorage.
 */
const loadCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const value = item as Record<string, unknown>;

      return (
        typeof value.id === "number" &&
        typeof value.courseId === "number" &&
        typeof value.title === "string" &&
        typeof value.slug === "string" &&
        typeof value.price === "number" &&
        typeof value.quantity === "number"
      );
    });
  } catch (error) {
    console.error("Gagal membaca keranjang dari localStorage:", error);

    return [];
  }
};

/**
 * State keranjang.
 */
const items = ref<CartItem[]>(loadCartFromStorage());

/**
 * Simpan keranjang ke localStorage.
 */
const saveCart = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
  } catch (error) {
    console.error("Gagal menyimpan keranjang:", error);
  }
};

/**
 * Tambahkan produk ke keranjang.
 *
 * courseCode dan courseName dikirim dari CourseDetailView.
 */
const addItem = (
  product: Product,
  course?: {
    id?: number;
    code?: string | null;
    name?: string | null;
  },
): void => {
  const existingItem = items.value.find((item) => item.id === product.id);

  /**
   * Jika produk sudah ada:
   * jangan membuat item baru.
   */
  if (existingItem) {
    existingItem.quantity += 1;

    saveCart();

    return;
  }

  /**
   * Buat item baru.
   */
  items.value.push({
    id: product.id,

    courseId: course?.id ?? product.courseId,

    courseCode: course?.code ?? null,

    courseName: course?.name ?? null,

    title: product.title,
    slug: product.slug,
    description: product.description ?? null,
    price: Number(product.price),
    thumbnail: product.thumbnail ?? null,
    quantity: 1,
  });

  saveCart();
};

/**
 * Alias addToCart.
 */
const addToCart = (
  product: Product,
  course?: {
    id?: number;
    code?: string | null;
    name?: string | null;
  },
): void => {
  addItem(product, course);
};

/**
 * Cek apakah produk sudah berada di keranjang.
 */
const isInCart = (productId: number): boolean => {
  return items.value.some((item) => item.id === productId);
};

/**
 * Ambil item tertentu.
 */
const getItem = (productId: number): CartItem | undefined => {
  return items.value.find((item) => item.id === productId);
};

/**
 * Hapus item.
 */
const removeItem = (productId: number): void => {
  items.value = items.value.filter((item) => item.id !== productId);

  saveCart();
};

/**
 * Tambah quantity.
 */
const increaseQuantity = (productId: number): void => {
  const item = items.value.find((item) => item.id === productId);

  if (!item) {
    return;
  }

  item.quantity += 1;

  saveCart();
};

/**
 * Kurangi quantity.
 */
const decreaseQuantity = (productId: number): void => {
  const item = items.value.find((item) => item.id === productId);

  if (!item) {
    return;
  }

  if (item.quantity <= 1) {
    removeItem(productId);
    return;
  }

  item.quantity -= 1;

  saveCart();
};

/**
 * Kosongkan keranjang.
 */
const clearCart = (): void => {
  items.value = [];

  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Load ulang keranjang.
 */
const loadCart = (): void => {
  items.value = loadCartFromStorage();
};

/**
 * Total quantity.
 */
const totalItems = computed<number>(() => {
  return items.value.reduce((total, item) => total + item.quantity, 0);
});

/**
 * Subtotal.
 */
const subtotal = computed<number>(() => {
  return items.value.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );
});

/**
 * Status kosong.
 */
const isEmpty = computed<boolean>(() => {
  return items.value.length === 0;
});

/**
 * Export store.
 */
export const cartStore = {
  items,
  totalItems,
  subtotal,
  isEmpty,

  addItem,
  addToCart,

  isInCart,
  getItem,

  removeItem,
  increaseQuantity,
  decreaseQuantity,

  clearCart,
  loadCart,
};
