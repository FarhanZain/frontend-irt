"use client";
import React, { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { useParams } from "next/navigation";
import { AnalisisSoal } from "@/components/admin/AnalisisSoal";
import { ChartDistribusi } from "@/components/admin/ChartDistribusi";
import { PenguasaanTopik } from "@/components/admin/PenguasaanTopik";
import { PeringkatPesertaList } from "@/components/admin/PeringkatPeserta";
import { Tombol } from "@/components/tombol/tombol";
import KomposisiPieChart from "@/components/admin/KomposisiPieChart";

export default function DashboardHasilIrtPengembang() {
  const params = useParams();
  const idPaket = params.id;

  const [rekomendasiAdmin, setRekomendasiAdmin] = useState<string>('');
  const [detailPaket, setDetailPaket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [AILoading, setAILoading] = useState<boolean>(false);
  const [AIError, setAIError] = useState<string>('');

  useEffect(() => {
    if (!idPaket) {
      setError("ID Paket tidak valid atau parameter paket_id hilang.");
      setLoading(false);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/pengembang/dashboard-irt/${idPaket}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data dashboard hasil IRT.");
        return res.json();
      })
      .then((resData) => {
        setDetailPaket(resData.detailPaket);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Terjadi masalah jaringan.");
        setLoading(false);
      });
  }, [idPaket]);

  if (loading) return <div className="p-8 text-center text-sm text-gray-500">Mengekstrak data statistik IRT...</div>;
  if (error) return <div className="p-8 text-center text-sm text-red-500">{error}</div>;
  if (!detailPaket) return null;

  const handleAuditSoalAI = async () => {
    setAILoading(true);
    setAIError('');
    try {
      // Mengirimkan data detailPaket utuh ke API internal Next.js
      const resGemini = await fetch('/api/rekomendasi-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detailPaket),
      });

      const hasilGemini = await resGemini.json();

      if (hasilGemini.success) {
        setRekomendasiAdmin(hasilGemini.rekomendasi);
      } else {
        setAIError(hasilGemini.message || 'Gagal membuat rekomendasi evaluasi soal.');
      }
    } catch (err) {
      console.error("Gagal memproses audit soal:", err);
      setAIError('Terjadi kesalahan koneksi saat menghubungi AI.');
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 p-2">
      <div className="col-span-12">
        {/* Header Dashboard */}
        <div className="flex items-center gap-4 mb-4">
          <Tombol path={`/pengembang/paket-soal/${idPaket}`} text="← Kembali" />
          <div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">Hasil Ujian (Pengembang Soal)</p>
            <p className="text-md text-gray-600 dark:text-gray-400">{detailPaket.ringkasan_paket.nama_paket}</p>
          </div>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 dark:text-white/90">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] w-full">
            <p className="mb-1 text-gray-600 text-sm dark:text-gray-400">Jumlah Peserta</p>
            <p className="text-2xl font-bold">{detailPaket.ringkasan_paket.jumlah_peserta}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] w-full">
            <p className="mb-1 text-gray-600 text-sm dark:text-gray-400">Rata-Rata Skor</p>
            <p className="text-2xl font-bold">{detailPaket.ringkasan_paket.rata_rata_skor}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] w-full">
            <p className="mb-1 text-gray-600 text-sm dark:text-gray-400">Rata-Rata Theta</p>
            <p className="text-2xl font-bold">{detailPaket.ringkasan_paket.rata_rata_theta}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] w-full">
            <p className="mb-1 text-gray-600 text-sm dark:text-gray-400">Skor Tertinggi</p>
            <p className="text-2xl font-bold">{detailPaket.ringkasan_paket.skor_tertinggi}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] w-full">
            <p className="mb-1 text-gray-600 text-sm dark:text-gray-400">Skor Terendah</p>
            <p className="text-2xl font-bold">{detailPaket.ringkasan_paket.skor_terendah}</p>
          </div>
        </div>

        {/* Grafik Distribusi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <ChartDistribusi title="Distribusi Kemampuan Berdasarkan Nilai Theta" categories={detailPaket.categoriesTheta} data={detailPaket.valuesTheta} color="#3b82f6" />
          <ChartDistribusi title="Distribusi Kemampuan Berdasarkan Nilai Skor" categories={detailPaket.categoriesSkor} data={detailPaket.valuesSkor} color="#10b981" />
        </div>

        {/* Penguasaan Topik */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mt-4 dark:text-white/90">
          <h1 className="font-semibold text-base">Penguasaan Kategori per Topik</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {detailPaket.penguasaan_sub_materi?.map((item: any) => (
              <PenguasaanTopik
                key={item.id_sub_materi}
                topik={item.nama_sub_materi}
                jumlah_peserta={item.jumlah_peserta}
                jumlah_lemah={item.lemah.jumlah}
                persen_lemah={item.lemah.persen}
                jumlah_normal={item.normal.jumlah}
                persen_normal={item.normal.persen}
                jumlah_kuat={item.kuat.jumlah}
                persen_kuat={item.kuat.persen}
              />
            ))}
          </div>
        </div>

        {/* Analisis Karakteristik Soal */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mt-4 dark:text-white/90">
          <div>
            <h1 className="font-semibold mb-3 text-base">Analisis Karakteristik Soal (Item Analysis)</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KomposisiPieChart
                title="Distribusi Tingkat Kesulitan"
                labels={["Mudah", "Sedang", "Susah"]}
                series={[
                  detailPaket.analisis_soal.kategori_kesulitan.mudah,
                  detailPaket.analisis_soal.kategori_kesulitan.sedang,
                  detailPaket.analisis_soal.kategori_kesulitan.susah,
                ]}
                colors={["#22c55e", "#eab308", "#ef4444"]}
              />
              <KomposisiPieChart
                title="Distribusi Daya Pembeda"
                labels={["Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"]}
                series={[
                  detailPaket.analisis_soal.kategori_daya_pembeda.sangat_buruk,
                  detailPaket.analisis_soal.kategori_daya_pembeda.buruk,
                  detailPaket.analisis_soal.kategori_daya_pembeda.cukup,
                  detailPaket.analisis_soal.kategori_daya_pembeda.baik,
                  detailPaket.analisis_soal.kategori_daya_pembeda.sangat_baik,
                ]}
                colors={["#ef4444", "#eab308", "#eab308", "#3b82f6", "#22c55e"]}
              />

            </div>
          </div>

          <div className="mt-12">
            {/* Judul Utama */}
            <h3 className="mb-4 font-bold text-base text-gray-800 dark:text-white/95 tracking-tight flex items-center gap-2">
              Batasan Kategori pada IRT (Item Response Theory)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CARD 1: TINGKAT KESULITAN */}
              <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
                <div className="flex flex-col gap-2 md:flex-row justify-between items-start mb-3 border-b border-gray-50 dark:border-gray-800">
                  <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-white/90">Tingkat Kesulitan</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Parameter Tingkat Kesukaran Soal</p>
                  </div>
                  <span className="text-sm font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.02] text-gray-600 dark:text-gray-300">
                    Rentang: -2 s.d 2
                  </span>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full text-sm">Mudah</span>
                    <span className="text-gray-600 dark:text-gray-300 font-mono">Nilai &lt; -1.0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full text-sm">Sedang</span>
                    <span className="text-gray-600 dark:text-gray-300 font-mono">-1.0 &le; Nilai &le; 1.0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded-full text-sm">Susah</span>
                    <span className="text-gray-600 dark:text-gray-300 font-mono">Nilai &gt; 1.0</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: DAYA PEMBEDA */}
              <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
                <div className="flex flex-col gap-2 md:flex-row justify-between items-start mb-3 border-b border-gray-50 dark:border-gray-800">
                  <div>
                    <p className="font-bold text-sm text-gray-800 dark:text-white/90">Daya Pembeda</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Kemampuan Membedakan Siswa Cerdas/Tidak</p>
                  </div>
                  <span className="text-sm font-semibold px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/[0.02] text-gray-600 dark:text-gray-300">
                    Rentang: 0 s.d 2
                  </span>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded-full text-sm">Sangat Buruk</span>
                    <span className="text-gray-600 dark:text-gray-300 font-mono">Nilai &lt; 0.0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-amber-500 dark:text-amber-400 bg-yellow-50 dark:bg-yellow-950/30 px-2.5 py-0.5 rounded-full text-sm">Buruk</span>
                    <span className="text-gray-600 dark:text-gray-300 font-mono">0.0 &le; Nilai &lt; 0.35</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2.5 py-0.5 rounded-full text-sm">Cukup</span>
                    <span className="text-gray-600 dark:text-gray-300 font-mono">0.35 &le; Nilai &lt; 0.65</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full text-sm">Baik</span>
                    <span className="text-gray-600 dark:text-gray-300 font-mono">0.65 &le; Nilai &lt; 1.65</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full text-sm">Sangat Baik</span>
                    <span className="text-gray-600 dark:text-gray-300 font-mono">Nilai &ge; 1.65</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-12">
            <p className="mb-4 font-semibold text-base">Detail Parameter Butir Soal</p>
            <AnalisisSoal detailSoal={detailPaket.analisis_soal.detail} />
          </div>
        </div>

        {/* 🤖 BARU: Section Validasi & Audit Butir Soal oleh AI Gemini */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mt-4 dark:text-white/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                🤖 Rekomendasi Kalibrasi Soal (AI)
              </h2>
              <p className="text-xs text-gray-400 mt-1">Menganalisis anomali soal, indikasi kunci jawaban salah, atau tingkat distorsi pengecoh soal.</p>
            </div>
            
            <button
              onClick={handleAuditSoalAI}
              disabled={AILoading}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white transition-all ${
                AILoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-sm'
              }`}
            >
              {AILoading ? '⏳ Memeriksa Soal...' : rekomendasiAdmin ? '🔄 Perbarui Evaluasi' : '✨ Jalankan Analisis AI'}
            </button>
          </div>
          
          <hr className="my-4 border-gray-100 dark:border-gray-800" />
          
          {AILoading && (
            <p className="text-gray-500 dark:text-gray-400 animate-pulse text-sm py-4">
              AI sedang memeriksa data untuk mendeteksi butir soal yang cacat atau tidak valid...
            </p>
          )}

          {AIError && (
            <p className="text-red-500 text-sm font-medium py-2">⚠️ {AIError}</p>
          )}

          {!AILoading && !rekomendasiAdmin && !AIError && (
            <p className="text-gray-400 dark:text-gray-500 text-sm py-6 text-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              Klik tombol di atas untuk mengaudit kualitas bank soal secara otomatis berdasarkan statistik pengerjaan peserta.
            </p>
          )}
          
          {!AILoading && rekomendasiAdmin && (
            <div className="prose prose-emerald max-w-none text-sm dark:prose-invert text-gray-700 dark:text-gray-300 space-y-4">
              <ReactMarkdown>{rekomendasiAdmin}</ReactMarkdown>
            </div>
          )}
        </section>

        {/* Peringkat Peserta */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mt-4 dark:text-white/90">
          <h1 className="font-semibold mb-3 text-base">Peringkat Keterampilan & Estimasi Kemampuan Peserta</h1>
          <PeringkatPesertaList dataPeserta={detailPaket.peringkat_peserta} />
        </div>
      </div>
    </div>
  );
}