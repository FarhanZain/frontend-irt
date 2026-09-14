"use client";
import React from "react";
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
}

interface PowerProps {
    kuat: PowerDetail[];
    normal: PowerDetail[];
    lemah: PowerDetail[];
}

export const Power = ({ kuat, normal, lemah }: PowerProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6  ">
        <h4 className="text-base text-gray-500 font-semibold dark:text-gray-400 mb-2">Analisis Topik</h4>
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
                    Normal
                </p>
                {normal.length > 0 ? (
                    normal.map((topikSoal) => (
                        <Topik
                            key={topikSoal.id_topik}
                            topik={topikSoal.nama_topik}
                            skor={topikSoal.skor_kemampuan}
                            total_soal={topikSoal.jumlah_soal}
                            peluang={`${topikSoal.akurasi}`}
                            dataNilai={[topikSoal.jumlah_benar, topikSoal.jumlah_salah, topikSoal.jumlah_kosong]}
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
