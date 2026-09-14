"use client";
import MathText from "@/components/MathText";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Paket {
  id_paket: number;
  nama_paket: string;
  jadwal_mulai: string;
  jadwal_selesai: string;
  tipe_soal: string;
}

interface Topik {
  id_topik: number;
  paket_id: number;
  nama_topik: string;
  soal_count?: number;
}

interface Jawaban {
  id_jawaban_soal: number;
  teks_jawaban: string;
  is_kunci_jawaban: boolean | number;
}

interface Soal {
  id_soal: number;
  topik_id: number;
  pertanyaan: string;
  jawaban: Jawaban[];
}

export default function BankSoalPage() {
  const [currentView, setCurrentView] = useState<"paket" | "topik" | "soal">("paket");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPaket, setSelectedPaket] = useState<Paket | null>(null);
  const [selectedTopik, setSelectedTopik] = useState<Topik | null>(null);

  const [paketList, setPaketList] = useState<Paket[]>([]);
  const [topikList, setTopikList] = useState<Topik[]>([]);
  const [soalList, setSoalList] = useState<Soal[]>([]);

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [perPage] = useState(5);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // FORM STATES
  const [idPaketEdit, setIdPaketEdit] = useState<number | null>(null);
  const [namaPaket, setNamaPaket] = useState("");
  const [jadwalMulai, setJadwalMulai] = useState("");
  const [jadwalSelesai, setJadwalSelesai] = useState("");
  const [tipeSoal, setTipeSoal] = useState("utbk");

  const [idTopikEdit, setIdTopikEdit] = useState<number | null>(null);
  const [namaTopik, setNamaTopik] = useState("");

  // FORM STATE SOAL (DITAMBAHKAN id_jawaban_soal UNTUK MODE UPDATE)
  const [idSoalEdit, setIdSoalEdit] = useState<number | null>(null);
  const [pertanyaan, setPertanyaan] = useState("");
  const [pilihanJawaban, setPilihanJawaban] = useState([
    { id_jawaban_soal: 0, teks_jawaban: "" },
    { id_jawaban_soal: 0, teks_jawaban: "" },
    { id_jawaban_soal: 0, teks_jawaban: "" },
    { id_jawaban_soal: 0, teks_jawaban: "" },
  ]);
  const [kunciIndeks, setKunciIndeks] = useState<number>(0);

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (currentView === "paket") {
      fetchPaket(currentPage);
    } else if (currentView === "topik" && selectedPaket) {
      fetchTopik(selectedPaket.id_paket, currentPage);
    }
  }, [currentView, currentPage]);

  const changeView = (view: "paket" | "topik" | "soal") => {
    setCurrentPage(1);
    setCurrentView(view);
  };

  // ==================== 1. ENGINE PAKET SOAL ====================
  const fetchPaket = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-soal?page=${page}&per_page=${perPage}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const resData = await res.json();
      if (res.ok) {
        setPaketList(resData.data);
        setCurrentPage(resData.current_page);
        setLastPage(resData.last_page);
        setTotalData(resData.total);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmitPaket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEdit = idPaketEdit !== null;
    const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/paket-soal/${idPaketEdit}` : `${process.env.NEXT_PUBLIC_API_URL}/paket-soal`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ nama_paket: namaPaket, jadwal_mulai: jadwalMulai, jadwal_selesai: jadwalSelesai, tipe_soal: tipeSoal }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Berhasil!", confirmButtonColor: "#3B82F6" });
        setIsModalOpen(false);
        fetchPaket(currentPage);
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleDeletePaket = async (id: number) => {
    Swal.fire({ title: "Hapus Paket Soal?", icon: "warning", showCancelButton: true, confirmButtonColor: "#EF4444" }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-soal/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
        if (res.ok) {  Swal.fire("Terhapus!", "Paket soal berhasil dibersihkan.", "success"); fetchPaket(currentPage); }
      }
    });
  };

  // ==================== 2. ENGINE TOPIK SOAL ====================
  const fetchTopik = async (paketId: number, page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topik/paket/${paketId}?page=${page}&per_page=${perPage}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const resData = await res.json();
      if (res.ok) {
        setTopikList(resData.data);
        setCurrentPage(resData.current_page);
        setLastPage(resData.last_page);
        setTotalData(resData.total);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleActionDetailPaket = (paket: Paket) => {
    setSelectedPaket(paket);
    fetchTopik(paket.id_paket, 1);
    changeView("topik");
  };

  const handleSubmitTopik = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaket) return;
    setIsSubmitting(true);
    const isEdit = idTopikEdit !== null;
    const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/topik/${idTopikEdit}` : `${process.env.NEXT_PUBLIC_API_URL}/topik`;
    const method = isEdit ? "PUT" : "POST";
    const body = isEdit ? { nama_topik: namaTopik } : { paket_id: selectedPaket.id_paket, nama_topik: namaTopik };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      if (res.ok) { Swal.fire({ icon: "success", title: "Berhasil!" }); setIsModalOpen(false); fetchTopik(selectedPaket.id_paket, currentPage); }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteTopik = async (id: number) => {
    if (!selectedPaket) return;
    Swal.fire({ title: "Hapus Topik?", icon: "warning", showCancelButton: true, confirmButtonColor: "#EF4444" }).then(async (resConfirm) => {
      if (resConfirm.isConfirmed) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topik/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
        fetchTopik(selectedPaket.id_paket, currentPage);
      }
    });
  };

  // ==================== 3. ENGINE SOAL (CREATE & UPDATE DI SINI) ====================
  const fetchSoal = async (topikId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/soal/topik/${topikId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) setSoalList(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleActionDetailTopik = (topik: Topik) => {
    setSelectedTopik(topik);
    fetchSoal(topik.id_topik);
    changeView("soal");
  };

  const handlePilihanTeksChange = (index: number, val: string) => {
    const updated = [...pilihanJawaban];
    updated[index].teks_jawaban = val;
    setPilihanJawaban(updated);
  };

  // Trigger Aksi Edit Butir Soal (Mengisi form modal dengan data lama)
  const handleActionEditSoal = (sl: Soal) => {
    setIdSoalEdit(sl.id_soal);
    setPertanyaan(sl.pertanyaan);
    
    // Petakan 4 pilihan jawaban lama beserta ID-nya masing-masing
    const mappedPilihan = sl.jawaban.map((jwb) => ({
      id_jawaban_soal: jwb.id_jawaban_soal,
      teks_jawaban: jwb.teks_jawaban
    }));
    setPilihanJawaban(mappedPilihan);

    // Cari tahu indeks ke berapa yang memiliki status kunci jawaban true
    const indeksKunci = sl.jawaban.findIndex((jwb) => jwb.is_kunci_jawaban == true || jwb.is_kunci_jawaban == 1);
    setKunciIndeks(indeksKunci !== -1 ? indeksKunci : 0);
    
    setIsModalOpen(true);
  };

  const handleSubmitSoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopik) return;
    setIsSubmitting(true);

    const isEdit = idSoalEdit !== null;
    const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/soal/${idSoalEdit}` : `${process.env.NEXT_PUBLIC_API_URL}/soal`;
    const method = isEdit ? "PUT" : "POST";

    const payload = isEdit 
      ? { pertanyaan, pilihan: pilihanJawaban, kunci_indeks: kunciIndeks }
      : { topik_id: selectedTopik.id_topik, pertanyaan, pilihan: pilihanJawaban.map(p => ({ teks_jawaban: p.teks_jawaban })), kunci_indeks: kunciIndeks };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: isEdit ? "Soal Diperbarui!" : "Soal Tersimpan!", confirmButtonColor: "#3B82F6" });
        setIsModalOpen(false);
        fetchSoal(selectedTopik.id_topik);
      }
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteSoal = async (id: number) => {
    if (!selectedTopik) return;
    const confirm = await Swal.fire({ title: "Hapus Butir Soal?", icon: "warning", showCancelButton: true, confirmButtonColor: "#EF4444" });
    if (confirm.isConfirmed) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/soal/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      fetchSoal(selectedTopik.id_topik);
    }
  };

  // ==================== PAGINATION CONTROL COMPONENT ====================
  const RenderPaginationController = () => {
    if (currentView === "soal" || totalData === 0) return null;
    return (
      <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-strokedark sm:px-6 bg-gray-50/50 rounded-b-2xl">
        <div className="flex flex-1 justify-between sm:hidden">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="disabled:opacity-40 relative px-4 py-2 text-sm font-medium border bg-white rounded-lg">Sebelumnya</button>
          <button disabled={currentPage === lastPage} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))} className="disabled:opacity-40 relative ml-3 px-4 py-2 text-sm font-medium border bg-white rounded-lg">Selanjutnya</button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">Menampilkan Halaman <span className="font-bold text-black dark:text-white">{currentPage}</span> dari <span className="font-bold text-black dark:text-white">{lastPage}</span> (<span className="font-medium">{totalData}</span> total data)</p>
          <nav className="isolate inline-flex -space-x-px rounded-xl bg-white border border-stroke" aria-label="Pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="disabled:opacity-30 px-3 py-2 text-sm">« First</button>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="disabled:opacity-30 px-3 py-2 text-sm">‹ Prev</button>
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((pNum) => (
              <button key={pNum} onClick={() => setCurrentPage(pNum)} className={`px-4 py-2 text-sm font-bold ${pNum === currentPage ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}>{pNum}</button>
            ))}
            <button disabled={currentPage === lastPage} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))} className="disabled:opacity-30 px-3 py-2 text-sm">Next ›</button>
            <button disabled={currentPage === lastPage} onClick={() => setCurrentPage(lastPage)} className="disabled:opacity-30 px-3 py-2 text-sm">Last »</button>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-2">
      {/* HEADER STRIP */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-stroke">
        <div>
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Fitur Pengembang Bank Soal</span>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-lg font-semibold text-black dark:text-white cursor-pointer hover:underline" onClick={() => changeView("paket")}>Paket Soal</h2>
            {currentView !== "paket" && selectedPaket && (
              <><span className="text-gray-400">/</span><h2 className="text-lg font-semibold text-black dark:text-white cursor-pointer hover:underline" onClick={() => handleActionDetailPaket(selectedPaket)}>{selectedPaket.nama_paket}</h2></>
            )}
            {currentView === "soal" && selectedTopik && (
              <><span className="text-gray-400">/</span><h2 className="text-lg font-semibold text-black">Topik: {selectedTopik.nama_topik}</h2></>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            if (currentView === "paket") { setIdPaketEdit(null); setNamaPaket(""); setTipeSoal("utbk"); setJadwalMulai(""); setJadwalSelesai(""); }
            else if (currentView === "topik") { setIdTopikEdit(null); setNamaTopik(""); }
            else if (currentView === "soal") { setIdSoalEdit(null); setPertanyaan(""); setKunciIndeks(0); setPilihanJawaban([{ id_jawaban_soal: 0, teks_jawaban: "" }, { id_jawaban_soal: 0, teks_jawaban: "" }, { id_jawaban_soal: 0, teks_jawaban: "" }, { id_jawaban_soal: 0, teks_jawaban: "" }]); }
            setIsModalOpen(true);
          }}
          className="rounded-xl bg-blue-500 py-2.5 px-5 text-sm font-semibold text-white hover:bg-blue-600"
        >
          {currentView === "paket" && "+ Buat Paket Baru"}
          {currentView === "topik" && "+ Tambah Topik Baru"}
          {currentView === "soal" && "+ Tulis Butir Soal"}
        </button>
      </div>

      {/* VIEW 1: TABEL PAKET */}
      {currentView === "paket" && (
        <div className="rounded-2xl border border-stroke bg-white dark:bg-boxdark">
          <div className="max-w-full overflow-x-auto p-5 pb-0">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                  <th className="p-3 font-medium text-black dark:text-white">Nama Paket Soal</th>
                  <th className="p-3 font-medium text-black dark:text-white">Tipe</th>
                  <th className="p-3 font-medium text-black dark:text-white text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-500">Memuat paket soal...</td></tr>
                ) : paketList.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-500">Belum ada paket soal terdaftar.</td></tr>
                ) : paketList.map((pkt) => (
                  <tr key={pkt.id_paket} className="border-b border-stroke hover:bg-gray-50/50">
                    <td className="p-3 font-medium text-black dark:text-white">{pkt.nama_paket}</td>
                    <td className="p-3"><span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-bold uppercase">{pkt.tipe_soal}</span></td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleActionDetailPaket(pkt)} className="py-1.5 px-3 rounded-lg bg-emerald-500 text-white text-xs font-semibold">Detail / Topik</button>
                        <button onClick={() => { setIdPaketEdit(pkt.id_paket); setNamaPaket(pkt.nama_paket); setTipeSoal(pkt.tipe_soal); setJadwalMulai(pkt.jadwal_mulai.substring(0,16)); setJadwalSelesai(pkt.jadwal_selesai.substring(0,16)); setIsModalOpen(true); }} className="py-1.5 px-2.5 rounded-lg bg-yellow-500 text-white text-xs font-semibold">Edit</button>
                        <button onClick={() => handleDeletePaket(pkt.id_paket)} className="py-1.5 px-2.5 rounded-lg bg-red-500 text-white text-xs font-semibold">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <RenderPaginationController />
        </div>
      )}

      {/* VIEW 2: TABEL TOPIK */}
      {currentView === "topik" && (
        <div className="rounded-2xl border border-stroke bg-white dark:bg-boxdark">
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => changeView("paket")} className="text-sm font-medium text-blue-500 hover:underline">← Kembali ke Daftar Paket</button>
              <span className="text-sm font-semibold text-gray-500">Paket Soal: {selectedPaket?.nama_paket}</span>
            </div>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                  <th className="p-3 font-medium text-black dark:text-white">Nama Topik</th>
                  <th className="p-3 font-medium text-black dark:text-white">Jumlah Soal</th>
                  <th className="p-3 font-medium text-black dark:text-white text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-6">Memuat topik...</td></tr>
                ) : topikList.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-gray-500">Belum ada topik di dalam paket ini.</td></tr>
                ) : topikList.map((tpk) => (
                  <tr key={tpk.id_topik} className="border-b border-stroke">
                    <td className="p-3 font-medium text-black dark:text-white">{tpk.nama_topik}</td>
                    <td className="p-3 text-sm font-bold">{tpk.soal_count ?? 0} butir</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleActionDetailTopik(tpk)} className="py-1.5 px-3 rounded-lg bg-indigo-500 text-white text-xs font-semibold">Kelola Soal</button>
                        <button onClick={() => { setIdTopikEdit(tpk.id_topik); setNamaTopik(tpk.nama_topik); setIsModalOpen(true); }} className="py-1.5 px-2.5 rounded-lg bg-yellow-500 text-white text-xs font-semibold">Edit</button>
                        <button onClick={() => handleDeleteTopik(tpk.id_topik)} className="py-1.5 px-2.5 rounded-lg bg-red-500 text-white text-xs font-semibold">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <RenderPaginationController />
        </div>
      )}

      {/* VIEW 3: DAFTAR BUTIR PERTANYAAN (DITAMBAHKAN TOMBOL EDIT) */}
      {currentView === "soal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-boxdark p-4 rounded-xl border border-stroke">
            <button onClick={() => { if(selectedPaket) handleActionDetailPaket(selectedPaket); }} className="text-sm font-medium text-blue-500 hover:underline">← Kembali ke Daftar Topik</button>
            <span className="text-sm text-gray-500 font-semibold">Topik : {selectedTopik?.nama_topik}</span>
          </div>

          {loading ? ( 
            <div className="p-6 text-center bg-white rounded-xl">Memuat butir soal...</div> 
          ) : soalList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl dark:bg-boxdark text-gray-400">Topik ini masih kosong. Silakan klik "+ Tulis Butir Soal" di atas.</div>
          ) : soalList.map((sl, idx) => (
            <div key={sl.id_soal} className="p-6 bg-white dark:bg-boxdark border border-stroke rounded-2xl  relative">
              
              {/* BUTTON AKSI POJOK KANAN ATAS (EDIT & HAPUS) */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button onClick={() => handleActionEditSoal(sl)} className="text-xs font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 py-1 px-2.5 rounded-lg transition">
                  Edit Soal
                </button>
                <button onClick={() => handleDeleteSoal(sl.id_soal)} className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 py-1 px-2.5 rounded-lg transition">
                  Hapus
                </button>
              </div>

              <h4 className="text-base font-bold text-black dark:text-white mb-3">Pertanyaan {soalList.length - idx}:</h4>
              <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap font-medium">
                {/* {sl.pertanyaan} */}
                <MathText text={sl.pertanyaan} />
                </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sl.jawaban.map((jwb, oIdx) => (
                  <div key={jwb.id_jawaban_soal} className={`p-3 rounded-xl border flex items-center gap-3 ${jwb.is_kunci_jawaban ? "bg-emerald-50/70 border-emerald-500" : "bg-gray-50/50 border-gray-200"}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${jwb.is_kunci_jawaban ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"}`}>{String.fromCharCode(65 + oIdx)}</span>
                    <span className="text-sm font-medium text-black dark:text-white grow">
                      {/* {jwb.teks_jawaban} */}
                      <MathText text={jwb.teks_jawaban} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL MULTIFUNGSI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-boxdark rounded-2xl border border-stroke my-auto">
            <div className="border-b border-stroke py-4 px-6">
              <h3 className="text-lg font-bold text-black dark:text-white">
                {currentView === "paket" && (idPaketEdit ? "Perbarui Parameter Paket" : "Form Pembuatan Paket Ujian")}
                {currentView === "topik" && (idTopikEdit ? "Ubah Nama Topik" : "Tambah Topik Baru")}
                {currentView === "soal" && (idSoalEdit ? "Edit Butir Pertanyaan" : "Tulis Konstruksi Soal Ujian")}
              </h3>
            </div>

            <form onSubmit={currentView === "paket" ? handleSubmitPaket : currentView === "topik" ? handleSubmitTopik : handleSubmitSoal} className="p-6">
              {currentView === "paket" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Nama Paket Ujian</label>
                    <input type="text" value={namaPaket} onChange={(e) => setNamaPaket(e.target.value)} className="w-full rounded-xl border py-2.5 px-4" required placeholder="Masukkan nama paket soal" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Tipe Tingkatan Soal</label>
                    <select value={tipeSoal} onChange={(e) => setTipeSoal(e.target.value)} className="w-full rounded-xl border py-2.5 px-4">
                      <option value="utbk">UTBK</option>
                      <option value="sd">Sekolah Dasar (SD)</option>
                      <option value="smp">Sekolah Menengah Pertama (SMP)</option>
                      <option value="sma">Sekolah Menengah Atas (SMA)</option>
                      <option value="umum">Umum</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black dark:text-white">Waktu Mulai Terbuka</label>
                      <input type="datetime-local" value={jadwalMulai} onChange={(e) => setJadwalMulai(e.target.value)} className="w-full rounded-xl border border-stroke bg-transparent py-2.5 px-4 text-sm text-black outline-none focus:border-primary dark:border-form-strokedark dark:text-white" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-black dark:text-white">Waktu Selesai Ditutup</label>
                      <input type="datetime-local" value={jadwalSelesai} onChange={(e) => setJadwalSelesai(e.target.value)} className="w-full rounded-xl border border-stroke bg-transparent py-2.5 px-4 text-sm text-black outline-none focus:border-primary dark:border-form-strokedark dark:text-white" required />
                    </div>
                  </div>
                </div>
              )}

              {currentView === "topik" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">Nama Topik</label>
                  <input type="text" value={namaTopik} onChange={(e) => setNamaTopik(e.target.value)} className="w-full rounded-xl border py-2.5 px-4" required placeholder="Masukkan nama topik" />
                </div>
              )}

              {currentView === "soal" && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-black">Teks Narasi Pertanyaan</label>
                    <textarea rows={4} value={pertanyaan} onChange={(e) => setPertanyaan(e.target.value)} className="w-full rounded-xl border border-stroke bg-transparent py-2 px-3 text-sm" required />
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <label className="mb-2 block text-xs font-bold tracking-wider uppercase text-gray-400">Opsi Jawaban & Kunci Radio</label>
                    <div className="space-y-3">
                      {pilihanJawaban.map((pil, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border">
                          <label className="flex items-center cursor-pointer gap-1">
                            <input type="radio" name="kunci_jawaban_radio" checked={kunciIndeks === idx} onChange={() => setKunciIndeks(idx)} className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold px-2 py-0.5 bg-white border rounded">{String.fromCharCode(65 + idx)}</span>
                          </label>
                          <input type="text" value={pil.teks_jawaban} onChange={(e) => handlePilihanTeksChange(idx, e.target.value)} className="grow text-sm bg-white border rounded-lg py-2 px-3 outline-none" required />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border py-2 px-4 text-sm">Batal</button>
                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-500 py-2 px-5 text-sm font-semibold text-white hover:bg-blue-600">
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}