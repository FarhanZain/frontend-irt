"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

export default function RegisterPage() {
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.nama?.[0] || "Gagal melakukan registrasi");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Registrasi berhasil! Silahkan login.`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-md mx-auto mt-20">
      <div className="pt-10 px-6.5 text-center">
        <h3 className="text-xl font-semibold text-black dark:text-white">Registrasi Peserta</h3>
      </div>
      <form onSubmit={handleRegister} className="p-6.5">
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

        {/* <div className="mb-5.5">
          <label className="mb-2.5 block text-black dark:text-white">Password</label>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            required
          />
        </div> */}

        <button type="submit" disabled={isSubmitting} className="flex w-full justify-center rounded-xl bg-blue-500 p-3 font-medium text-white hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed">
          {isSubmitting ? "Memproses..." : "Daftar"}
        </button>
      </form>
      <div className="pb-4 text-center">
        <Link href="/login" className="text-blue-500 hover:underline">
          Sudah punya akun? Login di sini
        </Link>
      </div>
    </div>
  );
}