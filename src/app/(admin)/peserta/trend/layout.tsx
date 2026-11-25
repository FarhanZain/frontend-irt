import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Trend Ujian Peserta",
  description: "Halaman Trend Ujian Peserta",
};

// Pastikan menggunakan kata kunci 'export default function'
export default function TrendUjianPeserta({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}