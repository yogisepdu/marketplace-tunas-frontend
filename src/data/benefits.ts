export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export const benefits: Benefit[] = [
  {
    icon: "📚",
    title: "Materi Terstruktur",
    description:
      "Materi disusun berdasarkan program studi dan mata kuliah agar lebih mudah ditemukan.",
  },
  {
    icon: "⚡",
    title: "Akses Digital",
    description:
      "Setelah pembayaran berhasil, akses materi dapat diperoleh secara digital.",
  },
  {
    icon: "🔒",
    title: "Pembayaran Aman",
    description:
      "Pembayaran diproses melalui sistem payment gateway yang terpercaya.",
  },
];
