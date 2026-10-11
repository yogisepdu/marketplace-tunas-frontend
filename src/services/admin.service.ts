import type {
  AdminCourse,
  AdminCustomer,
  AdminOrder,
  AdminProduct,
  AdminProgram,
  AdminProductFile,
  ApiResponse,
} from "../types/admin";
import api from "./api";

export const ADMIN_API = {
  studyPrograms: "/admin/study-programs",
  courses: "/admin/courses",
  products: "/admin/products",
  productFiles: "/admin/product-files",
  customers: "/admin/customers",
  orders: "/admin/orders",
  uploads: "/admin/uploads",
};

export const adminService = {
  async getPrograms(params?: Record<string, unknown>) {
    const res = await api.get<ApiResponse<AdminProgram[]>>(ADMIN_API.studyPrograms, { params });
    return res.data.data;
  },
  async getProgram(id: number) {
    const res = await api.get<ApiResponse<AdminProgram>>(`${ADMIN_API.studyPrograms}/${id}`);
    return res.data.data;
  },
  async createProgram(payload: Partial<AdminProgram>) {
    const res = await api.post<ApiResponse<AdminProgram>>(ADMIN_API.studyPrograms, payload);
    return res.data.data;
  },
  async updateProgram(id: number, payload: Partial<AdminProgram>) {
    const res = await api.patch<ApiResponse<AdminProgram>>(`${ADMIN_API.studyPrograms}/${id}`, payload);
    return res.data.data;
  },
  async deleteProgram(id: number) {
    return api.delete(`${ADMIN_API.studyPrograms}/${id}`);
  },

  async getCourses(params?: Record<string, unknown>) {
    const res = await api.get<ApiResponse<AdminCourse[]>>(ADMIN_API.courses, { params });
    return res.data.data;
  },
  async getCourse(id: number) {
    const res = await api.get<ApiResponse<AdminCourse>>(`${ADMIN_API.courses}/${id}`);
    return res.data.data;
  },
  async createCourse(payload: Partial<AdminCourse>) {
    const res = await api.post<ApiResponse<AdminCourse>>(ADMIN_API.courses, payload);
    return res.data.data;
  },
  async updateCourse(id: number, payload: Partial<AdminCourse>) {
    const res = await api.patch<ApiResponse<AdminCourse>>(`${ADMIN_API.courses}/${id}`, payload);
    return res.data.data;
  },
  async deleteCourse(id: number) {
    return api.delete(`${ADMIN_API.courses}/${id}`);
  },

  async getProducts(params?: Record<string, unknown>) {
    const res = await api.get<ApiResponse<AdminProduct[]>>(ADMIN_API.products, { params });
    return res.data.data;
  },
  async getProduct(id: number) {
    const res = await api.get<ApiResponse<AdminProduct>>(`${ADMIN_API.products}/${id}`);
    return res.data.data;
  },
  async createProduct(payload: Partial<AdminProduct>) {
    const res = await api.post<ApiResponse<AdminProduct>>(ADMIN_API.products, payload);
    return res.data.data;
  },
  async updateProduct(id: number, payload: Partial<AdminProduct>) {
    const res = await api.patch<ApiResponse<AdminProduct>>(`${ADMIN_API.products}/${id}`, payload);
    return res.data.data;
  },
  async deleteProduct(id: number) {
    return api.delete(`${ADMIN_API.products}/${id}`);
  },

  async uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<ApiResponse<{ filename: string; path: string; url: string }>>(
      `${ADMIN_API.uploads}/image`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },

  async uploadProductFile(productId: number, file: File) {
    const form = new FormData();
    form.append("productId", String(productId));
    form.append("file", file);
    const res = await api.post<ApiResponse<AdminProductFile>>(
      `${ADMIN_API.productFiles}/upload`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },

  async getProductFiles(productId: number) {
    const res = await api.get<ApiResponse<AdminProductFile[]>>(
      `${ADMIN_API.productFiles}/product/${productId}`,
    );
    return res.data.data;
  },
  async deleteProductFile(id: number) {
    return api.delete(`${ADMIN_API.productFiles}/${id}`);
  },

  async getOrders(params?: Record<string, unknown>) {
    const res = await api.get<ApiResponse<AdminOrder[]>>(ADMIN_API.orders, { params });
    return res.data.data;
  },
  async getCustomers(params?: Record<string, unknown>) {
    const res = await api.get<ApiResponse<AdminCustomer[]>>(ADMIN_API.customers, { params });
    return res.data.data;
  },
};
