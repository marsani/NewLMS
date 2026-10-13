"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Faculty, StudyProgram } from "@/types";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  GraduationCap,
  ChevronRight,
  BookOpen,
  Hash,
  CheckCircle2,
  AlertCircle,
  School,
  Layers,
  ArrowLeft,
} from "lucide-react";

export const AdminFacultyView: React.FC = () => {
  const {
    faculties,
    studyPrograms,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    addStudyProgram,
    updateStudyProgram,
    deleteStudyProgram,
  } = useApp();

  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingFacultyId, setDeletingFacultyId] = useState<string | null>(null);

  const [showProdiModal, setShowProdiModal] = useState(false);
  const [editingProdi, setEditingProdi] = useState<StudyProgram | null>(null);
  const [deletingProdiId, setDeletingProdiId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Faculty Form
  const [facName, setFacName] = useState("");
  const [facCode, setFacCode] = useState("");

  // Prodi Form
  const [prodiName, setProdiName] = useState("");
  const [prodiCode, setProdiCode] = useState("");
  const [prodiDegree, setProdiDegree] = useState<"S1" | "S2" | "S3" | "D3" | "D4">("S1");

  const selectedFaculty = faculties.find((f) => f.id === selectedFacultyId);
  const facultyProdi = studyPrograms.filter((sp) => sp.facultyId === selectedFacultyId);

  const filteredFaculties = faculties.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProdiCount = (fId: string) => studyPrograms.filter((sp) => sp.facultyId === fId).length;

  // Faculty CRUD handlers
  const openAddFaculty = () => {
    setEditingFaculty(null);
    setFacName("");
    setFacCode("");
    setShowFacultyModal(true);
  };

  const openEditFaculty = (f: Faculty) => {
    setEditingFaculty(f);
    setFacName(f.name);
    setFacCode(f.code);
    setShowFacultyModal(true);
  };

  const handleSaveFaculty = () => {
    if (!facName.trim() || !facCode.trim()) {
      showToast("Nama dan kode fakultas wajib diisi!", "error");
      return;
    }
    if (editingFaculty) {
      updateFaculty(editingFaculty.id, { name: facName.trim(), code: facCode.trim().toUpperCase() });
      showToast(`Fakultas "${facName}" berhasil diperbarui.`);
    } else {
      addFaculty({ name: facName.trim(), code: facCode.trim().toUpperCase() });
      showToast(`Fakultas "${facName}" berhasil ditambahkan.`);
    }
    setShowFacultyModal(false);
  };

  const handleDeleteFaculty = (id: string) => {
    const fac = faculties.find((f) => f.id === id);
    deleteFaculty(id);
    setDeletingFacultyId(null);
    if (selectedFacultyId === id) setSelectedFacultyId(null);
    showToast(`Fakultas "${fac?.name}" dan semua program studi terkait berhasil dihapus.`);
  };

  // Prodi CRUD handlers
  const openAddProdi = () => {
    setEditingProdi(null);
    setProdiName("");
    setProdiCode("");
    setProdiDegree("S1");
    setShowProdiModal(true);
  };

  const openEditProdi = (sp: StudyProgram) => {
    setEditingProdi(sp);
    setProdiName(sp.name);
    setProdiCode(sp.code);
    setProdiDegree(sp.degree);
    setShowProdiModal(true);
  };

  const handleSaveProdi = () => {
    if (!prodiName.trim() || !prodiCode.trim()) {
      showToast("Nama dan kode program studi wajib diisi!", "error");
      return;
    }
    if (editingProdi) {
      updateStudyProgram(editingProdi.id, { name: prodiName.trim(), code: prodiCode.trim().toUpperCase(), degree: prodiDegree });
      showToast(`Program Studi "${prodiName}" berhasil diperbarui.`);
    } else {
      addStudyProgram({
        facultyId: selectedFacultyId!,
        name: prodiName.trim(),
        code: prodiCode.trim().toUpperCase(),
        degree: prodiDegree,
      });
      showToast(`Program Studi "${prodiName}" berhasil ditambahkan.`);
    }
    setShowProdiModal(false);
  };

  const handleDeleteProdi = (id: string) => {
    const sp = studyPrograms.find((s) => s.id === id);
    deleteStudyProgram(id);
    setDeletingProdiId(null);
    showToast(`Program Studi "${sp?.name}" berhasil dihapus.`);
  };

  // Color palette for faculty cards
  const facultyColors = [
    { bg: "from-blue-600 to-indigo-500", light: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", shadow: "shadow-blue-500/20" },
    { bg: "from-emerald-600 to-teal-500", light: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", shadow: "shadow-emerald-500/20" },
    { bg: "from-amber-600 to-orange-500", light: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", shadow: "shadow-amber-500/20" },
    { bg: "from-rose-600 to-pink-500", light: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", shadow: "shadow-rose-500/20" },
    { bg: "from-violet-600 to-purple-500", light: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", shadow: "shadow-violet-500/20" },
    { bg: "from-cyan-600 to-sky-500", light: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300", shadow: "shadow-cyan-500/20" },
  ];

  const getColor = (idx: number) => facultyColors[idx % facultyColors.length];

  const degreeLabels: Record<string, string> = { S1: "Sarjana (S1)", S2: "Magister (S2)", S3: "Doktor (S3)", D3: "Diploma III (D3)", D4: "Sarjana Terapan (D4)" };

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
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            Fakultas & Program Studi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola struktur organisasi fakultas dan program studi
          </p>
        </div>
        <button
          onClick={openAddFaculty}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Fakultas
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Fakultas</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{faculties.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Program Studi</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{studyPrograms.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <School className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rata-rata Prodi / Fakultas</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {faculties.length > 0 ? (studyPrograms.length / faculties.length).toFixed(1) : "0"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <Layers className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      {!selectedFacultyId && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari fakultas berdasarkan nama atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      )}

      {/* Main Content */}
      {!selectedFacultyId ? (
        /* Faculty List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaculties.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-12 border border-slate-200/80 dark:border-slate-800/80 text-center">
                <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="font-bold text-slate-500 dark:text-slate-400">Belum ada fakultas</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Klik &quot;Tambah Fakultas&quot; untuk menambahkan data baru.
                </p>
              </div>
            </div>
          ) : (
            filteredFaculties.map((fac, idx) => {
              const color = getColor(idx);
              const prodiCount = getProdiCount(fac.id);
              return (
                <div
                  key={fac.id}
                  className={`group bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-lg ${color.shadow} transition-all duration-300 cursor-pointer`}
                  onClick={() => setSelectedFacultyId(fac.id)}
                >
                  <div className={`h-2 bg-gradient-to-r ${color.bg}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl ${color.light} flex items-center justify-center shrink-0`}>
                          <Building2 className={`w-6 h-6 ${color.text}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate">{fac.name}</h3>
                          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${color.light} ${color.text}`}>
                            {fac.code}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditFaculty(fac); }}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
                          title="Edit Fakultas"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingFacultyId(fac.id); }}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                          title="Hapus Fakultas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span><strong className="text-slate-700 dark:text-slate-300">{prodiCount}</strong> Program Studi</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Selected Faculty → Study Programs */
        <div className="space-y-5">
          {/* Back Button + Faculty Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedFacultyId(null)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">{selectedFaculty?.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kode: <strong>{selectedFaculty?.code}</strong> • {facultyProdi.length} Program Studi
              </p>
            </div>
            <button
              onClick={openAddProdi}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Prodi
            </button>
          </div>

          {/* Prodi List */}
          {facultyProdi.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-12 border border-slate-200/80 dark:border-slate-800/80 text-center">
              <School className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-bold text-slate-500 dark:text-slate-400">Belum ada program studi</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Klik &quot;Tambah Prodi&quot; untuk menambahkan program studi baru ke fakultas ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {facultyProdi.map((sp, idx) => (
                <div
                  key={sp.id}
                  className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-all"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{sp.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {sp.code}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300">
                            {degreeLabels[sp.degree] || sp.degree}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditProdi(sp)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
                        title="Edit Prodi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingProdiId(sp.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                        title="Hapus Prodi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Faculty Add/Edit Modal */}
      {showFacultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center">
                  {editingFaculty ? <Edit2 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                </div>
                {editingFaculty ? "Edit Fakultas" : "Tambah Fakultas Baru"}
              </h3>
              <button onClick={() => setShowFacultyModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Nama Fakultas <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={facName}
                    onChange={(e) => setFacName(e.target.value)}
                    placeholder="Fakultas Teknologi Informasi"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Kode Fakultas <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={facCode}
                    onChange={(e) => setFacCode(e.target.value.toUpperCase())}
                    placeholder="FTI"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowFacultyModal(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                Batal
              </button>
              <button
                onClick={handleSaveFaculty}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
              >
                {editingFaculty ? "Simpan Perubahan" : "Tambah Fakultas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prodi Add/Edit Modal */}
      {showProdiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
                  {editingProdi ? <Edit2 className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                </div>
                {editingProdi ? "Edit Program Studi" : "Tambah Program Studi Baru"}
              </h3>
              <button onClick={() => setShowProdiModal(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Nama Program Studi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={prodiName}
                    onChange={(e) => setProdiName(e.target.value)}
                    placeholder="Teknik Informatika"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Kode Program Studi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={prodiCode}
                    onChange={(e) => setProdiCode(e.target.value.toUpperCase())}
                    placeholder="TI"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Jenjang Pendidikan
                </label>
                <select
                  value={prodiDegree}
                  onChange={(e) => setProdiDegree(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="S1">Sarjana (S1)</option>
                  <option value="S2">Magister (S2)</option>
                  <option value="S3">Doktor (S3)</option>
                  <option value="D3">Diploma III (D3)</option>
                  <option value="D4">Sarjana Terapan (D4)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowProdiModal(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                Batal
              </button>
              <button
                onClick={handleSaveProdi}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
              >
                {editingProdi ? "Simpan Perubahan" : "Tambah Program Studi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Faculty Confirmation */}
      {deletingFacultyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Hapus Fakultas?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <strong>{faculties.find((f) => f.id === deletingFacultyId)?.name}</strong> dan{" "}
                  <strong>{getProdiCount(deletingFacultyId)} program studi</strong> terkait akan dihapus permanen.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setDeletingFacultyId(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Batal
                </button>
                <button onClick={() => handleDeleteFaculty(deletingFacultyId)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Prodi Confirmation */}
      {deletingProdiId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Hapus Program Studi?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <strong>{studyPrograms.find((s) => s.id === deletingProdiId)?.name}</strong> akan dihapus permanen.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setDeletingProdiId(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Batal
                </button>
                <button onClick={() => handleDeleteProdi(deletingProdiId)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25">
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
