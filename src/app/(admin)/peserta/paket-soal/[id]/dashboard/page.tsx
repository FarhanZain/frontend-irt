"use client";

import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Level } from "@/components/skor/level";
import { Power } from "@/components/skor/power";
import { Skor } from "@/components/skor/skor";
import { Tombol } from "@/components/tombol/tombol";

export default function DashboardHasilIRT() {
    const params = useParams();
    const idPaket = params.id;

    const [loading, setLoading] = useState(true);
    const [initialData, setInitialData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const [rekomendasiDb, setRekomendasiDb] = useState<string>('');
    const [loadingDb, setLoadingDb] = useState<boolean>(false);
    const [errorDb, setErrorDb] = useState<string>('');

    const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (idPaket) {
        fetchHasilIRT();
        }
    }, [idPaket]);

    const fetchHasilIRT = async () => {
        setLoading(true);
        setError(null);
        try {
        let userIdParam = "";

        // Ambil data user dari localStorage untuk disuntikkan ke URL param
        if (typeof window !== "undefined") {
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                const id = parsed.id_user || parsed.id;
                if (id) userIdParam = `?user_id=${id}`;
            } catch (e) {
                console.error("Gagal parse data user untuk dashboard IRT", e);
            }
            }
        }

        // Hit API dengan menyertakan token dan query parameter user_id
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta/ujian/hasil-irt/${idPaket}${userIdParam}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`,
            },
        });

        const result = await res.json();

        if (res.ok && result.status === "success") {
            setInitialData(result);
            console.log("Data IRT berhasil diambil:", result);
        } else {
            setError(result.message || "Gagal mengambil respon hasil IRT.");
            console.error("Gagal mengambil respon hasil IRT, status:", res.status);
        }
        } catch (err) {
            setError("Terjadi kendala jaringan saat memuat data.");
            console.error("Terjadi kendala jaringan:", err);
        } finally {
        setLoading(false);
        }
    };

    const handleGenerateRekomendasiDb = async () => {
        setLoadingDb(true);
        setErrorDb('');
        try {
        const res = await fetch('/api/rekomendasi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'database', data: initialData }), 
        });
        const hasil = await res.json();
        if (hasil.success) {
            setRekomendasiDb(hasil.rekomendasi);
        } else {
            setErrorDb(hasil.message || 'Gagal membuat rekomendasi.');
        }
        } catch (err) {
            setErrorDb('Terjadi kesalahan koneksi.');
        } finally {
            setLoadingDb(false);
        }
    };

    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-lg font-medium text-gray-600 animate-pulse">Memuat Dashboard Hasil Ujian...</p>
        </div>
        );
    }

    if (error) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <p className="text-lg text-red-500 font-semibold">Gagal Memuat Data</p>
            <p className="text-gray-600">{error}</p>
            <Tombol path={`/peserta/paket-soal/${idPaket}`} text="← Kembali ke Paket" />
        </div>
        );
    }

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6 p-2">
            <div className="col-span-12">
                
                {/* Header Dashboard */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <Tombol path={`/peserta/paket-soal/${idPaket}`} text="← Kembali" />
                        <div>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white/90">Dashboard Hasil Ujian</p>
                        <p className="text-md text-gray-600 dark:text-gray-400">
                            {initialData?.data?.nama_paket}
                        </p>
                        </div>
                    </div>
                </div>

                {/* Konten Komponen Utama Dashboard */}
                <div className="flex flex-col gap-4">
                    <Skor 
                        skor={initialData?.data?.total_skor_akhir} 
                        jmlBenar={initialData?.data?.statistik_jawaban?.jumlah_benar} 
                        jmlSalah={initialData?.data?.statistik_jawaban?.jumlah_salah} 
                        jmlKosong={initialData?.data?.statistik_jawaban?.jumlah_kosong} 
                        jmlSoal={initialData?.data?.statistik_jawaban?.total_soal}
                    />
                    <Power 
                        kuat={initialData?.data?.kemampuan_per_sub_materi?.kekuatan || []} 
                        normal={initialData?.data?.kemampuan_per_sub_materi?.normal || []} 
                        lemah={initialData?.data?.kemampuan_per_sub_materi?.kelemahan || []} 
                    />
                    <Level data={initialData?.data?.tingkat_kesulitan_soal || []}/>
                </div>

                {/* SEKSI REKOMENDASI LAMA YANG TETAP DIPERTAHANKAN */}
                <section className="mt-4">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <h2 className="text-base font-semibold text-gray-700 dark:text-white">
                            Rekomendasi Pembelajaran (Biar AI yang membantu kamu)
                        </h2>
                        <button
                            onClick={handleGenerateRekomendasiDb}
                            disabled={loadingDb}
                            className={`px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all ${
                            loadingDb ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm'
                            }`}
                        >
                            {loadingDb ? '🔄 Sedang Menganalisis...' : rekomendasiDb ? '🔄 Refresh Analisis' : '✨ Berikan Rekomendasi'}
                        </button>
                        </div>
                        
                        <hr className="mb-4 border-gray-100 dark:border-gray-800" />
                        
                        {loadingDb && (
                        <p className="text-gray-500 dark:text-gray-400 animate-pulse text-sm py-4">Mengevaluasi hasil ujian dan merumuskan strategi belajar kamu...</p>
                        )}
                        {errorDb && (
                        <p className="text-red-500 text-sm font-medium py-2">⚠️ {errorDb}</p>
                        )}
                        {!loadingDb && !rekomendasiDb && !errorDb && (
                        <p className="text-gray-400 dark:text-gray-500 text-sm py-4 text-center">Klik tombol di atas untuk melihat rekomendasi belajar berbasis AI.</p>
                        )}
                        {!loadingDb && rekomendasiDb && (
                        <div className="prose prose-slate max-w-none text-sm dark:prose-invert text-gray-700 dark:text-gray-300 space-y-3">
                            <ReactMarkdown>{rekomendasiDb}</ReactMarkdown>
                        </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}