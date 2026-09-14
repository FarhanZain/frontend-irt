"use client";
import React, { useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    ColumnDef,
    flexRender,
    SortingState,
} from "@tanstack/react-table";

interface SoalDetail {
    no: number;
    topik_soal: string;
    pertanyaan_soal: string;
    tingkat_kesulitan_soal: number;
    kategori_kesulitan_soal: string;
    daya_pembeda: number;
    kategori_daya_pembeda: string;
    tebakan: number;
    model_irt: string;
}

interface AnalisisSoalTableProps {
    detailSoal: SoalDetail[];
}

export const AnalisisSoal = ({ detailSoal }: AnalisisSoalTableProps) => {
    // State untuk fitur TanStack Table
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    
    // State untuk filter dropdown kustom
    const [filterTopik, setFilterTopik] = useState<string>("Semua");
    const [filterKesulitan, setFilterKesulitan] = useState<string>("Semua");
    const [filterDayaPembeda, setFilterDayaPembeda] = useState<string>("Semua");

    // 1. Ambil nama Model IRT (asumsi semua data menggunakan model IRT yang sama, ambil dari data pertama)
    const namaModelIRT = useMemo(() => {
        return detailSoal.length > 0 ? detailSoal[0].model_irt : "-";
    }, [detailSoal]);

    // 2. Logika Pemfilteran Data Berdasarkan 3 Dropdown Kustom
    const filteredData = useMemo(() => {
        return detailSoal.filter((item) => {
            const matchTopik =
                filterTopik === "Semua" ||
                item.topik_soal.toLowerCase() === filterTopik.toLowerCase();
            const matchKesulitan =
                filterKesulitan === "Semua" ||
                item.kategori_kesulitan_soal.toLowerCase() === filterKesulitan.toLowerCase();
            const matchDayaPembeda =
                filterDayaPembeda === "Semua" ||
                item.kategori_daya_pembeda.toLowerCase() === filterDayaPembeda.toLowerCase();
            return matchTopik && matchKesulitan && matchDayaPembeda;
        });
    }, [detailSoal, filterTopik, filterKesulitan, filterDayaPembeda]);

    // 3. Definisi Struktur Kolom (Kolom Model IRT dihapus)
    const columns = useMemo<ColumnDef<SoalDetail>[]>(
        () => [
            {
                accessorKey: "no",
                header: "No",
                cell: (info) => <span className="font-semibold">#{info.getValue<number>()}</span>,
            },
            {
                accessorKey: "topik_soal",
                header: "Topik",
                cell: (info) => <span className="text-gray-600 dark:text-gray-300">{info.getValue<string>()}</span>,
                enableSorting: false,
            },
            {
                accessorKey: "pertanyaan_soal",
                header: "Pertanyaan",
                cell: (info) => <span className="text-gray-600 dark:text-gray-300">{info.getValue<string>()}</span>,
                enableSorting: false,
            },
            {
                accessorKey: "tingkat_kesulitan_soal",
                header: "Nilai Tingkat Kesulitan",
                cell: (info) => <span className="font-mono">{info.getValue<number>()}</span>,
            },
            {
                accessorKey: "kategori_kesulitan_soal",
                header: "Kategori Tingkat Kesulitan",
                cell: (info) => {
                    const val = info.getValue<string>();
                    return (
                        <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${
                            val === "Susah" ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" :
                            val === "Sedang" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" :
                            "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                        }`}>
                            {val}
                        </span>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: "daya_pembeda",
                header: "Nilai Daya Pembeda",
                cell: (info) => <div className="font-mono text-center">{info.getValue<number>()}</div>,
            },
            {
                accessorKey: "kategori_daya_pembeda",
                header: "Kategori Daya Pembeda",
                cell: (info) => {
                    const val = info.getValue<string>();
                    return (
                        <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${
                            val === "Sangat Buruk" ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400" :
                            val === "Buruk" ? "bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400" :
                            val === "Cukup" ? "bg-purple-50 text-purple-500 dark:bg-purple-950/30 dark:text-purple-400" :
                            val === "Baik" ? "bg-blue-50 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400" :
                            "bg-green-50 text-green-500 dark:bg-green-950/30 dark:text-green-400"
                        }`}>
                            {val}
                        </span>
                    );
                },
                enableSorting: false,
            },
            {
                accessorKey: "tebakan",
                header: "Nilai Tebakan",
                cell: (info) => <div className="font-mono text-center">{info.getValue<number>()}</div>,
            },
        ],
        []
    );

    // 4. Inisialisasi Instance TanStack Table
    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    // Mengambil opsi unik untuk filter dropdown secara dinamis
    const opsiTopik = useMemo(() => ["Semua", ...Array.from(new Set(detailSoal.map(s => s.topik_soal)))], [detailSoal]);
    const opsiKesulitan = useMemo(() => ["Semua", ...Array.from(new Set(detailSoal.map(s => s.kategori_kesulitan_soal)))], [detailSoal]);
    const opsiDayaPembeda = useMemo(() => ["Semua", ...Array.from(new Set(detailSoal.map(s => s.kategori_daya_pembeda)))], [detailSoal]);

    // Indeks kalkulasi untuk teks info pagination bawah
    const { pageIndex, pageSize } = table.getState().pagination;
    const totalRows = table.getFilteredRowModel().rows.length;
    const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

    return (
        <div className="space-y-4">
            {/* 🛠️ BARIS FILTER (SEARCH & DROPDOWN) */}
            <div className="flex flex-col xl:flex-row gap-3 justify-between items-start xl:items-center  rounded-xl">
                {/* Komponen Search Global */}
                <div className="relative w-full xl:w-64">
                    <input
                        type="text"
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Cari topik atau pertanyaan..."
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                    />
                </div>

                {/* Komponen Dropdown Filter & Teks Model IRT */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
                    {/* Filter Topik */}
                    <div className="flex flex-col min-w-[130px]">
                        <select
                            value={filterTopik}
                            onChange={(e) => {
                                setFilterTopik(e.target.value);
                                table.setPageIndex(0);
                            }}
                            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        >
                            {opsiTopik.map(opt => <option key={opt} value={opt}>{opt === "Semua" ? "Semua Topik" : opt}</option>)}
                        </select>
                    </div>

                    {/* Filter Kesulitan */}
                    <div className="flex flex-col min-w-[130px]">
                        <select
                            value={filterKesulitan}
                            onChange={(e) => {
                                setFilterKesulitan(e.target.value);
                                table.setPageIndex(0);
                            }}
                            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        >
                            {opsiKesulitan.map(opt => <option key={opt} value={opt}>{opt === "Semua" ? "Semua Kesulitan" : opt}</option>)}
                        </select>
                    </div>

                    {/* Filter Daya Pembeda */}
                    <div className="flex flex-col min-w-[150px]">
                        <select
                            value={filterDayaPembeda}
                            onChange={(e) => {
                                setFilterDayaPembeda(e.target.value);
                                table.setPageIndex(0);
                            }}
                            className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        >
                            {opsiDayaPembeda.map(opt => <option key={opt} value={opt}>{opt === "Semua" ? "Semua Daya Pembeda" : opt}</option>)}
                        </select>
                    </div>

                    {/* 🏷️ INFO MODEL IRT (Di Sebelah Kanan Dropdown) */}
                    <div className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                        Model IRT: <span className="font-bold uppercase">{namaModelIRT}</span>
                    </div>
                </div>
            </div>

            {/* 📊 MAIN TABLE CONTAINER */}
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 dark:text-gray-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`px-4 py-3 select-none ${header.column.getCanSort() ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800" : ""}`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-1 justify-between">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className="text-gray-400">
                                                        {{
                                                            asc: " ▲",
                                                            desc: " ▼",
                                                        }[header.column.getIsSorted() as string] ?? " ↕"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-slate-900/40 transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-4 py-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                                        Tidak ada data yang cocok dengan filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🛠️ SECTION CONTROLLER PAGINATION */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 text-xs">
                    <div className="text-gray-500 dark:text-gray-400">
                        Menampilkan <span className="font-semibold">{startRow}</span> sampai{" "}
                        <span className="font-semibold">{endRow}</span> dari{" "}
                        <span className="font-semibold">{totalRows}</span> soal
                    </div>

                    {/* Container Pagination */}
                    <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className={`px-3 py-2 font-medium border-r border-gray-200 dark:border-gray-700 transition-colors ${
                                !table.getCanPreviousPage()
                                    ? "text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                            Sebelumnya
                        </button>

                        {Array.from({ length: table.getPageCount() }, (_, index) => {
                            const pageNumber = index + 1;
                            const isActive = table.getState().pagination.pageIndex === index;

                            return (
                                <button
                                    key={index}
                                    onClick={() => table.setPageIndex(index)}
                                    className={`px-3 py-2 font-medium border-r border-gray-200 dark:border-gray-700 transition-colors min-w-[36px] text-center ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400 font-bold"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className={`px-3 py-2 font-medium transition-colors ${
                                !table.getCanNextPage()
                                    ? "text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};