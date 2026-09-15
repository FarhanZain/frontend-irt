"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import MathText from "@/components/MathText";

interface OpsiJawaban {
  id_jawaban_soal: number;
  teks_jawaban?: string;
  text_jawaban?: string;
}

interface SoalUjian {
  id_soal: number;
  topik_id: number;
  pertanyaan: string;
  topik: { id_topik: number; nama_topik: string };
  jawaban: OpsiJawaban[];
  jawaban_terpilih_id: number | null;
}

export default function RuangUjianAktif() {
  const params = useParams();
  const router = useRouter();
  const idPaket = params.id;

  const [loading, setLoading] = useState(true);
  const [listSoalUjian, setListSoalUjian] = useState<SoalUjian[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSubmittingUjian, setIsSubmittingUjian] = useState(false);

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Kunci browser dari refresh / close tab tidak sengaja
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Ujian sedang berlangsung! Anda dilarang menutup atau me-refresh halaman sebelum submit final.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Ambil bank soal kosongan dari backend
  useEffect(() => {
    if (idPaket) {
      loadSesiUjian();
    }
  }, [idPaket]);

  const loadSesiUjian = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta/ujian/mulai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ paket_id: idPaket }),
      });

      if (res.ok) {
        const data = await res.json();
        // Mengisi list soal ujian (default jawaban_terpilih_id adalah null dari backend)
        setListSoalUjian(data.soal);
        setCurrentIndex(0);
      } else {
        await Swal.fire({
          icon: "error",
          title: "Akses Ditolak",
          text: "Gagal memuat paket soal ujian.",
          confirmButtonColor: "#EF4444"
        });
        router.push(`/peserta/paket/${idPaket}`);
      }
    } catch (err) {
      console.error("Koneksi gagal:", err);
    } finally {
      setLoading(false);
    }
  };

  // PERBAIKAN: Hanya update state lokal React, tidak menembak API per nomor
  const handleKlikOpsiJawaban = (soalId: number, jawabanSoalId: number) => {
    const updatedList = listSoalUjian.map((s) => {
      if (s.id_soal === soalId) {
        return { ...s, jawaban_terpilih_id: jawabanSoalId };
      }
      return s;
    });
    setListSoalUjian(updatedList);
  };

  // PERBAIKAN: Kumpulkan semua jawaban dari state dan kirim sekaligus
  // PERBAIKAN: Blokir submit jika masih ada soal yang belum diisi
  const handleFinalSubmitUjian = async () => {
    const belumDiisiIndex = listSoalUjian.findIndex(s => s.jawaban_terpilih_id === null);
    const totalBelumDiisi = listSoalUjian.filter(s => s.jawaban_terpilih_id === null).length;

    // Jika ada soal yang belum dijawab, hentikan proses dan tampilkan peringatan
    if (totalBelumDiisi > 0) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Soal Belum Lengkap",
        text: `Masih ada ${totalBelumDiisi} soal yang belum Anda jawab. Silakan lengkapi semua jawaban sebelum submit.`,
        confirmButtonColor: "#3B82F6",
        confirmButtonText: "Buka Soal Kosong",
        showCancelButton: true,
        cancelButtonText: "Tutup",
        cancelButtonColor: "#6B7280"
      });

      // Pindahkan tampilan langsung ke nomor soal pertama yang belum diisi
      if (result.isConfirmed && belumDiisiIndex !== -1) {
        setCurrentIndex(belumDiisiIndex);
      }
      return;
    }

    // Jika semua soal sudah terisi, baru tampilkan konfirmasi kirim
    const confirm = await Swal.fire({
        title: "Selesaikan Sesi Ujian?",
        text: "Apakah Anda yakin ingin mengakhiri ujian dan mengirim semua lembar jawaban?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10B981",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Ya, Kirim!"
    });

    if (!confirm.isConfirmed) return;

    setIsSubmittingUjian(true);

    // Format array jawaban
    const dataJawabanBorongan = listSoalUjian.map((s) => ({
        soal_id: s.id_soal,
        jawaban_soal_id: s.jawaban_terpilih_id
    }));

    // AMBIL USER ID DARI LOCALSTORAGE (JIKA ADA) SEBAGAI CADANGAN INTEGRITAS DATA
    let backupUserId = null;
    if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("user"); // Sesuaikan nama key pendaftaran user-mu
        if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            backupUserId = parsed.id_user || parsed.id || null;
        } catch (e) {
            console.error("Gagal parse data user", e);
        }
        }
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta/ujian/submit-final`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
            paket_id: idPaket,
            user_id: backupUserId, // Ikut dikirim sebagai back-up parameter di request POST
            jawaban_array: dataJawabanBorongan
        }),
        });

        if (res.ok) {
        await Swal.fire({
            icon: "success",
            title: "Ujian Selesai!",
            text: "Seluruh jawaban Anda berhasil disimpan secara permanen di server.",
            confirmButtonColor: "#3B82F6"
        });
        router.push("/peserta/paket-soal");
        } else {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menyimpan data ke server.");
        }
    } catch (err: any) {
        Swal.fire({
        icon: "error",
        title: "Gagal Submit",
        text: err.message || "Terjadi kesalahan jaringan.",
        confirmButtonColor: "#EF4444"
        });
    } finally {
        setIsSubmittingUjian(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Menyusun Lembar Soal Ujian...</div>;
  }

  if (listSoalUjian.length === 0) {
    return <div className="p-8 text-center text-red-500 font-bold">Belum ada soal tersedia di dalam paket ini.</div>;
  }

  return (
    <div className="w-full p-2 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* SISI KIRI: PERTANYAAN */}
      <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between min-h-[480px]">
        <div>
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">
                Sub Materi: {listSoalUjian[currentIndex].topik?.nama_topik || "Umum"}
              </span>
              <h2 className="text-sm font-bold text-black mt-0.5">Soal Nomor {currentIndex + 1}</h2>
            </div>
            <span className="text-xs bg-gray-100 font-bold text-gray-500 py-1 px-3 rounded-lg">
              {currentIndex + 1} / {listSoalUjian.length}
            </span>
          </div>

          <p className="text-base text-black font-medium leading-relaxed whitespace-pre-wrap mb-6">
            {/* {listSoalUjian[currentIndex].pertanyaan} */}
            <MathText text={listSoalUjian[currentIndex].pertanyaan} />
          </p>

          <div className="space-y-3">
            {listSoalUjian[currentIndex].jawaban?.map((jwb, oIdx) => {
              const isSelected = listSoalUjian[currentIndex].jawaban_terpilih_id === jwb.id_jawaban_soal;
              return (
                <div
                  key={jwb.id_jawaban_soal}
                  onClick={() => handleKlikOpsiJawaban(listSoalUjian[currentIndex].id_soal, jwb.id_jawaban_soal)}
                  className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected ? "bg-blue-50/70 border-blue-500 shadow-sm" : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-colors ${
                    isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
                  }`}>
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span className={`text-sm font-semibold ${isSelected ? "text-blue-900" : "text-gray-800"}`}>
                    {/* {jwb.teks_jawaban || jwb.text_jawaban} */}
                    <MathText text={jwb.teks_jawaban || jwb.text_jawaban} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4 mt-6">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((p) => p - 1)}
            className="py-2 px-5 border rounded-xl text-sm font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
          >
            ← Sebelumnya
          </button>
          
          {currentIndex < listSoalUjian.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((p) => p + 1)}
              className="py-2 px-5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-bold transition"
            >
              Berikutnya →
            </button>
          ) : (
            <button
              onClick={handleFinalSubmitUjian}
              disabled={isSubmittingUjian}
              className="py-2 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md transition"
            >
              {isSubmittingUjian ? "Menyimpan..." : "Selesai & Kirim Hasil ✓"}
            </button>
          )}
        </div>
      </div>

      {/* SISI KANAN: PETA NAVIGASI */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4 h-fit">
        <div className="border-b pb-2">
          <h3 className="text-sm font-bold text-black">Peta Navigasi Soal</h3>
          <p className="text-xs text-gray-400 mt-0.5">Warna hijau menandakan nomor telah terisi di browser Anda.</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {listSoalUjian.map((s, idx) => {
            const sudahIsi = s.jawaban_terpilih_id !== null;
            const sedangDibuka = idx === currentIndex;
            return (
              <button
                key={s.id_soal}
                onClick={() => setCurrentIndex(idx)}
                className={`h-10 text-xs font-bold rounded-xl transition-all border ${
                  sedangDibuka ? "border-blue-500 ring-2 ring-blue-100" : "border-transparent"
                } ${sudahIsi ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <button
            onClick={handleFinalSubmitUjian}
            disabled={isSubmittingUjian}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition shadow-sm uppercase tracking-wider"
          >
            {isSubmittingUjian ? "Memproses..." : "Submit Selesai"}
          </button>
        </div>
      </div>

    </div>
  );
}