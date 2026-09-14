// components/skor/PeringkatPesertaList.tsx
"use client";
import React, { useState } from "react";

interface Peserta {
  peringkat: number;
  nama_peserta: string;
  total_skor: number;
  nilai_theta: number;
}

interface PeringkatPesertaListProps {
  dataPeserta: Peserta[];
}

export const PeringkatPesertaList = ({ dataPeserta }: PeringkatPesertaListProps) => {
  // 1. State dan Konfigurasi Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // 2. Hitung total halaman & slice data
  const totalPages = Math.ceil(dataPeserta.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = dataPeserta.slice(indexOfFirstItem, indexOfLastItem);

  // 3. Fungsi Navigasi
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="space-y-4">
      {/* List Peserta Ter-slice */}
      <div className="grid grid-cols-1 gap-3">
        {currentData.map((peserta) => {
          const badgeColor = 
            peserta.peringkat === 1 ? "bg-amber-100 text-amber-700 border-amber-200" :
            peserta.peringkat === 2 ? "bg-slate-100 text-slate-700 border-slate-200" :
            peserta.peringkat === 3 ? "bg-orange-100 text-orange-700 border-orange-200" :
            "bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900/40 dark:border-gray-800";

          return (
            <div 
              key={peserta.peringkat}
              className="flex flex-col gap-4 md:flex-row md:justify-between md:gap-0 items-center bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2" 
            >
              {/* Baris Profil Singkat */}
              <div className="flex items-center gap-2">
                <div className={`w-fit text-sm font-bold px-3 py-1.5 rounded-full border ${badgeColor}`}>
                    # {peserta.peringkat}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white/90">
                    {peserta.nama_peserta}
                  </h4>
                </div>
              </div>

              {/* Statistik Parameter IRT & Skor */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Rata-Rata Theta (θ)</p>
                  <p className="font-bold text-gray-700 dark:text-gray-300 font-mono">
                    {peserta.nilai_theta}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Skor Akhir</p>
                  <p className="font-extrabold text-blue-600 dark:text-blue-400">
                    {peserta.total_skor}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🛠️ CONTROLLER PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs">
          <div className="text-gray-500 dark:text-gray-400">
            Menampilkan <span className="font-semibold">{indexOfFirstItem + 1}</span> -{" "}
            <span className="font-semibold">{Math.min(indexOfLastItem, dataPeserta.length)}</span> dari{" "}
            <span className="font-semibold">{dataPeserta.length}</span> peserta
          </div>
          
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            {/* Tombol Previous */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 font-medium border-r border-gray-200 dark:border-gray-700 transition-colors ${
                currentPage === 1
                  ? "text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Sebelumnya
            </button>
            
            {/* Angka Halaman */}
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isActive = currentPage === pageNumber;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-2 font-medium border-r border-gray-200 dark:border-gray-700 transition-colors min-w-[36px] text-center ${
                    isActive
                      ? "bg-blue-50 text-gray-400 dark:bg-gray-400 dark:text-gray-800 font-bold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Tombol Next */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 font-medium transition-colors ${
                currentPage === totalPages
                  ? "text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};