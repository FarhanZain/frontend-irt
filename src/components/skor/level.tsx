"use client";
import React, { useState } from "react";

interface SoalDetail {
    id_soal: number;
    level_kesulitan: string;
    nama_topik: string;
    pertanyaan: string;
    status_jawaban: string;
    jawaban_peserta: string | null;
    kunci_jawaban: string;
}

interface LevelProps {
    data: SoalDetail[];
}

export const Level = ({ data }: LevelProps) => {
    // State untuk menyimpan data soal yang sedang dibuka di modal
    const [selectedSoal, setSelectedSoal] = useState<SoalDetail | null>(null);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:gap-0 items-center justify-between mb-4">
                <h4 className="text-base text-gray-500 font-semibold dark:text-gray-400">
                    Tingkat Kesulitan Soal
                </h4>
                
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-full"></span> Mudah</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-700 rounded-full"></span> Sedang</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-950 rounded-full"></span> Susah</div>
                </div>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-4">
                <div className="flex gap-3 items-center justify-center md:justify-start flex-wrap pt-2">
                    {data.map((soal, index) => (
                        <button 
                            key={soal.id_soal}
                            onClick={() => setSelectedSoal(soal)} // Set data soal saat di-klik untuk membuka modal
                            className={`group relative p-3 rounded-lg min-w-[42px] flex justify-center items-center shadow-sm transition-transform hover:scale-110 cursor-pointer
                                ${soal.level_kesulitan === "Mudah" ? "bg-blue-400" : soal.level_kesulitan === "Sedang" ? "bg-blue-700" : "bg-blue-950"}`}
                        >
                            {/* Nomor Soal Otomatis berdasarkan Index */}
                            <p className="font-bold text-white text-sm">
                                {index + 1}
                            </p>

                            {/* Indikator Jawaban Benar / Salah / Kosong (Kanan Atas) */}
                            <div 
                                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm z-10
                                    ${soal.status_jawaban === "benar" ? "bg-green-500" : soal.status_jawaban === "salah" ? "bg-red-500" : "bg-gray-400"}`}
                            >
                                {soal.status_jawaban === "benar" ? (
                                    // Icon Centang (Check)
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : soal.status_jawaban === "salah" ? (
                                    // Icon Silang (X)
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    // Icon Strip (-) untuk jawaban kosong
                                    <span className="text-white text-[10px] font-bold">-</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* MODAL DETAIL SOAL */}
            {selectedSoal && (
                <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden transform transition-all border border-gray-100 dark:border-gray-800">
                        
                        {/* Header Modal */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Detail Soal
                                </h3>
                            </div>
                            <button 
                                onClick={() => setSelectedSoal(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Konten Modal */}
                        <div className="px-6 max-h-[70vh] overflow-y-auto">
                            {/* Status Jawaban & Tingkat Kesulitan */}
                            <div className="flex justify-between mb-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Topik</label>
                                    <span className="inline-block px-3 py-1 rounded-full font-medium bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-gray-300 mt-1">
                                        {selectedSoal.nama_topik}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Status</label>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text font-medium capitalize mt-1
                                        ${selectedSoal.status_jawaban === 'benar' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 
                                          selectedSoal.status_jawaban === 'salah' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400' : 
                                          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        <span className={`w-2 h-2 rounded-full 
                                            ${selectedSoal.status_jawaban === 'benar' ? 'bg-green-500' : 
                                              selectedSoal.status_jawaban === 'salah' ? 'bg-red-500' : 'bg-gray-400'}`} 
                                        />
                                        {selectedSoal.status_jawaban}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Tingkat Kesulitan</label>
                                    <span className={`inline-block px-4 py-1 mt-1 rounded-full font-medium 
                                        ${selectedSoal.level_kesulitan === "Mudah" ? "bg-blue-400" : 
                                          selectedSoal.level_kesulitan === "Sedang" ? "bg-blue-700" : "bg-blue-950"} text-white`}>
                                        {selectedSoal.level_kesulitan}
                                    </span>
                                </div>
                            </div>

                            {/* Pertanyaan */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Pertanyaan</label>
                                <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800/50 leading-relaxed">
                                    {selectedSoal.pertanyaan}
                                </div>
                            </div>

                            {/* Jawaban Peserta & Kunci Jawaban */}
                            <div className="space-y-3 pt-2">
                                <div className={`p-3 rounded-xl border ${selectedSoal.status_jawaban === 'benar' ? 'bg-green-50 border-green-200 text-green-500' : 
                                            selectedSoal.status_jawaban === 'salah' ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Jawaban Anda</label>
                                    <p className={`text-sm font-medium ${selectedSoal.status_jawaban === 'kosong' ? 'text-gray-400 italic' : 'text-gray-900 dark:text-white'}`}>
                                        {selectedSoal.jawaban_peserta ?? "Tidak menjawab"}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/30 dark:bg-green-950/10">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">Kunci Jawaban Benar</label>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-green-400">
                                        {selectedSoal.kunci_jawaban}
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex justify-end">
                            <button
                                onClick={() => setSelectedSoal(null)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};