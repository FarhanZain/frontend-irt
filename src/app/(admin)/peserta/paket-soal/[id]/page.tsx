"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Tombol } from "@/components/tombol/tombol";

interface DetailPaketState {
    paket: {
        id_paket: number;
        nama_paket: string;
        tipe_soal: string;
        topik: Array<{ id_topik: number; nama_topik: string; soal_count: number }>;
    };
    jumlah_topik: number;
    jumlah_soal_keseluruhan: number;
    status_pengerjaan: string;
    status_hasil: string;
    id_ujian: number | null;
}

export default function DetailDeskripsiPraUjian() {
    const params = useParams();
    const router = useRouter();
    const idPaket = params.id;

    const [loading, setLoading] = useState(true);
    const [detailPaket, setDetailPaket] = useState<DetailPaketState | null>(null);

    const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (idPaket) {
            fetchDetailPaket();
            console.log("Data detail paket berhasil diambil:", detailPaket);
        }
    }, [idPaket]);

    const fetchDetailPaket = async () => {
        setLoading(true);
        try {
            let userIdParam = "";
            
            // Ambil data user dari localStorage untuk disuntikkan ke URL param
            if (typeof window !== "undefined") {
                const savedUser = localStorage.getItem("user"); // Sesuaikan nama key penampung data user kamu
                if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    const id = parsed.id_user || parsed.id;
                    if (id) userIdParam = `?user_id=${id}`;
                } catch (e) {
                    console.error("Gagal parse data user untuk detail paket", e);
                }
                }
            }

            // Ambil data detail dengan menyertakan id paket dan parameter user_id
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peserta/paket/${idPaket}${userIdParam}`, {
                method: "GET",
                headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}` 
                },
            });

            if (res.ok) {
                const data = await res.json();
                setDetailPaket(data);
            } else {
                console.error("Gagal mengambil respon detail paket, status:", res.status);
            }
        } catch (err) {
            console.error("Terjadi kendala jaringan:", err);
        } finally {
            setLoading(false);
        }
    };

    const KonfirmasiMasukUjian = async () => {
        const confirm = await Swal.fire({
        title: "Mulai Ujian Sekarang?",
        text: "Sesi ujian akan dibuat dan timer waktu segera berjalan secara realtime.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3B82F6",
        cancelButtonColor: "#9CA3AF",
        confirmButtonText: "Ya, Buka Lembar Soal"
        });

        if (confirm.isConfirmed) {
        // Pindah URL masuk ke ruang ujian mandiri
        router.push(`/peserta/paket-soal/${idPaket}/ujian`);
        }
    };

    const HasilUjian = () => {
        router.push(`/peserta/paket-soal/${idPaket}/dashboard`);
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Sinkronisasi Dokumen...</div>;
    }

    if (!detailPaket) {
        return <div className="p-8 text-center text-red-500">Gagal mengambil informasi dokumen paket soal.</div>;
    }

    return (
        <div className="w-full p-2 max-w-6xl mx-auto">
            <Tombol path={`/peserta/paket-soal`} text="← Kembali" />

            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 mt-4">
                <div className="border-b pb-4">
                    <span className="text-xs font-bold uppercase text-blue-500 tracking-wider">Paket Soal</span>
                    <h2 className="text-xl font-bold text-black mt-1">{detailPaket.paket.nama_paket}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border">
                        <span className="text-xs text-gray-400 block font-semibold">JUMLAH TOPIK</span>
                        <span className="text-lg font-bold text-black">{detailPaket.jumlah_topik} Topik</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border">
                        <span className="text-xs text-gray-400 block font-semibold">JUMLAH SOAL</span>
                        <span className="text-lg font-bold text-black">{detailPaket.jumlah_soal_keseluruhan} Soal</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border">
                        <span className="text-xs text-gray-400 block font-semibold">TINGKATAN</span>
                        <span className="text-lg font-bold text-blue-600 uppercase">{detailPaket.paket.tipe_soal}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-black">Distribusi Soal Berdasarkan Topik:</h4>
                    <div className="bg-gray-50 rounded-xl border overflow-hidden">
                        {detailPaket.paket.topik.map((tp, index) => (
                        <div key={tp.id_topik} className="flex justify-between items-center p-3 text-sm border-b last:border-0 bg-white">
                            <span className="font-medium text-gray-700">{index + 1}. {tp.nama_topik}</span>
                            <span className="font-bold text-black bg-gray-100 py-0.5 px-2.5 rounded-md text-xs">{tp.soal_count} Butir</span>
                        </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex gap-4 justify-end">
                    {detailPaket.status_pengerjaan === "sudah_selesai" || detailPaket.jumlah_topik === 0  || detailPaket.jumlah_soal_keseluruhan === 0 ? (
                        <button disabled className="bg-gray-100 text-gray-500 font-semibold py-3 px-6 rounded-xl cursor-not-allowed text-sm">
                        {detailPaket.status_pengerjaan === "sudah_selesai" ? "Sesi Ujian Telah Selesai" : "Paket Soal Belum Lengkap"}
                        </button>
                    ) : (
                        <button
                        onClick={KonfirmasiMasukUjian}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl text-sm  transition"
                        >
                        Mulai Sesi Ujian Sekarang
                        </button>
                    )}
                    {detailPaket.status_hasil === "tidak ada hasil" ? (
                        <button className="font-semibold py-3 px-6 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed">
                        Belum Ada Hasil Ujian
                        </button>
                    ) : (
                        <button onClick={HasilUjian} className="font-semibold py-3 px-6 rounded-xl text-sm bg-blue-500 text-white hover:bg-blue-600">
                        Lihat Hasil Ujian
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}