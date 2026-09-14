import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika belum login dan mencoba akses rute terproteksi, lempar ke /login
  if (!token && pathname !== '/login' && pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Jika sudah login dan mencoba akses login/register, kembalikan ke root (/)
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. PROTEKSI KETAT BERDASARKAN ROLE
  if (token) {
    // === JIKA USER ADALAH ADMIN ===
    if (role === 'admin') {
      // Admin HANYA boleh di /user atau /admin. Jika ke rute lain, balikan ke /user
      if (pathname.startsWith('/peserta') || pathname.startsWith('/pengembang')) {
        return NextResponse.redirect(new URL('/admin/user', request.url));
      }
    }

    // === JIKA USER ADALAH PESERTA ===
    if (role === 'peserta') {
      // Peserta TIDAK BOLEH ke area admin (/user) atau area pengembang (/soal)
      if (pathname.startsWith('/admin') || pathname.startsWith('/pengembang')) {
        return NextResponse.redirect(new URL('/peserta/paket-soal', request.url)); // Sesuaikan dengan URL peserta kamu
      }
    }

    // === JIKA USER ADALAH PENGEMBANG SOAL ===
    if (role === 'pengembang soal') {
      // Pengembang TIDAK BOLEH ke area admin (/user) atau area peserta (/peserta atau /paket-soal)
      if (pathname.startsWith('/admin') || pathname.startsWith('/peserta')) {
        return NextResponse.redirect(new URL('/pengembang/paket-soal', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/admin/user/:path*',
    '/pengembang/paket-soal/:path*',
    '/pengembang/bank-soal/:path*',
    '/peserta/paket-soal/:path*',
  ],
};