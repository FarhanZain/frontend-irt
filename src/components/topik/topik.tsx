"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Impor ApexCharts secara dinamis untuk menghindari error SSR di Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface TopikProps {
  topik: string;
  skor: number;
  total_soal: number;
  peluang: string;
  dataNilai: [number, number, number]; // [Benar, Salah, Kosong]
  borderColor: string;
  bgColor: string;
}

export const Topik: React.FC<TopikProps> = ({ topik, skor, total_soal, peluang, dataNilai, borderColor, bgColor }) => {
  // Warna: Hijau (Benar), Merah (Salah), Abu-abu (Kosong)
  const colors = ["#a4f4cf", "#ffccd3", "#e2e8f0"];
  
  // Total untuk kalkulasi persentase di label jika diperlukan
  const total = dataNilai.reduce((a, b) => a + b, 0);

  // Data Series untuk ApexCharts
  const series = [
    { name: "Benar", data: [dataNilai[0]] },
    { name: "Salah", data: [dataNilai[1]] },
    { name: "Kosong", data: [dataNilai[2]] },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      stackType: "100%", // Membuatnya memenuhi lebar container 100%
      toolbar: { show: false },
      sparkline: { enabled: true }, // Menghilangkan semua garis axis agar bersih
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
      formatter: function (val, opt) {
        // Menampilkan angka asli (bukan persen) di dalam bar
        const value = opt.w.globals.series[opt.seriesIndex][opt.dataPointIndex];
        return value > 0 ? value : ""; 
      },
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        colors: ["#10b981", "#ec003f", "#45556c"],
      },
    },
    tooltip: {
      enabled: false,
    },
    xaxis: {
      categories: ["Hasil"],
    },
  };

  return (
    <div className={`flex flex-col rounded-xl border p-4 w-full mt-3 shadow-sm hover:shadow-md transition-all ${borderColor} ${bgColor}`}>
      {/* Bagian Header: Info Topik dan Skor */}
        <div className="flex items-start justify-between gap-6">
            <p className="font-bold text-gray-800 mb-2">{topik}</p>
            <p className="font-bold text-gray-500 mb-2 w-[70px] text-end">{total_soal} soal</p>
        </div>

      {/* Bar Chart: Sangat mirip dengan gambar referensi */}
      <div className="h-5 w-full overflow-hidden rounded-full border border-gray-100 bg-gray-50">
        <Chart 
          options={options} 
          series={series} 
          type="bar" 
          height="100%" 
          width="100%" 
        />
      </div>

      {/* Bagian Footer: Detail Tambahan */}
      <div className="flex justify-between items-center mt-3 border-t border-gray-50">
        <div>
          <p className="text-xs text-gray-700">Skor Kemampuan</p>
          <p className="font-bold text-lg text-blue-600 leading-tight">{skor}</p>
        </div>
        <div>
          <p className="text-xs text-gray-700">Probabilitas Benar</p>
          <p className="font-bold text-lg text-blue-600 leading-tight text-end">{peluang}</p>
        </div>
      </div>
    </div>
  );
};