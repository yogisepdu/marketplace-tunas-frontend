import api from "./api";

import type {
  CatalogResponse,
  Course,
  Product,
  StudyProgram,
} from "../types/catalog";

export const catalogService = {
  /**
   * Mengambil semua program studi aktif.
   *
   * Backend diharapkan hanya mengembalikan
   * program studi dengan isActive = true.
   */
  async getPrograms(): Promise<StudyProgram[]> {
    const response =
      await api.get<CatalogResponse<StudyProgram[]>>("/catalog/programs");

    return response.data.data;
  },

  /**
   * Mengambil detail program studi berdasarkan ID.
   */
  async getProgram(id: number): Promise<StudyProgram> {
    const response = await api.get<CatalogResponse<StudyProgram>>(
      `/catalog/programs/${id}`,
    );

    return response.data.data;
  },

  /**
   * Mengambil daftar mata kuliah.
   *
   * Filter:
   * - programId
   * - semester
   * - search
   */
  async getCourses(params?: {
    programId?: number;
    semester?: number;
    search?: string;
  }): Promise<Course[]> {
    const response = await api.get<CatalogResponse<Course[]>>(
      "/catalog/courses",
      {
        params,
      },
    );

    return response.data.data;
  },

  /**
   * Mengambil detail mata kuliah berdasarkan ID.
   */
  async getCourse(id: number): Promise<Course> {
    const response = await api.get<CatalogResponse<Course>>(
      `/catalog/courses/${id}`,
    );

    return response.data.data;
  },

  /**
   * Mengambil daftar materi/produk.
   *
   * Filter:
   * - courseId
   * - search
   *
   * Backend diharapkan hanya mengembalikan
   * produk dengan status ACTIVE untuk customer.
   */
  async getProducts(params?: {
    courseId?: number;
    search?: string;
  }): Promise<Product[]> {
    const response = await api.get<CatalogResponse<Product[]>>(
      "/catalog/products",
      {
        params,
      },
    );

    return response.data.data;
  },

  /**
   * Mengambil detail materi/produk berdasarkan slug.
   */
  async getProduct(slug: string): Promise<Product> {
    const response = await api.get<CatalogResponse<Product>>(
      `/catalog/products/${encodeURIComponent(slug)}`,
    );

    return response.data.data;
  },
};
