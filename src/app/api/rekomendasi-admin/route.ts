import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, message: 'API Key Gemini tidak ditemukan di .env.local' },
      { status: 500 }
    );
  }

  try {
    const dataIrt = await request.json();
    
    // Inisialisasi SDK @google/genai dengan benar
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Optimasi prompt agar fokus pada parameter psikometri IRT (a, b, c) dan pola respon
    const prompt = `
    Anda adalah seorang Ahli Psikometri dan Pengembang Soal Ujian. Tugas Anda adalah mengaudit kualitas butir soal menggunakan pendekatan Item Response Theory (IRT).

    --- METADATA UJIAN ---
    Nama Paket Soal: ${dataIrt.ringkasan_paket.nama_paket}
    Rata-rata Skor Global Peserta (Theta): ${dataIrt.ringkasan_paket.rata_rata_skor}
    Rekap Kategori: Mudah (${dataIrt.analisis_soal.rekap_kategori.mudah}), Sedang (${dataIrt.analisis_soal.rekap_kategori.sedang}), Susah (${dataIrt.analisis_soal.rekap_kategori.susah})

    --- DATA STATISTIK RESPON & PARAMETER BUTIR SOAL ---
    ${JSON.stringify(dataIrt.analisis_soal.detail)}

    --- ATURAN OUTPUT (STRICT CONCISENESS) ---
    - Jawab langsung TO THE POINT. 
    - Hindari kalimat basa-basi, penjelasan teori IRT, atau pengulangan kata.
    - Gunakan tabel atau poin ringkas untuk bagian anomali dan rekomendasi.

    Berikan output langsung dalam Bahasa Indonesia dengan format Markdown berikut (tanpa teks pembuka/penutup):

    ### 📊 Evaluasi Kelayakan Butir Soal
    [Tulis dalam maksimal 3 kalimat: Apakah sebaran kesulitan (parameter b) sudah proporsional untuk mengukur kemampuan peserta (Theta)?]

    ### ⚠️ Deteksi Anomali & Rekomendasi
    [Gunakan format list di bawah ini untuk merangkum soal yang bermasalah berdasarkan indikator: a < 0.3 atau negatif, ketidaksesuaian label vs tingkat kegagalan, atau c > 0.3. Jika tidak ada soal bermasalah, tulis "Tidak ditemukan anomali."]

    - [Contoh: Soal 5 | a = -0.12 (Negatif) | Indikasi salah kunci jawaban | **REVISI TOTAL** (Cek kunci jawaban)]
    - [Contoh: Soal 12 | b = 0.2 (Label Mudah), tapi 80% salah | Soal membingungkan/ambigu | **REVISI TOTAL** (Perbaiki teks soal)]
    - [Contoh: Soal 18 | c = 0.42 (Sangat Tinggi) | Pengecoh lemah, siswa menebak | **PERBAIKI OPSI** (Buat pengecoh lebih homogen)]

    ### 💡 Catatan Tambahan (Jika Ada)
    - [Maksimal 2 poin rekomendasi global untuk perbaikan bank soal ke depan].
    `;

    // Perbaikan sintaks pemanggilan generateContent untuk SDK @google/genai
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt, // Pada SDK baru, isi prompt langsung ditaruh di properti contents
    });

    return NextResponse.json({ 
      success: true, 
      rekomendasi: response.text 
    });

  } catch (error: any) {
    console.error("Error Gemini Admin API:", error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal terhubung dengan layanan analitik AI.' },
      { status: 500 }
    );
  }
}