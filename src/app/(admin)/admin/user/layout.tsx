import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Akun User",
  description: "Halaman admin akun user aplikasi",
};

// Pastikan menggunakan kata kunci 'export default function'
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}