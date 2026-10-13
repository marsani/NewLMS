"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MasterCourse } from "@/types";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Hash,
  FileText,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookOpenCheck,
} from "lucide-react";

export const AdminMasterCoursesView: React.FC = () => {
  const { masterCourses, addMasterCourse, updateMasterCourse, deleteMasterCourse } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<MasterCourse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formCredits, setFormCredits] = useState(3);
  const [formDescription, setFormDescription] = useState("");

  const filtered = masterCourses.filter(
    (mc) =>
      mc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mc.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSKS = masterCourses.reduce((sum, mc) => sum + mc.credits, 0);

  const openAdd = () => {
    setEditingCourse(null);
    setFormCode("");
    setFormName("");
    setFormCredits(3);
    setFormDescription("");
    setShowModal(true);
  };

  const openEdit = (mc: MasterCourse) => {
    setEditingCourse(mc);
    setFormCode(mc.code);
    setFormName(mc.name);
    setFormCredits(mc.credits);
    setFormDescription(mc.description);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formCode.trim() || !formName.trim()) {
      showToast("Kode dan Nama Matakuliah wajib diisi!", "error");
      return;
    }
    if (editingCourse) {
      updateMasterCourse(editingCourse.id, {
        code: formCode.trim(),
        name: formName.trim(),
        credits: formCredits,
        description: formDescription.trim(),
      });
      showToast(`Matakuliah "${formName}" berhasil diperbarui.`);
    } else {
      addMasterCourse({
        code: formCode.trim(),
        name: formName.trim(),
        credits: formCredits,
        description: formDescription.trim(),
      });
      showToast(`Matakuliah "${formName}" berhasil ditambahkan.`);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const mc = masterCourses.find((m) => m.id === id);
    deleteMasterCourse(id);
    setDeletingId(null);
    showToast(`Matakuliah "${mc?.name}" berhasil dihapus.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold backdrop-blur-xl border animate-in slide-in-from-right duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500/90 text-white border-emerald-400/30"
              : "bg-red-500/90 text-white border-red-400/30"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <BookOpenCheck className="w-5 h-5 text-white" />
            </div>
            Katalog Matakuliah
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola daftar matakuliah master yang tersedia di universitas
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Matakuliah
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Matakuliah</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{masterCourses.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total SKS</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{totalSKS}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rata-rata SKS</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {masterCourses.length > 0 ? (totalSKS / masterCourses.length).toFixed(1) : "0"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari matakuliah berdasarkan kode atau nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5" />
                    Kode MK
                  </div>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Matakuliah</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SKS</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Deskripsi</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <BookOpen className="w-10 h-10" />
                      <p className="font-semibold">Belum ada matakuliah</p>
                      <p className="text-xs">Klik &quot;Tambah Matakuliah&quot; untuk menambahkan data baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((mc, idx) => (
                  <tr
                    key={mc.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-xs font-bold font-mono">
                        {mc.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{mc.name}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-extrabold">
                        {mc.credits}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xs">
                        {mc.description || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(mc)}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(mc.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
                  {editingCourse ? <Edit2 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                </div>
                {editingCourse ? "Edit Matakuliah" : "Tambah Matakuliah Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Kode MK */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Kode Matakuliah <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="IF3101"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>

              {/* Nama */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Nama Matakuliah <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Pemrograman Web & Mobile"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>

              {/* SKS */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  SKS (Satuan Kredit Semester)
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={formCredits}
                    onChange={(e) => setFormCredits(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Deskripsi Matakuliah
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Deskripsi singkat tentang matakuliah..."
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all"
              >
                {editingCourse ? "Simpan Perubahan" : "Tambah Matakuliah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Hapus Matakuliah?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Data matakuliah <strong>{masterCourses.find((m) => m.id === deletingId)?.name}</strong> akan dihapus permanen.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
