export interface CatalogResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface StudyProgram {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  image: string | null;
  isActive: boolean;

  courses?: Course[];
}

export interface Course {
  id: number;
  studyProgramId: number;
  code: string;
  name: string;
  semester: number | null;
  credits: number | null;
  image: string | null;
  isActive: boolean;

  studyProgram?: StudyProgram;
  products?: Product[];
}

export interface Product {
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
}

export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
