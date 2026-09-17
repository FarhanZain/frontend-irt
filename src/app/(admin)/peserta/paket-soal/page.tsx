"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PaketPeserta {
  id_paket: number;
  nama_paket: string;
  tipe_soal: string;
  topik_count: number;
  soal_count: number;
  jadwal_selesai?: string | null;
  status_pengerjaan: "belum_mengerjakan" | "sedang_mengerjakan" | "sudah_selesai";
  id_ujian: number | null;
}

export default function DaftarPaketSoalPeserta() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [daftarPaket, setDaftarPaket] = useState<PaketPeserta[]>([]);

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchDaftarPaket();
  }, []);

  const fetchDaftarPaket = async () => {
    setLoading(true);
    try {
      // Ambil data user dari localStorage jika kamu menyimpannya saat login
      let userIdParam = "";
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("user"); // sesuaikan dengan nama key penyimpanan di app kamu
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            const id = parsed.id_user || parsed.id;
            if (id) userIdParam = `?user_id=${id}`; // Masukkan ke query string URL
          } catch (e) {
            console.error("Gagal membaca user data", e);
          }
        }
      }

      // Gabungkan URL dengan parameter ID User sebagai backup penangkap data di backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta/paket${userIdParam}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}` 
        },
      });

      if (res.ok) {
        const data = await res.json();
        setDaftarPaket(data);
      } else {
        console.error("Server merespon dengan error:", res.status);
      }
    } catch (err) {
      console.error("Gagal memuat daftar paket:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Memuat Daftar Paket...</div>;
  }

  return (
    <div className="w-full p-2 max-w-6xl mx-auto space-y-4">
      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <h1 className="text-xl font-bold text-black">Paket Soal</h1>
        <p className="text-sm text-gray-500 mt-1">Silakan pilih paket soal di bawah ini untuk melihat detail deskripsi dan pengerjaan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {daftarPaket.map((pkt) => {
          // Pengecekan kadaluarsa / ujian ditutup
          const isExpired = pkt.jadwal_selesai
            ? new Date(pkt.jadwal_selesai) < new Date()
            : false;

          return (
            <div key={pkt.id_paket} className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{pkt.tipe_soal}</span>
                  {/* Kondisi Status Ujian */}
                  {isExpired ? (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                      Ujian Telah Ditutup
                    </span>
                  ) : pkt.status_pengerjaan === "sudah_selesai" ? (
                    <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                      Sudah Dikerjakan
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Tersedia
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-black mb-2">{pkt.nama_paket}</h3>
                <div className="text-sm text-gray-500 space-x-4 mb-4 mt-2">
                  <span>📚 <b>{pkt.topik_count}</b> Topik</span>
                  <span>📝 <b>{pkt.soal_count}</b> Butir Soal</span>
                </div>

                {/* Info Tanggal Selesai di Bawah Topik & Soal */}
                {pkt.jadwal_selesai && (
                  <div className="text-sm text-gray-500 mt-2 mb-4">
                    <span><b>Jadwal Selesai:</b> {new Date(pkt.jadwal_selesai).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} WIB</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push(`/peserta/paket-soal/${pkt.id_paket}`)}
                className="w-full py-2 rounded-xl bg-blue-50 text-sm font-semibold hover:bg-blue-100 text-blue-600 text-center transition"
              >
                Lihat Detail →
              </button>
            </div>
          );
    })}
      </div>
    </div>
  );
}