"use client";
import React from "react";
import dynamic from "next/dynamic";

// Import ApexCharts secara dinamis untuk menghindari error SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DistribusiChartProps {
  title: string;
  categories: string[];
  data: number[];
  color: string;
}

export const ChartDistribusi = ({ title, categories, data, color }: DistribusiChartProps) => {

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        colors: [color],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: "55%",
                dataLabels: {
                position: "top", 
                },
            },
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val.toString();
            },
            offsetY: -20, // Mengatur jarak label agar berada di atas bar
            style: {
                fontSize: "14px",
                colors: ["#6b7280"], // Sesuaikan warna dengan tema Anda
            },
        },
        xaxis: {
            categories: categories,
            labels: {
                style: { colors: "#9ca3af", fontSize: "12px" },
            },
        },
        yaxis: {
            title: { text: "Jumlah Peserta", style: { color: "#9ca3af" } },
            labels: { style: { colors: "#9ca3af" } },
        },
        grid: {
            borderColor: "rgba(156, 163, 175, 0.1)",
        },
    };

    const series = [{ name: "Peserta", data: data }];

    return (
        <div className="w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
            <h1 className="dark:text-white/90 mb-2 font-semibold">{title}</h1>
            <Chart options={options} series={series} type="bar" height={300} />
        </div>
    );
};