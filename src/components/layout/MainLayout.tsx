"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { DashboardView } from "../views/DashboardView";
import { CoursesView } from "../views/CoursesView";
import { AssignmentsView } from "../views/AssignmentsView";
import { QuizView } from "../views/QuizView";
import { AttendanceView } from "../views/AttendanceView";
import { GradesView } from "../views/GradesView";
import { ForumView } from "../views/ForumView";
import { AdminCoursesView } from "../views/AdminCoursesView";
import { AdminUsersView } from "../views/AdminUsersView";
import { AdminSystemView } from "../views/AdminSystemView";
import { AdminPermissionsView } from "../views/AdminPermissionsView";
import { SemesterReportView } from "../views/SemesterReportView";
import { ChangePasswordView } from "../views/ChangePasswordView";
import { AdminMasterCoursesView } from "../views/AdminMasterCoursesView";
import { AdminFacultyView } from "../views/AdminFacultyView";
import { LoginView } from "../auth/LoginView";
import { SessionTimeoutBanner } from "./SessionTimeoutBanner";
import { Menu, ChevronRight, Home } from "lucide-react";

export const MainLayout: React.FC = () => {
  const { currentUser, isAuthenticated, setActiveCourseId } = useApp();
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("lms_ucic_activeView");
      if (savedView) {
        setActiveView(savedView);
      }
    }
  }, []);

  // If user is logged out, render the Login Screen with Captcha
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleNavigate = (view: string, id?: string) => {
    setActiveView(view);
    if (typeof window !== "undefined") {
      localStorage.setItem("lms_ucic_activeView", view);
    }
    setSelectedEntityId(id);
    if (view === "courses" && id) {
      setActiveCourseId(id);
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "dashboard":
        return currentUser.role === "ADMIN"
          ? "Pusat Kontrol Admin"
          : currentUser.role === "DOSEN"
          ? "Dashboard Dosen"
          : "Dashboard Mahasiswa";
      case "courses":
      case "admin-courses":
        return currentUser.role === "ADMIN"
          ? "Plotting Matakuliah & Tim Teaching Dosen"
          : currentUser.role === "DOSEN"
          ? "Studio Matakuliah (Kelas Diampu)"
          : "Matakuliah Saya";
      case "assignments":
        return currentUser.role === "DOSEN" ? "Penilaian Tugas" : "Tugas & Penugasan";
      case "quizzes":
        return "Kuis & Ujian Online";
      case "attendance":
        return "Presensi Perkuliahan Hybrid";
      case "grades":
        return currentUser.role === "DOSEN" ? "Buku Rekap Nilai" : "Nilai & Transkrip";
      case "semester-report":
        return currentUser.role === "ADMIN"
          ? "Analisis Rekapitulasi Pembelajaran Kampus"
          : currentUser.role === "DOSEN"
          ? "Rekapitulasi Kinerja Mengajar Semester (PDF)"
          : "Rekapitulasi Proses Pembelajaran Semester (PDF)";
      case "forum":
        return "Forum Diskusi";
      case "admin-users":
        return "Manajemen Pengguna";
      case "admin-permissions":
        return "Hak Akses & Pengaturan Role (RBAC)";
      case "admin-system":
      case "admin-academic":
        return "Log Audit & Sistem";
      case "admin-master-courses":
        return "Katalog Matakuliah";
      case "admin-faculty":
        return "Fakultas & Program Studi";
      case "change-password":
        return "Ubah Kata Sandi Akun";
      default:
        return "Portal LMS";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          setSelectedEntityId(undefined);
        }}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Wrapper with Left Margin for Sidebar on Desktop */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <Header onNavigate={handleNavigate} />

        {/* Session Timeout Warning Banner */}
        <SessionTimeoutBanner />

        {/* Sub-Header / Breadcrumb Bar */}
        <div className="px-4 lg:px-8 py-3 bg-white/40 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveView("dashboard")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">{getViewTitle()}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Campus Cirebon & Daring
            </span>
          </div>
        </div>

        {/* Dynamic Main View Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeView === "dashboard" && <DashboardView onNavigate={handleNavigate} />}
          {activeView === "courses" && (
            currentUser.role === "ADMIN" ? (
              <AdminCoursesView onNavigate={handleNavigate} />
            ) : (
              <CoursesView onNavigate={handleNavigate} />
            )
          )}
          {activeView === "admin-courses" && <AdminCoursesView onNavigate={handleNavigate} />}
          {activeView === "assignments" && (
            <AssignmentsView selectedAssignmentId={selectedEntityId} />
          )}
          {activeView === "quizzes" && <QuizView initialQuizId={selectedEntityId} />}
          {activeView === "attendance" && <AttendanceView />}
          {activeView === "grades" && <GradesView />}
          {activeView === "semester-report" && <SemesterReportView />}
          {activeView === "forum" && <ForumView />}
          {activeView === "admin-users" && <AdminUsersView />}
          {activeView === "admin-permissions" && <AdminPermissionsView />}
          {(activeView === "admin-system" || activeView === "admin-academic") && <AdminSystemView />}
          {activeView === "admin-master-courses" && <AdminMasterCoursesView />}
          {activeView === "admin-faculty" && <AdminFacultyView />}
          {activeView === "change-password" && <ChangePasswordView />}
        </main>


        {/* Footer */}
        <footer className="px-4 lg:px-8 py-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 bg-white/40 dark:bg-slate-900/40">
          <p>
            © {new Date().getFullYear()} LMS Universitas Catur Insan Cendekia (UCIC) • Hybrid & Blended Learning System.
          </p>
        </footer>
      </div>
    </div>
  );
};
