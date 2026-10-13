"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  MOCK_SEMESTERS,
  MOCK_STUDENT_SEMESTER_RECAPS,
  MOCK_DOSEN_SEMESTER_REPORTS,
  MOCK_ADMIN_SEMESTER_ANALYTICS,
} from "@/data/mockData";
import { exportToCSV } from "@/lib/utils";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  Users,
  GraduationCap,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Zap,
  AlertTriangle,
  QrCode,
  Layers,
} from "lucide-react";

export const SemesterReportView: React.FC = () => {
  const { currentUser, userCourses } = useApp();
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("sem-2025-genap"); // Default to completed semester

  const selectedSemester =
    MOCK_SEMESTERS.find((s) => s.id === selectedSemesterId) || MOCK_SEMESTERS[0];

  // Data sources
  const studentRecap =
    MOCK_STUDENT_SEMESTER_RECAPS[selectedSemesterId] ||
    MOCK_STUDENT_SEMESTER_RECAPS["sem-2025-genap"];

  const dosenReport =
    MOCK_DOSEN_SEMESTER_REPORTS[selectedSemesterId] ||
    MOCK_DOSEN_SEMESTER_REPORTS["sem-2025-genap"];

  const adminAnalytics =
    MOCK_ADMIN_SEMESTER_ANALYTICS[selectedSemesterId] ||
    MOCK_ADMIN_SEMESTER_ANALYTICS["sem-2025-genap"];

  // Print handler
  const handlePrintPDF = () => {
    window.print();
  };

  // Export CSV handler
  const handleExportAdminCSV = () => {
    const dataToExport = adminAnalytics.facultyStats.map((f) => ({
      Semester: adminAnalytics.semesterName,
      Fakultas: f.facultyName,
      Total_Mahasiswa: f.totalStudents,
      Rata_IPK: f.averageGPA,
      Kelulusan_Persen: f.passRate,
      Kehadiran_Persen: f.attendanceRate,
    }));
    exportToCSV(`Laporan_Rekap_Pembelajaran_${adminAnalytics.semesterId}.csv`, dataToExport);
  };

  return (
    <div className="space-y-6">
      {/* Printable Area Wrapper with Print CSS Optimization */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-area,
          #printable-report-area * {
            visibility: visible;
          }
          #printable-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Control Header (No-Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold font-mono">
              REKAPITULASI AKHIR SEMESTER
            </span>
            <span className="text-xs text-slate-400 font-semibold">• UCIC Academic Dossier</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Laporan Rekapitulasi Proses Pembelajaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis capaian kompetensi, riwayat aktivitas, dan evaluasi hasil perkuliahan semester sebelumnya.
          </p>
        </div>

        {/* Semester Selector & Print Action */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {MOCK_SEMESTERS.map((sem) => (
                <option key={sem.id} value={sem.id} className="dark:bg-slate-900">
                  {sem.name} {sem.isCurrent ? "(Aktif)" : "(Selesai)"}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrintPDF}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Cetak / Simpan PDF
          </button>

          {currentUser.role === "ADMIN" && (
            <button
              onClick={handleExportAdminCSV}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Ekspor CSV
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          MAIN PRINTABLE REPORT CONTENT CONTAINER
      ======================================================== */}
      <div
        id="printable-report-area"
        className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8"
      >
        {/* Official UCIC University Letterhead (Kop Surat Resmi) */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 dark:border-slate-700 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight uppercase">
                Universitas Catur Insan Cendekia
              </h1>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Biro Administrasi Akademik & Sistem Pembelajaran Hybrid (LMS-UCIC)
              </p>
              <p className="text-[10px] text-slate-400">
                Jl. Kesambi No. 202, Cirebon • Website: www.cic.ac.id • Email: lms@cic.ac.id
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono">
              DOKUMEN RESMI AKADEMIK
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              Dicetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
            </p>
          </div>
        </div>

        {/* ----------------------------------------------------
            1. STUDENT VIEW: REKAPITULASI PROSES BELAJAR
        ---------------------------------------------------- */}
        {currentUser.role === "STUDENT" && (
          <div className="space-y-6">
            {/* Student Identity Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Nama Mahasiswa:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{currentUser.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">NIM:</span>
                <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400">
                  {currentUser.nim_nip}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Program Studi:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentUser.studyProgram || "Teknik Informatika"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Periode Semester:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {studentRecap.semesterName}
                </span>
              </div>
            </div>

            {/* Student Big Performance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
                <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Indeks Prestasi (IPS)</p>
                <h3 className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
                  {studentRecap.gpa.toFixed(2)}
                </h3>
                <span className="text-[10px] text-slate-500">IPK Kumulatif: {studentRecap.cumulativeGpa}</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Beban SKS Tuntas</p>
                <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  {studentRecap.totalSKS} SKS
                </h3>
                <span className="text-[10px] text-slate-500">100% Lulus Matakuliah</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Kehadiran Perkuliahan</p>
                <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                  {studentRecap.attendancePercentage}%
                </h3>
                <span className="text-[10px] text-slate-500">Sesi Hybrid & Luring</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-center">
                <p className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Total Durasi Belajar</p>
                <h3 className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
                  {studentRecap.totalStudyHours} Jam
                </h3>
                <span className="text-[10px] text-slate-500">Video & Bahan Belajar</span>
              </div>
            </div>

            {/* Courses Performance Table */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> Rincian Rekapitulasi Pembelajaran per Matakuliah
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-3">Kode</th>
                      <th className="py-3 px-4">Nama Matakuliah</th>
                      <th className="py-3 px-2 text-center">SKS</th>
                      <th className="py-3 px-3">Dosen Pengampu</th>
                      <th className="py-3 px-2 text-center">Kehadiran</th>
                      <th className="py-3 px-2 text-center">Tugas</th>
                      <th className="py-3 px-2 text-center">Kuis</th>
                      <th className="py-3 px-2 text-center">Nilai Akhir</th>
                      <th className="py-3 px-3 text-center">Huruf</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentRecap.courses.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-bold text-blue-600">{c.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                        <td className="py-3 px-2 text-center font-bold">{c.credits}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{c.instructor}</td>
                        <td className="py-3 px-2 text-center">{c.attendanceRate}%</td>
                        <td className="py-3 px-2 text-center">{c.assignmentScore}</td>
                        <td className="py-3 px-2 text-center">{c.quizScore}</td>
                        <td className="py-3 px-2 text-center font-extrabold text-blue-600">
                          {c.finalScore}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {c.letterGrade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-emerald-600 text-[11px]">{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            2. DOSEN VIEW: REKAPITULASI KINERJA PEMBELAJARAN
        ---------------------------------------------------- */}
        {currentUser.role === "DOSEN" && (
          userCourses.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Belum Ada Laporan Capaian Semester
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Akun Dosen Anda belum memiliki catatan kelas diampu pada semester ini.
                </p>
              </div>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Lecturer Identity Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Dosen Pengampu:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{currentUser.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">NIP:</span>
                <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">
                  {currentUser.nim_nip}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Fakultas / Homebase:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentUser.faculty || "Fakultas Teknologi Informasi"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Periode Evaluasi:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {dosenReport.semesterName}
                </span>
              </div>
            </div>

            {/* Lecturer Teaching KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Beban Mengajar</p>
                <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
                  {dosenReport.totalCreditsTaught} SKS
                </h3>
                <span className="text-[10px] text-slate-500">{dosenReport.totalClasses} Kelas Paralel</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Realisasi Tatap Muka</p>
                <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  {dosenReport.meetingFulfillmentRate}%
                </h3>
                <span className="text-[10px] text-slate-500">16 Pertemuan Lengkap</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
                <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Rata-rata Nilai Mahasiswa</p>
                <h3 className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
                  {dosenReport.averageStudentScore}
                </h3>
                <span className="text-[10px] text-slate-500">Dari {dosenReport.totalStudentsTaught} Mahasiswa</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-center">
                <p className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Kepuasan Mahasiswa (IKM)</p>
                <h3 className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
                  {dosenReport.studentSatisfactionIndex} <span className="text-xs font-normal">/ 5.0</span>
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">Kategori: Sangat Baik</span>
              </div>
            </div>

            {/* Class Breakdown Table */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" /> Rincian Kelas & Distribusi Nilai Mutu
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-3">Kode & Kelas</th>
                      <th className="py-3 px-4">Nama Matakuliah</th>
                      <th className="py-3 px-2 text-center">SKS</th>
                      <th className="py-3 px-3 text-center">Peserta</th>
                      <th className="py-3 px-3 text-center">Kelulusan</th>
                      <th className="py-3 px-3 text-center">Rata-rata</th>
                      <th className="py-3 px-4 text-center">Distribusi Huruf (A / B / C / D / E)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dosenReport.classBreakdowns.map((cls, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-3">
                          <span className="font-mono font-bold text-amber-600 block">{cls.courseCode}</span>
                          <span className="text-[11px] text-slate-400">{cls.className}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {cls.courseName}
                        </td>
                        <td className="py-3.5 px-2 text-center font-bold">{cls.credits}</td>
                        <td className="py-3.5 px-3 text-center">{cls.totalEnrolled} Mhs</td>
                        <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                          {cls.passRate}%
                        </td>
                        <td className="py-3.5 px-3 text-center font-extrabold text-blue-600">
                          {cls.averageScore}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 font-mono text-[11px] font-bold">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950">
                              A: {cls.gradeDistribution.a}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950">
                              B: {cls.gradeDistribution.b}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950">
                              C: {cls.gradeDistribution.c}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800">
                              D/E: {cls.gradeDistribution.d + cls.gradeDistribution.e}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          )
        )}

        {/* ----------------------------------------------------
            3. ADMIN VIEW: LAPORAN REKAPITULASI SEMUA AKTIVITAS INSTITUSI
        ---------------------------------------------------- */}
        {currentUser.role === "ADMIN" && (
          <div className="space-y-6">
            {/* Admin Overview Banner */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-rose-600" /> Analisis Menyeluruh Aktivitas Pembelajaran Kampus ({adminAnalytics.semesterName})
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Laporan ini mengkonsolidasikan seluruh log keterlibatan mahasiswa, pemenuhan perkuliahan dosen, volume pengumpulan tugas, kuis online, serta integritas akademik untuk keperluan akreditasi dan evaluasi institusi.
              </p>
            </div>

            {/* Campus Big Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] text-slate-400">Total Mahasiswa Aktif</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {adminAnalytics.totalEnrolledStudents.toLocaleString()}
                </h4>
                <span className="text-[10px] text-emerald-600 font-bold">100% Terdaftar KRS</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] text-slate-400">Dosen & Kelas Paralel</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {adminAnalytics.totalActiveLecturers} / {adminAnalytics.totalClassesParallel}
                </h4>
                <span className="text-[10px] text-blue-600 font-bold">64 Matakuliah Aktif</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] text-slate-400">Rata-rata IPK Kampus</p>
                <h4 className="text-2xl font-black text-emerald-600 mt-0.5">
                  {adminAnalytics.campusAverageGPA}
                </h4>
                <span className="text-[10px] text-slate-500">Kehadiran: {adminAnalytics.overallAttendanceRate}%</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] text-slate-400">Total Pengumpulan Tugas</p>
                <h4 className="text-2xl font-black text-purple-600 mt-0.5">
                  {adminAnalytics.totalAssignmentsSubmitted.toLocaleString()}
                </h4>
                <span className="text-[10px] text-slate-500">{adminAnalytics.totalQuizzesConducted} Sesi Kuis</span>
              </div>
            </div>

            {/* Faculty Comparison Breakdown */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> Komparasi Kinerja Pembelajaran Antar Fakultas
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {adminAnalytics.facultyStats.map((f, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                        <Building2 className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold text-slate-500">{f.totalStudents} Mahasiswa</span>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {f.facultyName}
                      </h5>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rata-rata IPK:</span>
                        <span className="font-bold text-emerald-600">{f.averageGPA}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tingkat Kelulusan:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{f.passRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rata-rata Presensi:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{f.attendanceRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Activity Timeline Logs */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" /> Timeline Aktivitas Pengguna per Bulan
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Periode Bulan</th>
                      <th className="py-3 px-4 text-center">Total Sesi Login</th>
                      <th className="py-3 px-4 text-center">Materi & Video Diakses</th>
                      <th className="py-3 px-4 text-center">Tugas Diunggah</th>
                      <th className="py-3 px-4 text-center">Pengerjaan Kuis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {adminAnalytics.monthlyActivityTimeline.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-sans">
                          {m.month}
                        </td>
                        <td className="py-3 px-4 text-center">{m.loginCount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-bold">
                          {m.materialsViewed.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-emerald-600">
                          {m.submissionsCount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-purple-600">{m.quizzesCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Official Academic Signatures / Validation Footer for Print & Official Audit */}
        <div className="pt-8 border-t-2 border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-center">
          <div className="space-y-1">
            <p className="text-slate-400 text-[11px]">Verifikasi Sistem Keamanan</p>
            <div className="p-2 border border-slate-300 dark:border-slate-700 rounded-xl inline-block bg-slate-50 dark:bg-slate-800 my-1">
              <QrCode className="w-12 h-12 text-slate-800 dark:text-slate-200 mx-auto" />
            </div>
            <p className="font-mono text-[9px] text-slate-400">DOC-ID: UCIC-RECAP-{selectedSemesterId.toUpperCase()}</p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-400 text-[11px]">Pusat Jaminan Mutu & Audit</p>
            <div className="h-14 flex items-center justify-center">
              <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300">
                TERVERIFIKASI DIGITAL
              </span>
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200">Lembaga Penjaminan Mutu UCIC</p>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <p className="text-slate-400 text-[11px]">Cirebon, {new Date().toLocaleDateString("id-ID")}</p>
            <p className="text-slate-400 text-[11px]">Wakil Rektor Bidang Akademik</p>
            <div className="h-10 flex items-center justify-center font-serif italic text-blue-900 dark:text-blue-300 font-bold">
              Dr. Ir. H. Bambang Hartono, M.T.
            </div>
            <p className="font-bold text-slate-900 dark:text-white">NIP. 197508152000031001</p>
          </div>
        </div>
      </div>
    </div>
  );
};
