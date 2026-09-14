import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Detail Paket Soal",
  description: "Halaman detail paket soal aplikasi",
};

// Pastikan menggunakan kata kunci 'export default function'
export default function DetailPaketSoalPeserta({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}