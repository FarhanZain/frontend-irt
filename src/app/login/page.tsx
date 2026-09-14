"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

export default function LoginPage() {
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login Gagal");
      }

      // Simpan token dan info user di localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 2. Simpan di Cookie agar dibaca oleh Middleware Next.js (Masa aktif 1 hari)
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1);
      document.cookie = `token=${data.access_token}; path=/; expires=${expiry.toUTCString()};`;
      document.cookie = `role=${data.user.role}; path=/; expires=${expiry.toUTCString()};`;

      // Sesuai request: Untuk saat ini diarahkan ke home (/) semua
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Login berhasil sebagai ${data.user.role}!`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      if (data.user.role === "admin") {
        router.push("/admin/user");
      } else if (data.user.role === "pengembang soal") {
        router.push("/pengembang/paket-soal");
      } else {
        router.push("/peserta/paket-soal");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-md mx-auto mt-20">
      <div className="pt-10 px-6.5 text-center">
        <h3 className="text-xl font-semibold text-black dark:text-white">Login</h3>
      </div>
      <form onSubmit={handleLogin} className="p-6.5">
        {error && <p className="text-danger mb-4 text-sm">{error}</p>}

        <div className="mb-4.5">
          <label className="mb-2.5 block text-black dark:text-white">Nama</label>
          <input
            type="text"
            placeholder="Masukkan nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            required
          />
        </div>

        <div className="mb-5.5">
          <label className="mb-2.5 block text-black dark:text-white">Password</label>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="flex w-full justify-center rounded-xl bg-blue-500 p-3 font-medium text-white hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed  ">
          {isSubmitting ? "Memproses..." : "Login"}
        </button>
      </form>
      <div className="pb-4 text-center">
        <Link href="/register" className="text-blue-500 hover:underline">
          Belum punya akun? Daftar di sini
        </Link>
      </div>
    </div>
  );
}