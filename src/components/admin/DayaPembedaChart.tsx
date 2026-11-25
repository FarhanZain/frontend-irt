"use client";

import React from "react";

interface DayaPembedaChartProps {
    title: string;
    labels: string[];
    series: number[];
    colors?: string[];
    modelIrt?: string; // Prop tambahan untuk mendeteksi model IRT (1PL/2PL/3PL)
}

const DayaPembedaChart: React.FC<DayaPembedaChartProps> = ({
    title,
    labels,
    series,
    colors = [],
    modelIrt = "",
}) => {
    const totalSoal = series.reduce((acc, val) => acc + val, 0);
    const isModel1PL = modelIrt.toUpperCase().includes("1PL");

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02] w-full flex flex-col justify-between">
            <h3 className="mb-5 text-sm font-semibold text-gray-700 dark:text-gray-300 self-start">
                {title}
            </h3>

            {/* Daftar Progress Bar per Kategori */}
            <div className="w-full flex flex-col gap-4 my-auto">
                {labels.map((label, index) => {
                    const jumlahSoal = series[index] ?? 0;
                    const persentase = totalSoal > 0 ? Math.round((jumlahSoal / totalSoal) * 100) : 0;
                    const barColor = colors[index] || "#3b82f6";

                    return (
                        <div key={index} className="w-full flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        ({jumlahSoal} Soal)
                                    </span>
                                    <span className="font-semibold text-gray-800 dark:text-white min-w-[38px] text-right">
                                        {persentase}%
                                    </span>
                                </div>
                            </div>

                            <div className="w-full h-2.5 bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${persentase}%`,
                                        backgroundColor: barColor,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Catatan Khusus Model 1PL */}
            {isModel1PL && (
                <div className="mt-5 pt-3">
                    <p className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-lg px-3 py-2 leading-relaxed">
                        <span className="font-semibold">Catatan :</span> Pada kalibrasi <strong>Model 1PL (One-Parameter Logistic)</strong>, seluruh butir soal diasumsikan memiliki daya pembeda yang seragam (<strong>a = 1</strong>) sehingga hanya parameter tingkat kesulitan (<strong>b</strong>) yang diestimasi. Model ini dipilih karena ukuran sampel peserta masih terbatas untuk menjaga stabilitas estimasi.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DayaPembedaChart;