"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Video,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Users,
  Award,
  Zap,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { getRemainingTime, formatDate } from "@/lib/utils";

interface DashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, users, courses, userCourses, assignCourseLecturer, assignments, userAssignments, quizzes, userQuizzes, attendanceSessions, grades, auditLogs } = useApp();

  // Student Statistics
  const totalSKS = grades.reduce((acc, g) => acc + g.credits, 0);
  const averageGPA = 3.82; // Estimated
  const pendingAssignments = userAssignments.filter((a) => {
    const isSubmitted = a.submissions.some((s) => s.studentId === currentUser.id);
    return !isSubmitted;
  });
  const completedAssignments = userAssignments.filter((a) =>
    a.submissions.some((s) => s.studentId === currentUser.id)
  );

  // Dosen Statistics
  const pendingGrading = userAssignments.reduce((acc, a) => {
    const needGrade = a.submissions.filter((s) => s.status === "SUBMITTED").length;
    return acc + needGrade;
  }, 0);
  const totalStudentsTaught = userCourses.reduce((acc, c) => acc + (c.totalStudents || 0), 0);

  // Admin Statistics
  const totalStudentsCount = users.filter((u) => u.role === "STUDENT").length;
  const totalDosensCount = users.filter((u) => u.role === "DOSEN").length;

  /* ---------------- STUDENT DASHBOARD ---------------- */
  if (currentUser.role === "STUDENT") {
    return (
      <div className="space-y-6">
        {/* Welcome Banner with Modern Gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-300 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              Portal Mahasiswa Hybrid LMS-UCIC
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang Kembali, {currentUser.name}! 👋
            </h2>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Anda terdaftar pada <span className="font-semibold text-white">{courses.length} Matakuliah ({totalSKS} SKS)</span> semester ini.
              Selesaikan modul pekan ini dan perhatikan batas waktu penugasan mendatang.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate("courses")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Masuk ke Kelas Virtual
              </button>
              <button
                onClick={() => onNavigate("attendance")}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-all border border-white/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Presensi Kelas Hari Ini
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Matakuliah Aktif</p>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">{courses.length} Kelas</h4>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tugas Tertunda</p>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">{pendingAssignments.length} Tugas</h4>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estimasi IPK</p>
              <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{averageGPA} / 4.0</h4>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">SKS Ditempuh</p>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">{totalSKS} SKS</h4>
            </div>
          </div>
        </div>

        {/* Live Hybrid Schedule & Urgent Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Course Progress Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Progres Belajar Matakuliah
              </h3>
              <button
                onClick={() => onNavigate("courses")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Belum Ada Kelas Aktif</h4>
                <p className="text-xs text-slate-500">Belum ada kelas perkuliahan aktif untuk semester ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => onNavigate("courses", course.id)}
                    className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {course.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            course.deliveryMode === "HYBRID"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : course.deliveryMode === "ONLINE"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {course.deliveryMode}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {course.name}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <img
                          src={course.instructorAvatar}
                          alt={course.instructorName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="truncate">{course.instructorName}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Kelengkapan Modul</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {course.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-amber-500 rounded-full transition-all"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Deadlines & Live Sessions */}
          <div className="space-y-6">
            {/* Live Hybrid Sesi Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-amber-50 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                <Video className="w-4 h-4 animate-pulse text-rose-500" /> Sesi Tatap Muka Hybrid
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Pemrograman Web (Pekan 2): Prisma ORM
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Senin, 08:00 - 10:30 WIB • Lab RPL & Online GMeet
              </p>
              <a
                href="https://meet.google.com/abc-defg-hij"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Video className="w-4 h-4" /> Gabung Google Meet
              </a>
            </div>

            {/* Upcoming Deadlines */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" /> Deadline Terdekat
              </h4>

              <div className="space-y-2.5">
                {assignments.map((assign) => {
                  const rem = getRemainingTime(assign.deadline);
                  const isSubmitted = assign.submissions.some((s) => s.studentId === currentUser.id);

                  return (
                    <div
                      key={assign.id}
                      onClick={() => onNavigate("assignments")}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                          {assign.title}
                        </p>
                        {isSubmitted ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                            Selesai
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 shrink-0">
                            {rem.text}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {assign.courseName}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- DOSEN DASHBOARD ---------------- */
  if (currentUser.role === "DOSEN") {
    return (
      <div className="space-y-6">
        {/* Dosen Welcome Header */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-xs font-semibold text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Studio Pengajar & Manajemen Kuliah
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Selamat Bertugas, {currentUser.name}
            </h2>
            <p className="text-sm text-slate-300">
              Kelola silabus, unggah modul per pekan, aktifkan kuis dengan anti-cheat, dan evaluasi hasil pengumpulan tugas mahasiswa.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigate("assignments")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shadow transition-all flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" /> Koreksi Tugas ({pendingGrading} Belum Dinilai)
              </button>
              <button
                onClick={() => onNavigate("attendance")}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Buat Sesi Presensi QR
              </button>
            </div>
          </div>
        </div>

        {/* Dosen Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Kelas Diampu</p>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                {userCourses.length} Kelas
              </h4>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Tugas Perlu Nilai</p>
              <h4 className="text-xl font-bold text-rose-600">{pendingGrading} Pengumpulan</h4>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Mahasiswa</p>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{totalStudentsTaught} Mahasiswa</h4>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Kuis Aktif</p>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{userQuizzes.length} Kuis</h4>
            </div>
          </div>
        </div>

        {/* Course Cards & Pending Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daftar Matakuliah Yang Diampu
            </h3>
            <div className="space-y-3">
              {userCourses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 shadow-sm">
                  <BookOpen className="w-8 h-8 mx-auto text-blue-500" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Belum Ada Matakuliah Yang Diampu</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Akun Dosen Anda (<span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.name}</span>) belum di-plotting pada matakuliah manapun.
                    </p>
                  </div>
                  {courses.length > 0 && (
                    <div className="max-w-sm mx-auto p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Hubungkan Kelas Yang Anda Ampu:
                      </label>
                      <select
                        id="dashboard-claim-select"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        defaultValue={courses[0]?.id || ""}
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.code} - {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const sel = document.getElementById("dashboard-claim-select") as HTMLSelectElement;
                          if (sel && sel.value) {
                            assignCourseLecturer(sel.value, currentUser.id);
                          }
                        }}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hubungkan ke Akun Saya
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                userCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{c.code}</span>
                        <span className="text-xs text-slate-400">• {c.credits} SKS</span>
                        <span className="text-xs text-slate-400">• {c.scheduleDay}, {c.scheduleTime}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</h4>
                      <p className="text-xs text-slate-500">{c.room}</p>
                    </div>
                    <button
                      onClick={() => onNavigate("courses", c.id)}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-semibold text-xs hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      Buka Studio
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Grading Action Box */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Antrean Penilaian Terkini
            </h3>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              {userAssignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Tidak ada antrean tugas yang perlu dinilai.
                </div>
              ) : (
                userAssignments.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{a.title}</p>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{a.submissions.length} Pengumpulan</span>
                      <button
                        onClick={() => onNavigate("assignments")}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Buka Meja Nilai →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ADMIN DASHBOARD ---------------- */
  return (
    <div className="space-y-6">
      {/* Admin Control Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-xs font-semibold text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" /> Pusat Kontrol Sistem & Administrasi Akademik
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Dashboard Administrator LMS-UCIC
          </h2>
          <p className="text-sm text-slate-300">
            Monitoring aktivitas perkuliahan real-time, audit trail keamanan, alokasi kelas, dan manajemen akun civitas akademika.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate("admin-users")}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Kelola Pengguna (Dosen & Mahasiswa)
            </button>
            <button
              onClick={() => onNavigate("admin-system")}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" /> Pengaturan Sistem & Log Audit
            </button>
          </div>
        </div>
      </div>

      {/* Admin Server & User Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Mahasiswa Terdaftar</p>
          <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalStudentsCount} Mahasiswa</h4>
          <span className="text-[11px] text-emerald-600 font-semibold">{totalStudentsCount > 0 ? "Akun Aktif" : "Menunggu input data"}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Dosen Pengampu</p>
          <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalDosensCount} Dosen</h4>
          <span className="text-[11px] text-blue-600 font-semibold">{totalDosensCount > 0 ? "Akun Terverifikasi" : "Menunggu input data"}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Kelas / Matakuliah Aktif</p>
          <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{courses.length} Kelas</h4>
          <span className="text-[11px] text-amber-600 font-semibold">Mode Hybrid & Online</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Status Database</p>
          <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">Siap & Terhubung</h4>
          <span className="text-[11px] text-slate-400">Sinkronisasi Lokal & Server OK</span>
        </div>
      </div>

      {/* Realtime Audit Log Feed */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Log Aktivitas & Audit Keamanan Realtime
          </h3>
          <span className="text-xs text-slate-400">Pembaruan otomatis</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === "SUCCESS"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {log.userName} ({log.userRole})
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{log.details}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                {formatDate(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
