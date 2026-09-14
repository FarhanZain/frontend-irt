"use client";
import React from "react";

interface SkorProps {
  skor: number;
  jmlBenar: number;
  jmlSalah: number;
  jmlKosong: number;
  jmlSoal: number;
}

export const Skor = ({ skor, jmlBenar, jmlSalah, jmlKosong, jmlSoal }: SkorProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">

        <div className="flex flex-col gap-4 md:flex-row md:gap-0 items-center justify-between">
            <div className="w-full md:w-auto text-center md:text-left">
                <p className="text-base text-gray-500 dark:text-gray-400">
                Rata-rata Skor Kemampuan Anda
                </p>
                <p className="font-bold text-5xl my-3 text-blue-600">{skor}</p>
                {/* <p className="text-base text-gray-500 dark:text-gray-400">
                Dikerjakan : 25 April 2026
                </p> */}
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 items-center w-full md:w-auto">
                <div className="rounded-xl border border-emerald-400 bg-emerald-50 p-5 flex flex-col items-center">
                    <p className="font-semibold text-2xl text-emerald-500">{jmlBenar}</p>
                    <p className="text-sm font-medium text-emerald-500">BENAR</p>
                </div>
                <div className="rounded-xl border border-rose-400 bg-rose-50 p-5 flex flex-col items-center">
                    <p className="font-semibold text-2xl text-rose-500">{jmlSalah}</p>
                    <p className="text-sm font-medium text-rose-500">SALAH</p>
                </div>
                <div className="rounded-xl border border-gray-400 bg-gray-50 p-5 flex flex-col items-center">
                    <p className="font-semibold text-2xl text-gray-500">{jmlKosong}</p>
                    <p className="text-sm font-medium text-gray-500">KOSONG</p>
                </div>
                <div className="rounded-xl border border-blue-400 bg-blue-50 p-5 flex flex-col items-center">
                    <p className="font-semibold text-2xl text-blue-500">{jmlSoal}</p>
                    <p className="text-sm font-medium text-blue-500">SOAL</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
