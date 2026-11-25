"use client";
import React, { useState, useRef, useEffect } from "react";
import { Topik } from "../topik/topik";

interface PowerDetail {
    id_topik: number;
    nama_topik: string;
    skor_kemampuan: number;
    jumlah_soal: number;
    akurasi: number;
    jumlah_benar: number;
    jumlah_salah: number;
    jumlah_kosong: number;
    nilai_theta: number;
}

interface PowerProps {
    kuat: PowerDetail[];
    sedang: PowerDetail[];
    lemah: PowerDetail[];
}

export const Power = ({ kuat, sedang, lemah }: PowerProps) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Menutup tooltip otomatis jika pengguna mengklik di luar area tooltip
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setShowTooltip(false);
            }
        };

        if (showTooltip) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showTooltip]);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            {/* Header Judul + Tombol Tooltip Threshold */}
            <div className="flex items-center justify-between gap-2">
                <h4 className="text-base text-gray-500 font-semibold dark:text-gray-400">
                    Analisis Topik
                </h4>

                {/* Wrapper Relative untuk Tombol dan Tooltip */}
                <div className="relative" ref={tooltipRef}>
                    <button
                        type="button"
                        onClick={() => setShowTooltip((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:border-gray-700 dark:bg-white/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.08] transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-blue-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>Batas Kategori</span>
                    </button>

                    {/* Popover / Div Tooltip */}
                    {showTooltip && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-[500px] z-30 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900 text-left">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
                                <p className="text-sm font-bold text-gray-800 dark:text-white">
                                    Batas Kategori Kemampuan
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowTooltip(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold px-1"
                                    aria-label="Tutup"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Keterangan Istilah */}
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-3 bg-gray-50 dark:bg-white/[0.03] p-2.5 rounded-lg">
                                <p>
                                    <span className="font-semibold text-gray-800 dark:text-white">Nilai Kemampuan:</span> Nilai theta peserta (θ) di topik ini.
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-800 dark:text-white">Rata-rata:</span> Nilai rata-rata theta seluruh peserta pada topik ini.
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-800 dark:text-white">Sebaran Nilai:</span> Jarak variasi nilai theta antar peserta (standar deviasi).
                                </p>
                            </div>

                            {/* Rumus dalam Bahasa Awam */}
                            <div className="space-y-2 text-sm">
                                <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40">
                                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">
                                        Kuat
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-200">
                                        Nilai Kemampuan <span className="font-bold">&gt;</span> Rata-rata + (0,5 × Sebaran Nilai)
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-gray-100/80 dark:bg-white/[0.05] border border-gray-200/70 dark:border-gray-800">
                                    <p className="font-semibold text-gray-700 dark:text-gray-200 mb-0.5">
                                        Sedang
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-200">
                                        Nilai Kemampuan di antara <span className="font-medium">(Rata-rata − 0,5 × Sebaran)</span> s/d <span className="font-medium">(Rata-rata + 0,5 × Sebaran)</span>
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100/80 dark:border-rose-900/40">
                                    <p className="font-semibold text-rose-700 dark:text-rose-400 mb-0.5">
                                        Perlu Ditingkatkan (Lemah)
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-200">
                                        Nilai Kemampuan <span className="font-bold">&lt;</span> Rata-rata − (0,5 × Sebaran Nilai)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 my-4">
                    Kategori <strong className="text-emerald-600">Kuat</strong>, <strong className="text-gray-600">Sedang</strong>, dan <strong className="text-rose-600">Perlu Ditingkatkan</strong> menunjukkan posisi tingkat kemampuanmu dibandingkan dengan <strong className="text-blue-600">seluruh peserta lain</strong> yang mengerjakan paket soal ini pada topik yang sama.
                </p>
            </div>

            {/* Grid 3 Kolom Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="min-w-0">
                    <p className="text-base font-semibold text-emerald-600 dark:text-gray-400">
                        Kekuatan
                    </p>
                    {kuat.length > 0 ? (
                        kuat.map((topikSoal) => (
                            <Topik
                                key={topikSoal.id_topik}
                                topik={topikSoal.nama_topik}
                                skor={topikSoal.skor_kemampuan}
                                total_soal={topikSoal.jumlah_soal}
                                peluang={`${topikSoal.akurasi}`}
                                dataNilai={[
                                    topikSoal.jumlah_benar,
                                    topikSoal.jumlah_salah,
                                    topikSoal.jumlah_kosong,
                                ]}
                                theta={topikSoal.nilai_theta}
                                borderColor="border-emerald-400"
                                bgColor="bg-emerald-50"
                            />
                        ))
                    ) : (
                        <div className="flex flex-1 items-center justify-center py-10">
                            <p className="text-sm text-gray-400 italic font-medium">
                                Tidak ada data
                            </p>
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                        Sedang
                    </p>
                    {sedang.length > 0 ? (
                        sedang.map((topikSoal) => (
                            <Topik
                                key={topikSoal.id_topik}
                                topik={topikSoal.nama_topik}
                                skor={topikSoal.skor_kemampuan}
                                total_soal={topikSoal.jumlah_soal}
                                peluang={`${topikSoal.akurasi}`}
                                dataNilai={[topikSoal.jumlah_benar, topikSoal.jumlah_salah, topikSoal.jumlah_kosong]}
                                theta={topikSoal.nilai_theta}
                                borderColor="border-gray-400"
                                bgColor="bg-gray-50"
                            />
                        ))
                    ) : (
                        <div className="flex flex-1 items-center justify-center py-10">
                            <p className="text-sm text-gray-400 italic font-medium">
                                Tidak ada data
                            </p>
                        </div>
                    )}
                </div>

                <div className="min-w-0">
                    <p className="text-base font-semibold text-rose-600 dark:text-gray-400">
                        Perlu ditingkatkan
                    </p>
                    {lemah.length > 0 ? (
                        lemah.map((topikSoal) => (
                            <Topik
                                key={topikSoal.id_topik}
                                topik={topikSoal.nama_topik}
                                skor={topikSoal.skor_kemampuan}
                                total_soal={topikSoal.jumlah_soal}
                                peluang={`${topikSoal.akurasi}`}
                                dataNilai={[topikSoal.jumlah_benar, topikSoal.jumlah_salah, topikSoal.jumlah_kosong]}
                                theta={topikSoal.nilai_theta}
                                borderColor="border-rose-400"
                                bgColor="bg-rose-50"
                            />
                        ))
                    ) : (
                        <div className="flex flex-1 items-center justify-center py-10">
                            <p className="text-sm text-gray-400 italic font-medium">
                                Tidak ada data
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};