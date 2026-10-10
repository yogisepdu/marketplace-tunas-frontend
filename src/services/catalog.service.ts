import api from "./api";

import type {
  CatalogResponse,
  Course,
  Product,
  StudyProgram,
} from "../types/catalog";

export const catalogService = {
  async getPrograms(): Promise<StudyProgram[]> {
    const response =
      await api.get<CatalogResponse<StudyProgram[]>>("/catalog/programs");

    return response.data.data;
  },

  async getProgram(id: number): Promise<StudyProgram> {
    const response = await api.get<CatalogResponse<StudyProgram>>(
      `/catalog/programs/${id}`,
    );

    return response.data.data;
  },

  async getCourses(params?: { programId?: number }): Promise<Course[]> {
    const response = await api.get<CatalogResponse<Course[]>>(
      "/catalog/courses",
      {
        params,
      },
    );

    return response.data.data;
  },

  async getCourse(id: number): Promise<Course> {
    const response = await api.get<CatalogResponse<Course>>(
      `/catalog/courses/${id}`,
    );

    return response.data.data;
  },

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

  async getProduct(slug: string): Promise<Product> {
    const response = await api.get<CatalogResponse<Product>>(
      `/catalog/products/${slug}`,
    );

    return response.data.data;
  },
};
