"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Award,
  Download,
  GraduationCap,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { exportToCSV } from "@/lib/utils";

export const GradesView: React.FC = () => {
  const { currentUser, userGrades, userCourses } = useApp();
  const [selectedCourseForGradebook, setSelectedCourseForGradebook] = useState(userCourses[0]?.id || "");

  React.useEffect(() => {
    if (!selectedCourseForGradebook && userCourses.length > 0) {
      setSelectedCourseForGradebook(userCourses[0].id);
    }
  }, [userCourses, selectedCourseForGradebook]);

  // Student calculations
  const totalSKS = userGrades.reduce((acc, g) => acc + g.credits, 0);
  const totalPoints = userGrades.reduce((acc, g) => acc + g.gradePoint * g.credits, 0);
  const calculatedGPA = (totalPoints / (totalSKS || 1)).toFixed(2);

  // Dosen Gradebook Mock Matrix
  const mockClassCohort = [
    {
      nim: "2101001",
      name: "Ahmad Fauzi",
      attendance: 100,
      assignment: 95,
      quiz: 90,
      uts: 92,
      uas: 94,
      total: 93.5,
      letter: "A",
    },
    {
      nim: "2101002",
      name: "Siti Rahmawati",
      attendance: 90,
      assignment: 88,
      quiz: 85,
      uts: 87,
      uas: 89,
      total: 87.8,
      letter: "A-",
    },
    {
      nim: "2101003",
      name: "Budi Pratama",
      attendance: 85,
      assignment: 80,
      quiz: 78,
      uts: 82,
      uas: 84,
      total: 81.6,
      letter: "B+",
    },
    {
      nim: "2101004",
      name: "Dewi Lestari",
      attendance: 95,
      assignment: 90,
      quiz: 92,
      uts: 89,
      uas: 91,
      total: 91.2,
      letter: "A",
    },
  ];

  const handleExportGradebook = () => {
    const activeC = userCourses.find((c) => c.id === selectedCourseForGradebook) || userCourses[0];
    if (!activeC) return;
    exportToCSV(`Rekap_Nilai_${activeC.code}_${activeC.name.replace(/\s+/g, "_")}.csv`, mockClassCohort);
  };

  if (userCourses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            {currentUser.role === "DOSEN"
              ? "Buku Rekapitulasi Nilai (Gradebook)"
              : "Transkrip & Rekap Nilai Akademik"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.role === "DOSEN"
              ? "Kelola rekap nilai akumulatif per matakuliah dan ekspor format CSV/Excel."
              : "Pantau perolehan nilai, estimasi IPK semester, dan kelulusan SKS Anda."}
          </p>
        </div>

        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Belum Ada Data Nilai Kelas
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Akun Dosen Anda belum mengampu kelas aktif untuk rekapitulasi nilai mahasiswa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            {currentUser.role === "DOSEN"
              ? "Buku Rekapitulasi Nilai (Gradebook)"
              : "Transkrip & Rekap Nilai Akademik"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.role === "DOSEN"
              ? "Kelola rekap nilai akumulatif per matakuliah dan ekspor format CSV/Excel."
              : "Pantau perolehan nilai, estimasi IPK semester, dan kelulusan SKS Anda."}
          </p>
        </div>

        {currentUser.role === "DOSEN" && (
          <button
            onClick={handleExportGradebook}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start"
          >
            <Download className="w-4 h-4" /> Ekspor ke Format CSV / Excel
          </button>
        )}
      </div>

      {/* STUDENT TRANSCRIPT VIEW */}
      {currentUser.role === "STUDENT" && (
        <div className="space-y-6">
          {/* GPA Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-lg space-y-1">
              <p className="text-xs text-blue-200 font-medium">Indeks Prestasi Semester (IPS)</p>
              <h3 className="text-3xl font-black">{calculatedGPA}</h3>
              <p className="text-[11px] text-blue-200">Skala 4.00 • Predikat: Dengan Pujian</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-medium">Beban SKS Semester Aktif</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{totalSKS} SKS</h3>
              <p className="text-[11px] text-emerald-600 font-semibold">100% Selesai Terakreditasi</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <p className="text-xs text-slate-500 font-medium">Total Matakuliah Lulus</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {userGrades.length} Matakuliah
              </h3>
              <p className="text-[11px] text-slate-400">Tahun Akademik 2026/2027 Ganjil</p>
            </div>
          </div>

          {/* Detailed Grades Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> Rincian Nilai Komponen Matakuliah
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Kode & Matakuliah</th>
                    <th className="py-3 px-3 text-center">SKS</th>
                    <th className="py-3 px-3 text-center">Presensi (10%)</th>
                    <th className="py-3 px-3 text-center">Tugas (25%)</th>
                    <th className="py-3 px-3 text-center">Kuis (15%)</th>
                    <th className="py-3 px-3 text-center">UTS (25%)</th>
                    <th className="py-3 px-3 text-center">UAS (25%)</th>
                    <th className="py-3 px-3 text-center">Nilai Akhir</th>
                    <th className="py-3 px-4 text-center">Huruf / Bobot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {userGrades.map((item) => (
                    <tr key={item.courseId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-600">{item.courseCode}</span>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {item.courseName}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold">{item.credits}</td>
                      <td className="py-3.5 px-3 text-center">{item.attendanceScore}</td>
                      <td className="py-3.5 px-3 text-center">{item.assignmentScore}</td>
                      <td className="py-3.5 px-3 text-center">{item.quizScore}</td>
                      <td className="py-3.5 px-3 text-center">{item.midtermScore}</td>
                      <td className="py-3.5 px-3 text-center">{item.finalScore}</td>
                      <td className="py-3.5 px-3 text-center font-extrabold text-blue-600">
                        {item.totalScore}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {item.letterGrade} ({item.gradePoint.toFixed(2)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DOSEN GRADEBOOK VIEW */}
      {currentUser.role === "DOSEN" && (
        <div className="space-y-6">
          {/* Course Selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500">Pilih Kelas Matakuliah:</label>
            <select
              value={selectedCourseForGradebook}
              onChange={(e) => setSelectedCourseForGradebook(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {userCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Matrix Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Matriks Nilai Mahasiswa (Kelas A)
                </h3>
                <p className="text-xs text-slate-400">Total 4 Mahasiswa Terdaftar pada Kelas Ini</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">NIM</th>
                    <th className="py-3 px-4">Nama Mahasiswa</th>
                    <th className="py-3 px-3 text-center">Presensi (10%)</th>
                    <th className="py-3 px-3 text-center">Tugas (25%)</th>
                    <th className="py-3 px-3 text-center">Kuis (15%)</th>
                    <th className="py-3 px-3 text-center">UTS (25%)</th>
                    <th className="py-3 px-3 text-center">UAS (25%)</th>
                    <th className="py-3 px-3 text-center">Nilai Akhir</th>
                    <th className="py-3 px-4 text-center">Huruf Mutu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mockClassCohort.map((m) => (
                    <tr key={m.nim} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{m.nim}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{m.name}</td>
                      <td className="py-3 px-3 text-center">{m.attendance}</td>
                      <td className="py-3 px-3 text-center">{m.assignment}</td>
                      <td className="py-3 px-3 text-center">{m.quiz}</td>
                      <td className="py-3 px-3 text-center">{m.uts}</td>
                      <td className="py-3 px-3 text-center">{m.uas}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-blue-600">
                        {m.total}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {m.letter}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
