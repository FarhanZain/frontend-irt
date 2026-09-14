import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Registrasi Peserta",
  description: "Halaman register peserta aplikasi",
};

// Pastikan menggunakan kata kunci 'export default function'
export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}