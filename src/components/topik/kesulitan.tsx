"use client";
import React from "react";

// Kita definisikan tipe kesulitan yang tersedia
type TipeKesulitan = "mudah" | "sedang" | "susah";

interface SoalDetail {
  id: number;
  level: TipeKesulitan;
  nomor: number; // Menambahkan properti nomor
}

interface KesulitanProps {
  topik: string;
  daftarSoal: SoalDetail[]; // Sekarang menerima array object
}

export const Kesulitan: React.FC<KesulitanProps> = ({ topik, daftarSoal }) => {
  
  // Fungsi helper untuk menentukan warna background berdasarkan level
  const getBgColor = (level: TipeKesulitan) => {
    switch (level) {
      case "mudah": return "bg-blue-400";
      case "sedang": return "bg-blue-700";
      case "susah": return "bg-blue-950";
      default: return "bg-blue-600";
    }
  };

  return (
    <div>
      <div>
        <p className="font-semibold mb-3 text-gray-700 dark:text-gray-200">{topik}</p>
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        {daftarSoal.map((soal) => (
          <div 
            key={soal.id} 
            title={`Tingkat: ${soal.level}`} // Tooltip saat hover
            className={`p-3 rounded-lg ${getBgColor(soal.level)} min-w-[42px] flex justify-center items-center shadow-sm transition-transform hover:scale-110 cursor-default`}
          >
            <p className="font-bold text-white text-sm">
              {soal.nomor}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};