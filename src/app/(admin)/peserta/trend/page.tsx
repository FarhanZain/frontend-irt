"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ApexOptions } from "apexcharts";
import { Tombol } from "@/components/tombol/tombol";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] flex items-center justify-center text-sm text-gray-400">
      Memuat grafik tren...
    </div>
  ),
});

interface RiwayatUjianItem {
  id_ujian: number;
  paket_id: number;
  nama_paket: string;
  tipe_soal: string;
  skor_ujian: number;
  waktu_mulai: string;
  waktu_selesai: string;
}

interface TrendResponseData {
  available_tipe_soal: string[];
  filter_tipe_soal: string | null;
  jumlah_paket_dikerjakan: number;
  skor_paket_terakhir: number | null;
  nama_paket_terakhir: string | null;
  chart: {
    categories: string[];
    series: number[];
  };
  riwayat_ujian: RiwayatUjianItem[];
}

export default function TrendUjianPesertaPage() {
  const router = useRouter();
  const [selectedTipe, setSelectedTipe] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendResponseData | null>(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchTrendUjian(selectedTipe);
  }, [selectedTipe]);

  const fetchTrendUjian = async (tipe: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      // Ambil user_id dari localStorage
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            const id = parsed.id_user || parsed.id;
            if (id) params.append("user_id", String(id));
          } catch (e) {
            console.error("Gagal parse data user:", e);
          }
        }
      }

      if (tipe) {
        params.append("tipe_soal", tipe);
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/peserta/trend-ujian${queryString}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (res.ok) {
        const json = await res.json();
        setTrendData(json.data);
        // Sinkronkan filter aktif saat pertama kali halaman dimuat
        if (!tipe && json.data.filter_tipe_soal) {
          setSelectedTipe(json.data.filter_tipe_soal);
        }
      } else {
        setError("Gagal memuat data tren ujian peserta.");
      }
    } catch (err) {
      console.error("Kendala jaringan:", err);
      setError("Terjadi masalah koneksi saat mengambil data tren.");
    } finally {
      setLoading(false);
    }
  };

  const scores = trendData?.chart.series ?? [];
  const selisihSkor =
    scores.length >= 2
      ? Number((scores[scores.length - 1] - scores[scores.length - 2]).toFixed(2))
      : null;

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#3B82F6"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    markers: {
      size: 6,
      colors: ["#3B82F6"],
      strokeColors: "#FFFFFF",
      strokeWidth: 2,
      hover: { size: 8 },
    },
    dataLabels: {
      enabled: true,
      offsetY: -8,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: ["#1D4ED8"],
      },
      background: {
        enabled: true,
        borderRadius: 6,
        padding: 4,
        opacity: 0.9,
      },
    },
    xaxis: {
      categories: trendData?.chart.categories ?? [],
      labels: {
        rotate: -25,
        rotateAlways: false,
        hideOverlappingLabels: false,
        trim: false,
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
    yaxis: {
      title: {
        text: "Skor Ujian (IRT)",
        style: { color: "#6B7280", fontSize: "12px" },
      },
      labels: {
        style: { colors: "#6B7280" },
        formatter: (val) => val.toFixed(0),
      },
    },
    grid: {
      borderColor: "rgba(156, 163, 175, 0.15)",
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Poin`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Skor Ujian",
      data: trendData?.chart.series ?? [],
    },
  ];

  const availableFilters = trendData?.available_tipe_soal ?? [];

  return (
    <div className="w-full p-2 max-w-6xl mx-auto space-y-5">
      {/* Header & Filter Dinamis */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Tombol path="/peserta/paket-soal" text="← Kembali" />
          <div className="mt-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Tren Perkembangan Hasil Ujian
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pantau progres dari setiap paket ujian yang telah dikerjakan
            </p>
          </div>
        </div>

        {/* Filter Tipe Soal Sesuai yang Tersedia di Database */}
        {availableFilters.length > 0 && (
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start sm:self-auto">
            {availableFilters.map((tipe) => (
              <button
                key={tipe}
                onClick={() => setSelectedTipe(tipe)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedTipe === tipe
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                {tipe}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500 font-medium animate-pulse">
          Memuat data tren ujian...
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-white/[0.03] border border-red-200 rounded-2xl p-8 text-center text-red-500 text-sm font-medium">
          {error}
        </div>
      ) : !trendData || trendData.jumlah_paket_dikerjakan === 0 ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center space-y-2">
          <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
            Belum Ada Riwayat Ujian Terkalibrasi
          </p>
          <p className="text-sm text-gray-400">
            {trendData?.filter_tipe_soal
              ? `Anda belum memiliki hasil ujian terkalibrasi pada tipe ${trendData.filter_tipe_soal.toUpperCase()}.`
              : "Belum ada paket soal yang tersedia saat ini."}
          </p>
        </div>
      ) : (
        <>
          {/* Kartu Ringkasan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Paket Soal Dikerjakan
              </span>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {trendData.jumlah_paket_dikerjakan}{" "}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Skor Paket Terakhir
              </span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {trendData.skor_paket_terakhir ?? "-"}
                </p>
              </div>
              {trendData.nama_paket_terakhir && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {trendData.nama_paket_terakhir}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Skor Tertinggi Tercapai
              </span>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {Math.max(...trendData.chart.series)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Kategori: <span className="uppercase font-semibold">{trendData.filter_tipe_soal}</span>
              </p>
            </div>
          </div>

          {/* Grafik Trend Skor */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Grafik Progres Skor Ujian ({trendData.filter_tipe_soal?.toUpperCase()})
              </h2>
              <p className="text-xs text-gray-500">
                Diurutkan secara kronologis berdasarkan waktu penyelesaian ujian
              </p>
            </div>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={340}
            />
          </div>

          {/* Tabel Kronologis Riwayat Ujian */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Rincian Kronologis Ujian
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase text-gray-400">
                    <th className="py-3 px-4">Urutan</th>
                    <th className="py-3 px-4">Nama Paket</th>
                    <th className="py-3 px-4">Tipe</th>
                    <th className="py-3 px-4">Waktu Selesai</th>
                    <th className="py-3 px-4 text-right">Skor IRT</th>
                    <th className="py-3 px-4 text-center">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {trendData.riwayat_ujian.map((row, idx) => (
                    <tr
                      key={row.id_ujian}
                      className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02]"
                    >
                      <td className="py-3 px-4 font-semibold text-gray-500">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {row.nama_paket}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-600 uppercase">
                          {row.tipe_soal}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(row.waktu_selesai).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600">
                        {row.skor_ujian}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            router.push(`/peserta/paket-soal/${row.paket_id}/dashboard`)
                          }
                          className="text-xs font-semibold text-blue-500 hover:underline"
                        >
                          Lihat Hasil →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}