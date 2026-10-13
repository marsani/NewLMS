"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Role } from "@/types";
import {
  Bell,
  Search,
  Sun,
  Moon,
  Shield,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  ChevronDown,
  LogOut,
  Sparkles,
  LayoutDashboard,
  FileCheck2,
  HelpCircle,
  CalendarCheck,
  Award,
  MessagesSquare,
  Users,
  Settings,
  ShieldCheck,
  Building2,
  Layers,
  KeyRound,
} from "lucide-react";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigate?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onNavigate }) => {
  const {
    currentUser,
    logout,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    isDarkMode,
    toggleTheme,
    rolePermissions,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleMenuClick = (viewId: string) => {
    setShowUserMenu(false);
    if (onNavigate) {
      onNavigate(viewId);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Shield className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Super Administrator
          </span>
        );
      case "DOSEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Dosen Pengampu
          </span>
        );
      case "STUDENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Mahasiswa Aktif
          </span>
        );
      default:
        return null;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "GRADE":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "HYBRID":
        return <Video className="w-4 h-4 text-blue-500" />;
      case "ASSIGNMENT":
        return <FileText className="w-4 h-4 text-amber-500" />;
      case "QUIZ":
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Customized menu items tailored for the logged-in role
  const getRoleMenuItems = () => {
    switch (currentUser.role) {
      case "STUDENT":
        return [
          { id: "dashboard", label: "Dashboard Mahasiswa", icon: LayoutDashboard },
          { id: "courses", label: "Matakuliah & Modul Saya", icon: BookOpen },
          { id: "assignments", label: "Tugas & Penugasan", icon: FileCheck2 },
          { id: "quizzes", label: "Kuis & Ujian Online", icon: HelpCircle },
          { id: "attendance", label: "Presensi Perkuliahan Hybrid", icon: CalendarCheck },
          { id: "grades", label: "Transkrip & Rekap Nilai", icon: Award },
          { id: "semester-report", label: "Rekap Pembelajaran Semester (PDF)", icon: FileText },
          { id: "forum", label: "Forum Diskusi Kelas", icon: MessagesSquare },
        ];
      case "DOSEN":
        return [
          { id: "dashboard", label: "Dashboard Dosen", icon: LayoutDashboard },
          { id: "courses", label: "Studio & Kelola Matakuliah", icon: BookOpen },
          { id: "assignments", label: "Meja Penilaian Tugas Mahasiswa", icon: FileCheck2 },
          { id: "quizzes", label: "Bank Soal & Kuis Online", icon: HelpCircle },
          { id: "attendance", label: "Generator Sesi Presensi QR", icon: CalendarCheck },
          { id: "grades", label: "Buku Rekap Nilai (Gradebook)", icon: GraduationCap },
          { id: "semester-report", label: "Rekap Kinerja Mengajar (PDF)", icon: FileText },
          { id: "forum", label: "Forum & Pengumuman Dosen", icon: MessagesSquare },
        ];
      case "ADMIN":
        return [
          { id: "dashboard", label: "Pusat Kontrol Administrator", icon: LayoutDashboard },
          { id: "admin-users", label: "Manajemen Pengguna (CRUD)", icon: Users },
          { id: "courses", label: "Plotting Kelas & Dosen", icon: Layers },
          { id: "semester-report", label: "Analisis Pembelajaran Kampus", icon: FileText },
          { id: "admin-academic", label: "Struktur Akademik & Prodi", icon: Building2 },
          { id: "admin-permissions", label: "Hak Akses & Role (RBAC)", icon: ShieldCheck },
          { id: "admin-system", label: "Log Audit & Konfigurasi Sistem", icon: Settings },
        ];
    }
  };

  const roleMenuItems = getRoleMenuItems();
  const currentPermissions = rolePermissions[currentUser.role]?.permissions || [];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari matakuliah, materi, tugas, atau kuis..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Role Indicator & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Active Account Identity Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 shadow-inner text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            {currentUser.role === "ADMIN" && <Shield className="w-4 h-4 text-rose-500" />}
            {currentUser.role === "DOSEN" && <GraduationCap className="w-4 h-4 text-amber-500" />}
            {currentUser.role === "STUDENT" && <BookOpen className="w-4 h-4 text-blue-500" />}
            <span className="text-slate-700 dark:text-slate-200">{currentUser.role}:</span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px]">
            {currentUser.name}
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifikasi</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Tandai semua dibaca
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">Tidak ada notifikasi.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 flex items-start gap-3 rounded-xl transition-colors cursor-pointer ${
                        !notif.isRead
                          ? "bg-blue-50/60 dark:bg-blue-950/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* TOP RIGHT USER PROFILE TAB - DYNAMICALLY ADAPTS PER ROLE */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 pl-2 pr-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/30"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {currentUser.nim_nip}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-80 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
              {/* User Identity Header Card */}
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate font-mono">{currentUser.nim_nip}</p>
                  <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                </div>
              </div>

              {/* Study Program & Faculty Details */}
              <div className="py-2.5 px-3 my-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Unit / Prodi:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                    {currentUser.studyProgram || currentUser.faculty || "Teknik Informatika"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hak Akses:</span>
                  <span className="font-bold text-emerald-600">
                    {currentPermissions.length} Izin Terverifikasi
                  </span>
                </div>
              </div>

              {/* Role-Specific Navigation Links */}
              <div className="py-2 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                  Menu Utama {currentUser.role}:
                </p>
                {roleMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                {/* Change Password — Only for DOSEN & STUDENT */}
                {(currentUser.role === "DOSEN" || currentUser.role === "STUDENT") && (
                  <button
                    onClick={() => handleMenuClick("change-password")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    Ubah Kata Sandi Akun
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200/60 dark:border-rose-900/40"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar dari Sesi (Logout)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
