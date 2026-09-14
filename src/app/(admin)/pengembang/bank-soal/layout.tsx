import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Bank Soal",
  description: "Halaman pengembang bank soal aplikasi",
};

// Pastikan menggunakan kata kunci 'export default function'
export default function BankSoalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}