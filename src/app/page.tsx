"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const role = getCookie("role");

    // Di sini kita tidak perlu mengecek !token lagi, karena kalau token kosong,
    // middleware sudah otomatis menendang user ke /login sebelum menyentuh file ini.
    if (role === "admin") {
      router.push("/user"); 
    } else if (role === "pengembang soal") {
      router.push("/pengembang/paket-soal");
    } else {
      router.push("/paket-soal");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-boxdark">
      <p className="text-black dark:text-white">Memuat halaman dashboard Anda...</p>
    </div>
  );
}