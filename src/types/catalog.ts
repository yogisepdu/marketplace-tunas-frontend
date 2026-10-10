export interface StudyProgram {
  id: number;
  name: string;
  code: string;
  slug?: string;
  description?: string | null;
  thumbnail?: string | null;
}

export interface Product {
  id: number;
  courseId: number;
  title: string;
  slug: string;
  description?: string | null;
  price: number | string;
  thumbnail?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: number;
  studyProgramId: number;
  code: string;
  name: string;
  slug?: string;
  description?: string | null;

  studyProgram?: StudyProgram;

  products?: Product[];
}

export interface CatalogResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
