'use client'

import { useRouter } from "next/navigation"

// Mendefinisikan tipe data untuk props
interface BackButtonProps {
  path: string;      // URL tujuan
  text: string;      // Teks yang muncul di tombol
  className?: string; // Opsional: jika ingin menambah styling dari luar
}

export function Tombol({ path, text, className }: BackButtonProps) {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.push(path)} 
      // Menggabungkan class default dengan props className jika ada
      className={`cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] ${className}`}
    >
      {text}
    </button>
  )
}