"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface User {
  id_user: number;
  nama: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form (Tambah & Edit)
  const [nama, setNama] = useState("");
  const [role, setRole] = useState("peserta");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [perPage] = useState(10); // Jumlah baris data per halaman

  // Ambil token dari local storage
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 1. Ambil Data dengan Dukungan Query Page (READ)
  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?page=${page}&per_page=${perPage}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const resData = await res.json();
      if (res.ok) {
        setUsers(resData.data);
        setCurrentPage(resData.current_page);
        setLastPage(resData.last_page);
        setTotalData(resData.total);
      }
    } catch (err) {
      console.error("Gagal mengambil data user", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger ulang fetch data setiap kali parameter page berubah
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Buka Modal Tambah
  const openAddModal = () => {
    setEditingId(null);
    setNama("");
    setRole("peserta");
    setPassword("");
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const openEditModal = (user: User) => {
    setEditingId(user.id_user);
    setNama(user.nama);
    setRole(user.role);
    setPassword(""); 
    setIsModalOpen(true);
  };

  // 2. Submit Data (CREATE & UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = editingId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/users`;

    const method = editingId ? "PUT" : "POST";
    const bodyData = editingId ? { nama, role } : { nama, role, password };

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(bodyData),
      });

      const resData = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: resData.message || "Data berhasil disimpan!",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        
        setIsModalOpen(false);
        fetchUsers(currentPage);
        
        // Reset Form
        setNama("");
        setPassword("");
        setRole("peserta");
        setEditingId(null);
      } else {
        if (resData.errors) {
          const firstError = Object.values(resData.errors)[0] as string[];
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: firstError[0],
            confirmButtonColor: "#EF4444",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: resData.message || "Terjadi kesalahan pada server.",
            confirmButtonColor: "#EF4444",
          });
        }
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Gagal terhubung ke server: " + err.message,
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Hapus Data (DELETE)
  const handleDelete = async (id_user: number) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data user ini akan dihapus permanen dari sistem!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444", 
      cancelButtonColor: "#6B7280",  
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id_user}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          const data = await res.json();
          if (res.ok) {
            Swal.fire({
              icon: "success",
              title: "Berhasil!",
              text: data.message || "Data berhasil dihapus!",
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
            });
            fetchUsers(currentPage);
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: "Gagal menghapus data",
            confirmButtonColor: "#EF4444",
          });
        }
      }
    });
  };

  return (
    <div className="w-full p-2">
      {/* HEADER STRIP */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-stroke dark:border-strokedark">
        <div>
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Fitur Administrator</span>
          <h2 className="text-2xl font-bold text-black dark:text-white mt-1">Manajemen User</h2>
        </div>
        <button
          onClick={openAddModal}
          className="rounded-xl bg-blue-500 py-2.5 px-5 text-sm font-semibold text-white hover:bg-blue-600 transition"
        >
          + Tambah User
        </button>
      </div>

      {/* TABEL DATA (STYLE DI-SAMAKAN DENGAN PENGEMBANG SOAL) */}
      <div className="rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto p-5 pb-0">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                <th className="p-3 font-medium text-black dark:text-white">Nama</th>
                <th className="p-3 font-medium text-black dark:text-white">Role</th>
                <th className="p-3 font-medium text-black dark:text-white text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">Menarik data dari server...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">Belum ada data user terdaftar.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id_user} className="border-b border-stroke dark:border-strokedark hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="p-3 text-black dark:text-white font-medium">
                      {user.nama}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                        user.role === 'admin' ? 'bg-success text-success' : user.role === 'pengembang soal' ? 'bg-warning text-warning' : 'bg-primary text-primary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => openEditModal(user)} className="py-1.5 px-3 rounded-lg bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 transition">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(user.id_user)} className="py-1.5 px-3 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL FOOTER BAR */}
        {totalData > 0 && (
          <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-strokedark sm:px-6 bg-gray-50/50 dark:bg-gray-800/20 rounded-b-2xl">
            {/* Tampilan Responsif Mobile */}
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="disabled:opacity-40 relative inline-flex items-center rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:bg-boxdark dark:text-white"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                className="disabled:opacity-40 relative ml-3 inline-flex items-center rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:bg-boxdark dark:text-white"
              >
                Selanjutnya
              </button>
            </div>

            {/* Tampilan Desktop */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan Halaman <span className="font-bold text-black dark:text-white">{currentPage}</span> dari{" "}
                  <span className="font-bold text-black dark:text-white">{lastPage}</span> (<span className="font-medium">{totalData}</span> total user)
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark overflow-hidden" aria-label="Pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    className="disabled:opacity-30 relative inline-flex items-center px-3 py-2 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
                  >
                    « First
                  </button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="disabled:opacity-30 relative inline-flex items-center px-3 py-2 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
                  >
                    ‹ Prev
                  </button>
                  
                  {Array.from({ length: lastPage }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-bold transition-all ${
                        pageNumber === currentPage
                          ? "z-10 bg-blue-500 text-white focus:outline-none"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === lastPage}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                    className="disabled:opacity-30 relative inline-flex items-center px-3 py-2 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
                  >
                    Next ›
                  </button>
                  <button
                    disabled={currentPage === lastPage}
                    onClick={() => setCurrentPage(lastPage)}
                    className="disabled:opacity-30 relative inline-flex items-center px-3 py-2 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
                  >
                    Last »
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM (STYLE DI-SAMAKAN: BACKDROP BLUR & ROUNDED-2XL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/20 backdrop-blur p-4">
          <div className="w-full max-w-md rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6 dark:border-strokedark">
              <h3 className="text-lg font-bold text-black dark:text-white">
                {editingId ? "Edit User" : "Tambah User Baru"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4.5">
                <label className="mb-2.5 block text-sm font-semibold text-black dark:text-white">Nama</label>
                <input
                  type="text"
                  value={nama}
                  placeholder="Masukkan nama lengkap"
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-2.5 px-4 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  required
                />
              </div>

              <div className="mb-4.5">
                <label className="mb-2.5 block text-sm font-semibold text-black dark:text-white">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-2.5 px-4 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="peserta">peserta</option>
                  <option value="pengembang soal">pengembang soal</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              {!editingId && (
                <div className="mb-6">
                  <label className="mb-2.5 block text-sm font-semibold text-black dark:text-white">Password</label>
                  <input
                    type="password"
                    value={password}
                    placeholder="Masukkan password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border-[1.5px] border-stroke bg-transparent py-2.5 px-4 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 border-t border-stroke pt-4 dark:border-strokedark">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-stroke py-2 px-4 text-sm text-black dark:text-white hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-500 py-2 px-5 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}