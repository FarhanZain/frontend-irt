"use client"; // Pastikan ada directive client component di baris paling atas

import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// 1. Load ReactApexChart secara dinamis hanya di sisi client
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
    loading: () => <div className="h-[280px] flex items-center justify-center text-gray-400">Loading Chart...</div>
});

interface PieChartProps {
    title: string;
    labels: string[];
    series: number[];
    colors: string[];
}

const KomposisiPieChart: React.FC<PieChartProps> = ({ title, labels, series, colors }) => {
    const options: ApexOptions = {
        chart: {
            type: "pie",
        },
        theme: {
            mode: "light",
        },
        stroke: {
            show: false,
            width: 0,
        },
        labels: labels,
        colors: colors,
        legend: {
            show: false,
        },
        tooltip: {
            enabled: false,
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    offset: -30,
                    minAngleToShowLabel: 10
                }
            },
        },
        dataLabels: {
            enabled: true,
            distributed: false,
            formatter: function (val: number) {
                return `${Math.round(val)}%`;
            },
            style: {
                fontSize: "16px",
                fontWeight: "700",
            },
            dropShadow: {
                enabled: false,
            },
            background: {
                enabled: false,
            }
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                chart: {
                    width: 250,
                },
                },
            },
        ],
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02] w-full flex flex-col items-center">
            <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300 self-start">{title}</h3>
            <div className="w-full flex justify-center items-center min-h-[280px] pie-chart-white-label">
                {/* 2. Komponen chart sekarang aman dirender */}
                <ReactApexChart options={options} series={series} type="pie" width="100%" />
            </div>
            <div className="w-full">
                <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
                    {labels.map((label, index) => (
                        <div key={index} className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-400">
                            {/* Teks Kategori dan Jumlah Soal */}
                            <div className="text-center">
                                <p className="text-sm">{label}</p>
                                <p className="font-semibold" style={{ color: colors[index] }}>{series[index]} Soal</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KomposisiPieChart;