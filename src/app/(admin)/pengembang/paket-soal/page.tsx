"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PaketSoal {
  id_paket: number;
  nama_paket: string;
  tipe_soal: string;
  topik_count: number;
  soal_count: number;
  ujian_peserta_count: number;
}

export default function PengembangPaketSoal() {
  const [dataPaket, setDataPaket] = useState<PaketSoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Ambil token dari localStorage yang disimpan saat login
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setErrorMessage("Token tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      return;
    }

    // 2. Lakukan fetch dengan menyertakan Bearer Token di Header
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/pengembang/paket-soal?per_page=10`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: Gagal memuat data paket soal.`);
        }
        return res.json();
      })
      .then((data) => {
        // Karena Laravel menggunakan ->paginate(), data array asli
        // biasanya berada di dalam data.data (jika response langsung $paket)
        // atau data.data.data tergantung bagaimana Anda membungkus JSON-nya.
        const arrayPaket = data.data && Array.isArray(data.data) ? data.data : data.data?.data || [];
        setDataPaket(arrayPaket);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil data paket:", err);
        setErrorMessage(err.message || "Terjadi kesalahan saat mengambil data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-sm text-gray-500">Memuat paket soal...</div>;
  }

  if (errorMessage) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900/50">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-2 max-w-6xl mx-auto space-y-4">
      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <h1 className="text-xl font-bold text-black">Paket Soal</h1>
        <p className="text-sm text-gray-500 mt-1">Silakan pilih paket soal di bawah ini untuk melihat detail deskripsi dan pengerjaan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataPaket.map((pkt) => (
          <div key={pkt.id_paket} className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-black mb-2">{pkt.nama_paket}</h3>
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{pkt.tipe_soal}</span>
              </div>
              <div className="text-sm text-gray-500 space-x-4 mb-4 mt-2">
                <span>👤 <b>{pkt.ujian_peserta_count}</b> Peserta</span>
                <span>📚 <b>{pkt.topik_count}</b> Topik</span>
                <span>📝 <b>{pkt.soal_count}</b> Butir Soal</span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/pengembang/paket-soal/${pkt.id_paket}`)}
              className="w-full py-2 rounded-xl bg-blue-50 text-sm font-semibold hover:bg-blue-100 text-blue-600 text-center transition"
            >
              Lihat Detail →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}