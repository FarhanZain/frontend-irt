import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Paket Soal",
  description: "Halaman paket soal peserta",
};

// Pastikan menggunakan kata kunci 'export default function'
export default function PaketSoalPeserta({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}