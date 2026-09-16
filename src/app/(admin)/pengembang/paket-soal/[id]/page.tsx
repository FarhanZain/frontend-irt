"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tombol } from "@/components/tombol/tombol";
import Swal from "sweetalert2";

interface TopikDetail {
    id_topik: number;
    nama_topik: string;
    soal_count: number;
}

interface DetailPaket {
    id_paket: number;
    nama_paket: string;
    topik_count: number;
    soal_count: number;
    ujian_peserta_count: number;
    status_irt: string;
    topik: TopikDetail[];
}

export default function DetailPengembangPaketSoal() {
    const params = useParams();
    const router = useRouter();
    const [paket, setPaket] = useState<DetailPaket | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Ambil token dari localStorage secara aman
    const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        const token = getToken();
        if (!token) {
        setErrorMessage("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
        }

        // 1. Tambahkan Header Authorization pada fetch data detail
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pengembang/paket-soal/${params.id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        },
        })
        .then((res) => {
            if (!res.ok) {
            throw new Error(`Error ${res.status}: Gagal mengambil detail paket.`);
            }
            return res.json();
        })
        .then((resData) => {
            setPaket(resData.data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching detail:", err);
            setErrorMessage(err.message || "Terjadi kesalahan saat memuat data.");
            setLoading(false);
        });
    }, [params.id]);

    const handleRunIrt = async () => {
        const token = getToken();
        if (!token) {
            alert("Sesi Anda habis, silakan login kembali.");
            return;
        }

        setAnalyzing(true);
        try {
            // Tembak ke endpoint Python FastAPI yang telah kita buat
            const res = await fetch(`${process.env.NEXT_PUBLIC_IRT_URL}/analisis-irt/${params.id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                },
            });

            const data = await res.json();
            
            if (res.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: data.message || "Analisis IRT berhasil dijalankan!",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                
                // UPDATE STATE LOKAL: Mengubah status_irt agar tombol langsung berubah di UI tanpa reload
                if (paket) {
                    setPaket({
                        ...paket,
                        status_irt: "sudah diolah"
                    });
                }
            } else {
                // FastAPI melempar pesan error di dalam properti 'detail'
                Swal.fire({
                    icon: "error",
                    title: "Gagal!",
                    text: data.detail || data.message || "Gagal menjalankan analisis IRT.",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            }
        } catch (error) {
            console.error("Error trigger IRT:", error);
            Swal.fire({
                icon: "error",
                title: "Gagal!",
                text: "Terjadi kesalahan sistem saat memicu analisis IRT.",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <div className="p-6 text-center text-sm text-gray-500">Memuat rincian paket...</div>;
    
    if (errorMessage) {
        return (
        <div className="p-6 text-center">
            <div className="inline-block p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900/50">
            {errorMessage}
            </div>
        </div>
        );
    }

    if (!paket) return <div className="p-6 text-center text-sm text-red-500">Data tidak ditemukan.</div>;

    return (
        <div className="p-2 space-y-4 w-full">
            <Tombol path={`/pengembang/paket-soal`} text="← Kembali" />
        {/* Header Info */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
            <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Detail Paket Soal</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{paket.nama_paket}</h1>
            <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{paket.ujian_peserta_count ?? 0} Peserta</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{paket.topik_count ?? 0} Topik</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{paket.soal_count ?? 0} Soal</span>
            </div>
            </div>

            {/* Panel Tombol Aksi */}
            <div className="flex flex-wrap gap-3">
                {paket.status_irt === "sudah diolah" || paket.ujian_peserta_count < 30 ? (
                    <button
                        disabled
                        className="px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 bg-gray-200 text-gray-500 opacity-70 cursor-not-allowed"
                    >
                        <svg className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        {paket.status_irt === "sudah diolah" ? "Sudah Ada Analisis IRT" : ""}
                        {paket.ujian_peserta_count < 30 ? "Belum bisa menganalisis IRT" : ""}
                    </button>
                ) : (
                    <button
                        onClick={handleRunIrt}
                        disabled={analyzing}
                        className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${analyzing ? "bg-amber-400" : "bg-amber-500 hover:bg-amber-600 active:scale-95"} text-white`}
                    >
                        <svg className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        {analyzing ? "Menganalisis IRT..." : "Analisis IRT (Python)"}
                    </button>
                )}
                {paket.status_irt === "belum diolah" ? (
                    <button
                        disabled
                        className="px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 bg-gray-200 text-gray-500 opacity-70 cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm12 0v-11a2 2 0 00-2-2h-2a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2z" />
                        </svg>
                        Belum Ada Dashboard Ujian
                    </button>
                ) : (
                    <button
                        onClick={() => router.push(`/pengembang/paket-soal/${paket.id_paket}/dashboard`)}
                        className="px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm12 0v-11a2 2 0 00-2-2h-2a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2z" />
                        </svg>
                        Lihat Dashboard Ujian
                    </button>
                )}
            </div>
        </div>

        {/* List Sub-Materi / Topik */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Komposisi Topik</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {paket.topik && paket.topik.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">Belum ada topik pada paket ini.</div>
            ) : (
                paket.topik?.map((tp, idx) => (
                <div key={tp.id_topik} className="p-4 flex items-center justify-between text-sm hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500">
                        {idx + 1}
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{tp.nama_topik}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold rounded-lg">
                    {tp.soal_count ?? 0} Soal
                    </span>
                </div>
                ))
            )}
            </div>
        </div>
        </div>
    );
}