import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Paket Soal",
  description: "Halaman pengembang paket soal aplikasi",
};

// Pastikan menggunakan kata kunci 'export default function'
export default function PaketSoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}