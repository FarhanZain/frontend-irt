"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Impor ApexCharts secara dinamis untuk menghindari error SSR di Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TopikProps {
  topik: string;
  jumlah_peserta: number;
  jumlah_lemah: number;
  persen_lemah: number;
  jumlah_normal: number;
  persen_normal: number;
  jumlah_kuat: number;
  persen_kuat: number;
}

export const PenguasaanTopik: React.FC<TopikProps> = ({ 
  topik, 
  jumlah_peserta, 
  jumlah_lemah, 
  persen_lemah, 
  jumlah_normal, 
  persen_normal, 
  jumlah_kuat, 
  persen_kuat 
}) => {

  // Warna latar untuk masing-masing kategori: Lemah (Merah), Normal (Amber), Kuat (Hijau)
  const colors = ["#ef4444", "#eab308", "#22c55e"];

  // Data Series menggunakan nilai persentase
  const series = [
    { name: "Lemah", data: [persen_lemah] },
    { name: "Normal", data: [persen_normal] },
    { name: "Kuat", data: [persen_kuat] },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      stackType: "100%", // Memenuhi lebar container 100%
      toolbar: { show: false },
      sparkline: { enabled: true }, // Menghilangkan semua garis & axis
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "100%",
      },
    },
    colors: colors,
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        const value = typeof val === "number" ? val : Array.isArray(val) ? val[0] : Number(val);
        // Menampilkan persentase di dalam bar jika di atas 0%
        return value > 0 ? `${value}%` : "";
      },
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        // Warna teks kontras: Merah tua, Amber tua, Hijau tua agar terbaca jelas
        colors: ["#ffffff"], 
      },
    },
    tooltip: {
      enabled: false,
    },
    xaxis: {
      categories: ["Penguasaan"],
    },
  };

  return (
    <div className="flex flex-col rounded-xl border p-4 w-full transition-all bg-white dark:bg-white/[0.03] dark:border-gray-800">
      
      {/* Bagian Header: Nama Materi & Total Peserta */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-gray-800 dark:text-white/90">{topik}</p>
        <p className="text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-3 py-0.5 rounded-full">
          {jumlah_peserta} peserta
        </p>
      </div>

      {/* BODY: Single Stacked Progress Bar 100% */}
      <div className="h-6 w-full overflow-hidden rounded-full border border-gray-100 dark:border-gray-800 bg-gray-50">
        <Chart 
          options={options} 
          series={series} 
          type="bar" 
          height="100%" 
          width="100%" 
        />
      </div>

      {/* Legend di bawah chart menampilkan jumlah peserta */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 justify-between text-sm">
        <div className="">
          <p className="text-gray-500 dark:text-gray-400">Lemah</p>
          <p className="text-red-500 dark:text-red-400 font-semibold">{jumlah_lemah} Peserta ({persen_lemah}%)</p>
        </div>
        <div className="">
          <p className="text-gray-500 dark:text-gray-400">Normal</p>
          <p className="text-yellow-500 dark:text-yellow-400 font-semibold">{jumlah_normal} Peserta ({persen_normal}%)</p>
        </div>
        <div className="">
          <p className="text-gray-500 dark:text-gray-400">Kuat</p>
          <p className="text-green-500 dark:text-green-400 font-semibold">{jumlah_kuat} Peserta ({persen_kuat}%)</p>
        </div>
      </div>

    </div>
  );
};