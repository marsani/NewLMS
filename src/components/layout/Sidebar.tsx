"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  HelpCircle,
  CalendarCheck,
  GraduationCap,
  MessagesSquare,
  Users,
  Building2,
  ShieldCheck,
  Settings,
  Sparkles,
  Layers,
  Award,
  FileSpreadsheet,
  BookOpenCheck,
  School,
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { currentUser, courses, userCourses, activeCourseId, setActiveCourseId } = useApp();

  const getNavItems = () => {
    switch (currentUser?.role) {
      case "STUDENT":
        return [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "courses", label: "Matakuliah Saya", icon: BookOpen, badge: `${userCourses.length}` },
          { id: "assignments", label: "Tugas & Penugasan", icon: FileCheck2 },
          { id: "quizzes", label: "Kuis & Ujian Online", icon: HelpCircle },
          { id: "attendance", label: "Presensi Hybrid", icon: CalendarCheck },
          { id: "grades", label: "Nilai & Transkrip", icon: Award },
          { id: "semester-report", label: "Rekap Semester (PDF)", icon: FileSpreadsheet },
          { id: "forum", label: "Forum Diskusi", icon: MessagesSquare },
        ];
      case "DOSEN":
        return [
          { id: "dashboard", label: "Dashboard Dosen", icon: LayoutDashboard },
          { id: "courses", label: "Studio Matakuliah", icon: BookOpen, badge: `${userCourses.length} Kelas` },
          { id: "assignments", label: "Penilaian Tugas", icon: FileCheck2, badge: "0 Perlu Nilai" },
          { id: "quizzes", label: "Bank Soal & Kuis", icon: HelpCircle },
          { id: "attendance", label: "Sesi Presensi QR", icon: CalendarCheck },
          { id: "grades", label: "Rekap Nilai (Gradebook)", icon: GraduationCap },
          { id: "semester-report", label: "Kinerja Mengajar (PDF)", icon: FileSpreadsheet },
          { id: "forum", label: "Forum & Pengumuman", icon: MessagesSquare },
        ];
      case "ADMIN":
      default:
        return [
          { id: "dashboard", label: "Pusat Kontrol Admin", icon: LayoutDashboard },
          { id: "admin-users", label: "Manajemen Pengguna", icon: Users },
          { id: "courses", label: "Plotting Matakuliah & Dosen", icon: Layers, badge: `${courses.length}` },
          { id: "admin-master-courses", label: "Katalog Matakuliah", icon: BookOpenCheck },
          { id: "admin-faculty", label: "Fakultas & Program Studi", icon: School },
          { id: "semester-report", label: "Rekap Pembelajaran Kampus", icon: FileSpreadsheet },
          { id: "admin-academic", label: "Struktur Akademik", icon: Building2 },
          { id: "admin-permissions", label: "Hak Akses & Role (RBAC)", icon: ShieldCheck },
          { id: "admin-system", label: "Log Audit & Sistem", icon: Settings },
        ];
    }
  };

  const navItems = getNavItems() || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                LMS<span className="text-amber-500">·</span>UCIC
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                HYBRID
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
              Univ. Catur Insan Cendekia
            </p>
          </div>
        </div>

        {/* Semester Active Badge */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                T.A 2026/2027 Ganjil
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded">
              Aktif
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Menu Utama ({currentUser.role})
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-slate-400 dark:text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Active Courses Quick Access */}
          {currentUser.role !== "ADMIN" && (
            <div className="pt-5">
              <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Kelas Berlangsung
              </p>
              <div className="space-y-1">
                {courses.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCourseId(c.id);
                      setActiveView("courses");
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      activeCourseId === c.id && activeView === "courses"
                        ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        c.deliveryMode === "HYBRID"
                          ? "bg-amber-500"
                          : c.deliveryMode === "ONLINE"
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Card in Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser.studyProgram || currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
