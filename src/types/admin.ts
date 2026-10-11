export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export interface AdminProgram {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  image: string | null;
  isActive: boolean;
  _count?: { courses?: number };
}

export interface AdminCourse {
  id: number;
  studyProgramId: number;
  code: string;
  name: string;
  semester: number | null;
  credits: number | null;
  image: string | null;
  isActive: boolean;
  studyProgram?: { id: number; name: string; code: string | null; image?: string | null };
  _count?: { products?: number };
}

export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export interface AdminProduct {
  id: number;
  courseId: number;
  title: string;
  slug: string;
  description: string | null;
  price: number | string;
  thumbnail: string | null;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
  course?: AdminCourse;
  _count?: { productFiles?: number; orderItems?: number };
}

export interface AdminProductFile {
  id: number;
  productId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt?: string;
  product?: { id: number; title: string; slug: string };
}

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  whatsapp: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { orders?: number };
}

export interface AdminOrderItem {
  id: number;
  orderId: number;
  productId: number;
  productTitle: string;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
  createdAt?: string;
}

export type OrderStatus = string;
export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  subtotal: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  status: OrderStatus;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  customer?: AdminCustomer;
  items?: AdminOrderItem[];
}
