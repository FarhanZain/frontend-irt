import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Inisialisasi SDK dengan API Key dari .env.local
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        // 1. Ambil body JSON dari request
        const body = await request.json();
        
        // Extract 'data' (initialData yang dikirim oleh frontend)
        const dataIrt = body.data; 

        // Validasi pencegahan jika data kosong
        if (!dataIrt || !dataIrt.data) {
            return NextResponse.json({ success: false, message: 'Struktur data tidak valid atau kosong.' }, { status: 400 });
        }

        // Ambil nested object data agar prompt lebih rapi dan pendek
        const detailUjian = dataIrt.data;
        const infoPeserta = detailUjian.info_peserta || dataIrt.info_peserta;

        // 2. Susun prompt untuk Gemini menggunakan path objek yang sudah disesuaikan
        const prompt = `
        Anda adalah seorang mentor akademis ahli. Berdasarkan data hasil ujian online berbasis IRT (Item Response Theory) berikut, berikan analisis ringkas dan rekomendasi belajar yang personal, taktis, dan menyemangati untuk peserta bernama ${infoPeserta?.nama_peserta || infoPeserta?.nama || 'Peserta'}.

        Data Hasil Ujian:
        - Rata-rata Skor IRT: ${detailUjian.total_skor_akhir || '-'}
        - Ringkasan Jawaban: Benar ${detailUjian.statistik_jawaban?.jumlah_benar || 0}, Salah ${detailUjian.statistik_jawaban?.jumlah_salah || 0}, Kosong ${detailUjian.statistik_jawaban?.jumlah_kosong || 0}
        - Kemampuan per Sub-Materi (Kelemahan): ${JSON.stringify(detailUjian.kemampuan_per_sub_materi?.kelemahan || [])}
        - Kemampuan per Sub-Materi (Normal): ${JSON.stringify(detailUjian.kemampuan_per_sub_materi?.normal || [])}
        - Kemampuan per Sub-Materi (Kekuatan): ${JSON.stringify(detailUjian.kemampuan_per_sub_materi?.kekuatan || [])}

        Format Output yang Diminta (Gunakan Markdown):
        ### 🎯 Fokus Pembelajaran Utama (Kelemahan)
        [Sebutkan sub-materi yang masuk kategori 'kelemahan' beserta skor skalanya. Berikan tips konkret apa yang harus dipelajari kembali di topik ini].

        ### 📈 Area yang Bisa Ditingkatkan (Normal)
        [Sebutkan sub-materi yang berkategori 'normal'. Berikan strategi latihan soal agar bisa naik menjadi 'kekuatan'].

        ### 💪 Pertahankan Kekuatanmu
        [Apresiasi sub-materi yang sudah menjadi 'kekuatan' mereka].

        Catatan: Berikan jawaban langsung dalam bahasa Indonesia yang santun, kasual/semi-formal, mudah dipahami siswa, tanpa basa-basi pembuka seperti 'Baik, ini rekomendasinya...'.
        `;

        // 3. Panggil model gemini-2.5-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return NextResponse.json({ success: true, rekomendasi: response.text });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Terjadi kesalahan pada AI' },
            { status: 500 }
        );
    }
}