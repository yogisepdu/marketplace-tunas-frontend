export interface Program {
  code: string;
  title: string;
  description: string;
  icon: string;
}

export const programs: Program[] = [
  {
    code: "SI",
    title: "S1 Sistem Informasi",
    description: "Materi belajar untuk mahasiswa Sistem Informasi.",
    icon: "💻",
  },
  {
    code: "MNJ",
    title: "S1 Manajemen",
    description: "Materi kuliah dan latihan belajar.",
    icon: "📊",
  },
  {
    code: "AKT",
    title: "S1 Akuntansi",
    description: "Ringkasan materi dan latihan soal.",
    icon: "📚",
  },
];
