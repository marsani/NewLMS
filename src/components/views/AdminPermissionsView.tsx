"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Role, Permission } from "@/types";
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  KeyRound,
  Shield,
  FileCheck2,
  CalendarCheck,
  Award,
  Video,
} from "lucide-react";

export const AdminPermissionsView: React.FC = () => {
  const { currentUser, rolePermissions } = useApp();
  const [activeRoleTab, setActiveRoleTab] = useState<Role>(currentUser.role);

  const roleInfo = rolePermissions[activeRoleTab];

  const getPermissionDetails = (perm: Permission) => {
    switch (perm) {
      // Admin
      case "MANAGE_USERS":
        return { name: "Manajemen Pengguna (CRUD)", desc: "Menambah, mengubah, menonaktifkan akun Dosen, Mahasiswa, dan Admin." };
      case "MANAGE_FACULTIES":
        return { name: "Struktur Fakultas & Prodi", desc: "Mengatur hierarki akademik, kurikulum, dan semester aktif." };
      case "MANAGE_ALL_COURSES":
        return { name: "Plotting Kelas Paralel", desc: "Menetapkan Dosen pengampu dan enrollment mahasiswa ke kelas." };
      case "VIEW_AUDIT_LOGS":
        return { name: "Log Audit Keamanan", desc: "Memantau rekam jejak aktivitas login, perubahan data, dan insiden ujian." };
      case "CONFIGURE_SYSTEM":
        return { name: "Konfigurasi Sistem Global", desc: "Mengatur kuota upload, integrasi API Zoom/Meet, dan storage R2/S3." };
      // Dosen
      case "MANAGE_OWN_COURSES":
        return { name: "Studio Kelas Mandiri", desc: "Mengelola informasi dan deskripsi kelas yang ditugaskan." };
      case "CREATE_MODULES":
        return { name: "Course Builder & Silabus", desc: "Menyusun struktur modul per pekan, mengunggah materi PDF dan video HLS." };
      case "GRADE_ASSIGNMENTS":
        return { name: "Meja Penilaian Tugas", desc: "Mengevaluasi pengumpulan berkas tugas mahasiswa dan memberi feedback." };
      case "CREATE_QUIZZES":
        return { name: "Manajemen Kuis & Anti-Cheat", desc: "Membuat bank soal kuis, essay, timer, dan mengaktifkan deteksi tab." };
      case "GENERATE_ATTENDANCE_QR":
        return { name: "Generator Presensi QR/PIN", desc: "Membuka sesi presensi tatap muka daring/luring dengan PIN dinamis." };
      case "EXPORT_GRADEBOOK":
        return { name: "Ekspor Rekap Nilai", desc: "Mengunduh buku nilai mahasiswa ke format CSV dan Microsoft Excel." };
      case "ENDORSE_FORUM_POSTS":
        return { name: "Validasi Diskusi Dosen", desc: "Memberi label resmi 'Jawaban Dosen' pada jawaban forum perkuliahan." };
      // Student
      case "VIEW_ENROLLED_COURSES":
        return { name: "Akses Kelas Terdaftar", desc: "Melihat matakuliah yang diambil pada semester berjalan." };
      case "ACCESS_MODULE_MATERIALS":
        return { name: "Akses Bahan Belajar", desc: "Membaca slide materi PDF dan menonton video streaming perkuliahan." };
      case "SUBMIT_ASSIGNMENTS":
        return { name: "Pengumpulan Berkas Tugas", desc: "Mengunggah file tugas sebelum batas tenggat dan merevisi berkas." };
      case "TAKE_QUIZZES":
        return { name: "Pengerjaan Ujian Online", desc: "Mengerjakan evaluasi kuis dengan auto-save dan countdown timer." };
      case "CHECKIN_ATTENDANCE":
        return { name: "Presensi Perkuliahan Mandiri", desc: "Melakukan check-in kehadiran online maupun offline via PIN." };
      case "VIEW_OWN_TRANSCRIPT":
        return { name: "Transkrip Nilai Mandiri", desc: "Melihat rincian nilai tugas, kuis, UTS, UAS, dan estimasi IPK." };
      case "POST_FORUM_QUESTIONS":
        return { name: "Partisipasi Diskusi Forum", desc: "Membuat pertanyaan dan berkolaborasi tanya jawab dengan rekan/dosen." };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          Pengaturan Hak Akses & Matriks Role (RBAC)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Spesifikasi hak istimewa (Privileges & Permissions) untuk Mahasiswa, Dosen Pengampu, dan Administrator LMS-UCIC.
        </p>
      </div>

      {/* Role Selection Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Role Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl text-xs font-semibold gap-1">
          {(["STUDENT", "DOSEN", "ADMIN"] as Role[]).map((r) => {
            const info = rolePermissions[r];
            const isActive = activeRoleTab === r;
            return (
              <button
                key={r}
                onClick={() => setActiveRoleTab(r)}
                className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {r === "ADMIN" && <Shield className="w-4 h-4 text-rose-500" />}
                {r === "DOSEN" && <GraduationCap className="w-4 h-4 text-amber-500" />}
                {r === "STUDENT" && <BookOpen className="w-4 h-4 text-blue-500" />}
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Description Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-slate-800/40 border border-blue-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                activeRoleTab === "ADMIN"
                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                  : activeRoleTab === "DOSEN"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
              }`}
            >
              Role: {activeRoleTab}
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {roleInfo.label}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {roleInfo.description}
          </p>
        </div>

        {/* Permissions Grid */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-blue-600" /> Daftar Hak Akses Terverifikasi ({roleInfo.permissions.length} Izin):
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roleInfo.permissions.map((perm, idx) => {
              const details = getPermissionDetails(perm);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5"
                >
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        {details.name}
                      </h5>
                      <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded">
                        {perm}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {details.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
