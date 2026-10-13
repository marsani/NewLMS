"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Course, DeliveryMode, TeamTeachingMember, User, normalizeAssignedMeetings } from "@/types";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Clock,
  Video,
  Layers,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  X,
  GraduationCap,
  UserCheck,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface AdminCoursesViewProps {
  onNavigate?: (view: string, id?: string) => void;
}

export const AdminCoursesView: React.FC<AdminCoursesViewProps> = ({ onNavigate }) => {
  const { courses, users, addCourse, updateCourse, deleteCourse, assignCourseLecturer, setCourseTeamTeaching, setActiveCourseId, masterCourses, faculties, studyPrograms } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("ALL");
  const [selectedMode, setSelectedMode] = useState<"ALL" | DeliveryMode>("ALL");
  const [plottingToast, setPlottingToast] = useState<string | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSavingEditCourse, setIsSavingEditCourse] = useState(false);
  const [teamTeachingTargetCourse, setTeamTeachingTargetCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Form states (Add/Edit Course)
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCredits, setFormCredits] = useState(3);
  const [formFaculty, setFormFaculty] = useState("Fakultas Teknologi Informasi");
  const [formStudyProgram, setFormStudyProgram] = useState("Teknik Informatika");
  const [formAcademicYear, setFormAcademicYear] = useState("2026/2027");
  const [formSemester, setFormSemester] = useState("Ganjil (Semester 5)");
  const [formInstructorId, setFormInstructorId] = useState("");
  const [formDeliveryMode, setFormDeliveryMode] = useState<DeliveryMode>("HYBRID");
  const [formRoom, setFormRoom] = useState("Lab Rekayasa Perangkat Lunak");
  const [formScheduleDay, setFormScheduleDay] = useState("Senin");
  const [formScheduleTime, setFormScheduleTime] = useState("08:00 - 10:30 WIB");
  const [formMeetingLink, setFormMeetingLink] = useState("https://meet.google.com/abc-defg-hij");

  // Team Teaching modal editable state
  const [editableTeamTeaching, setEditableTeamTeaching] = useState<TeamTeachingMember[]>([]);
  const [isSavingTeamTeaching, setIsSavingTeamTeaching] = useState<boolean>(false);

  const dosenList = users.filter((u) => u.role === "DOSEN");

  // Derived: filtered study programs based on selected faculty
  const filteredStudyPrograms = studyPrograms.filter((sp) => sp.facultyId === faculties.find((f) => f.name === formFaculty)?.id);

  // Filtered courses
  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProdi = selectedProdi === "ALL" || course.studyProgram === selectedProdi;
    const matchMode = selectedMode === "ALL" || course.deliveryMode === selectedMode;
    return matchSearch && matchProdi && matchMode;
  });

  // Calculate stats
  const totalCourses = courses.length;
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const teamTeachingCount = courses.filter((c) => (c.teamTeaching?.length || 0) > 1).length;

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormCode("");
    setFormName("");
    setFormDescription("");
    setFormCredits(3);
    setFormFaculty(faculties[0]?.name || "Fakultas Teknologi Informasi");
    const firstFacultyProdi = studyPrograms.filter((sp) => sp.facultyId === faculties[0]?.id);
    setFormStudyProgram(firstFacultyProdi[0]?.name || "Teknik Informatika");
    setFormAcademicYear("2026/2027");
    setFormSemester("Ganjil (Semester 5)");
    setFormInstructorId(dosenList[0]?.id || "");
    setFormDeliveryMode("HYBRID");
    setFormRoom("Lab Rekayasa Perangkat Lunak");
    setFormScheduleDay("Senin");
    setFormScheduleTime("08:00 - 10:30 WIB");
    setFormMeetingLink("https://meet.google.com/abc-defg-hij");
    setShowAddModal(true);
  };

  // Handler: when selecting a master course, auto-fill code/name/credits/description
  const handleSelectMasterCourse = (mkId: string) => {
    const mk = masterCourses.find((m) => m.id === mkId);
    if (mk) {
      setFormCode(mk.code);
      setFormName(mk.name);
      setFormCredits(mk.credits);
      setFormDescription(mk.description);
    }
  };

  // Handler: when changing faculty, reset prodi to first available
  const handleChangeFaculty = (facultyName: string) => {
    setFormFaculty(facultyName);
    const fac = faculties.find((f) => f.name === facultyName);
    if (fac) {
      const prodiList = studyPrograms.filter((sp) => sp.facultyId === fac.id);
      setFormStudyProgram(prodiList[0]?.name || "");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormCode(course.code);
    setFormName(course.name);
    setFormDescription(course.description);
    setFormCredits(course.credits);
    setFormFaculty(course.faculty);
    setFormStudyProgram(course.studyProgram);
    setFormAcademicYear(course.academicYear);
    setFormSemester(course.semester);

    const initialLeadDosen =
      dosenList.find((d) => d.id === course.instructorId) ||
      dosenList.find((d) => d.nim_nip && course.instructorNip && d.nim_nip === course.instructorNip) ||
      dosenList.find((d) => d.name === course.instructorName) ||
      dosenList[0];
    setFormInstructorId(initialLeadDosen?.id || "");

    setFormDeliveryMode(course.deliveryMode);
    setFormRoom(course.room);
    setFormScheduleDay(course.scheduleDay);
    setFormScheduleTime(course.scheduleTime);
    setFormMeetingLink(course.meetingLink || "");
  };

  // Open Team Teaching Modal
  const handleOpenTeamTeaching = (course: Course) => {
    setTeamTeachingTargetCourse(course);
    if (course.teamTeaching && course.teamTeaching.length > 0) {
      setEditableTeamTeaching(
        course.teamTeaching.map((tt, idx) => ({
          ...tt,
          role: tt.role || (idx === 0 ? "KOORDINATOR" : "ANGGOTA"),
          assignedMeetings: normalizeAssignedMeetings(tt.assignedMeetings),
        }))
      );
    } else {
      // Default initial member from lead instructor
      const leadDosen =
        dosenList.find((d) => d.id === course.instructorId) ||
        dosenList.find((d) => d.nim_nip && course.instructorNip && d.nim_nip === course.instructorNip) ||
        dosenList.find((d) => d.name === course.instructorName) ||
        dosenList[0];
      setEditableTeamTeaching([
        {
          dosenId: course.instructorId || leadDosen?.id || "dosen-1",
          dosenName: course.instructorName || leadDosen?.name || "Dosen Pengampu",
          dosenNip: course.instructorNip || leadDosen?.nim_nip || "-",
          dosenAvatar: course.instructorAvatar || leadDosen?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          role: "KOORDINATOR",
          assignedMeetings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        },
      ]);
    }
  };

  // Save Add Course
  const handleSaveAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) return;

    const selectedLeadDosen =
      dosenList.find((d) => d.id === formInstructorId) ||
      dosenList.find((d) => d.nim_nip === formInstructorId) ||
      dosenList[0] ||
      users.find((u) => u.role === "DOSEN") ||
      null;

    const leadId = selectedLeadDosen?.id || formInstructorId || "dosen-1";
    const leadName = selectedLeadDosen?.name || "Dosen Pengampu";
    const leadNip = selectedLeadDosen?.nim_nip || "-";
    const leadAvatar = selectedLeadDosen?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

    setIsSavingTeamTeaching(true);
    try {
      const res = await addCourse({
        code: formCode.toUpperCase().trim(),
        name: formName.trim(),
        description: formDescription.trim(),
        credits: Number(formCredits),
        faculty: formFaculty,
        studyProgram: formStudyProgram,
        academicYear: formAcademicYear,
        semester: formSemester,
        instructorId: leadId,
        instructorName: leadName,
        instructorAvatar: leadAvatar,
        instructorNip: leadNip,
        deliveryMode: formDeliveryMode,
        room: formRoom,
        scheduleDay: formScheduleDay,
        scheduleTime: formScheduleTime,
        meetingLink: formMeetingLink,
        teamTeaching: [
          {
            dosenId: leadId,
            dosenName: leadName,
            dosenNip: leadNip,
            dosenAvatar: leadAvatar,
            role: "KOORDINATOR",
            assignedMeetings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          },
        ],
      });

      if (res && res.success) {
        setPlottingToast(`✅ Matakuliah "${formCode}" berhasil ditambahkan dan disimpan ke database!`);
        setTimeout(() => setPlottingToast(null), 4000);
        setShowAddModal(false);
      } else {
        alert(res?.error || "Gagal menyimpan matakuliah ke database.");
      }
    } finally {
      setIsSavingTeamTeaching(false);
    }
  };

  // Save Edit Course
  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !formCode.trim() || !formName.trim()) return;

    const selectedLeadDosen =
      dosenList.find((d) => d.id === formInstructorId) ||
      dosenList.find((d) => d.nim_nip === formInstructorId) ||
      dosenList[0] ||
      users.find((u) => u.role === "DOSEN") ||
      null;

    const leadId = selectedLeadDosen?.id || formInstructorId || editingCourse.instructorId || "dosen-1";
    const leadName = selectedLeadDosen?.name || editingCourse.instructorName || "Dosen Pengampu";
    const leadNip = selectedLeadDosen?.nim_nip || editingCourse.instructorNip || "-";
    const leadAvatar = selectedLeadDosen?.avatar || editingCourse.instructorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

    // Sinkronkan juga teamTeaching saat dosen pengampu utama diupdate
    let updatedTeam = editingCourse.teamTeaching ? [...editingCourse.teamTeaching] : [];
    const existingIdx = updatedTeam.findIndex(
      (tt) => tt.dosenId === leadId || (tt.dosenNip && leadNip !== "-" && tt.dosenNip === leadNip)
    );

    if (existingIdx >= 0) {
      updatedTeam = updatedTeam.map((tt, idx) => {
        if (idx === existingIdx) {
          return {
            ...tt,
            dosenId: leadId,
            dosenName: leadName,
            dosenNip: leadNip,
            dosenAvatar: leadAvatar,
            role: "KOORDINATOR" as const,
          };
        }
        return {
          ...tt,
          role: "ANGGOTA" as const,
        };
      });
    } else {
      updatedTeam = updatedTeam.map((tt) => ({ ...tt, role: "ANGGOTA" as const }));
      updatedTeam.unshift({
        dosenId: leadId,
        dosenName: leadName,
        dosenNip: leadNip,
        dosenAvatar: leadAvatar,
        role: "KOORDINATOR",
        assignedMeetings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      });
    }

    setIsSavingEditCourse(true);
    try {
      const res = await updateCourse(editingCourse.id, {
        code: formCode.toUpperCase(),
        name: formName,
        description: formDescription,
        credits: Number(formCredits),
        faculty: formFaculty,
        studyProgram: formStudyProgram,
        academicYear: formAcademicYear,
        semester: formSemester,
        instructorId: leadId,
        instructorName: leadName,
        instructorAvatar: leadAvatar,
        instructorNip: leadNip,
        deliveryMode: formDeliveryMode,
        room: formRoom,
        scheduleDay: formScheduleDay,
        scheduleTime: formScheduleTime,
        meetingLink: formMeetingLink,
        teamTeaching: updatedTeam,
      });

      if (res && res.success) {
        setPlottingToast(`✅ Perubahan matakuliah "${formCode}" berhasil disimpan ke database!`);
        setTimeout(() => setPlottingToast(null), 4000);
        setEditingCourse(null);
      } else {
        alert(res?.error || "Gagal memperbarui matakuliah di server.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat menyimpan perubahan matakuliah: " + (err?.message || err));
    } finally {
      setIsSavingEditCourse(false);
    }
  };

  // Delete Course Handler
  const handleConfirmDelete = async () => {
    if (deletingCourseId) {
      const res = await deleteCourse(deletingCourseId);
      if (res && res.success) {
        setPlottingToast(`✅ Matakuliah berhasil dihapus dari database.`);
        setTimeout(() => setPlottingToast(null), 4000);
      } else {
        alert(res?.error || "Gagal menghapus matakuliah.");
      }
      setDeletingCourseId(null);
    }
  };

  // Team Teaching Actions
  const handleAddTeamMember = (dosenId: string) => {
    const dosen = dosenList.find((d) => d.id === dosenId);
    if (!dosen) return;
    if (editableTeamTeaching.some((tt) => tt.dosenId === dosen.id)) return;

    setEditableTeamTeaching((prev) => [
      ...prev,
      {
        dosenId: dosen.id,
        dosenName: dosen.name,
        dosenNip: dosen.nim_nip,
        dosenAvatar: dosen.avatar,
        role: "ANGGOTA",
        assignedMeetings: [9, 10, 11, 12, 13, 14, 15, 16],
      },
    ]);
  };

  const handleRemoveTeamMember = (dosenId: string) => {
    if (editableTeamTeaching.length <= 1) {
      alert("Matakuliah harus memiliki minimal 1 Dosen Pengampu.");
      return;
    }
    setEditableTeamTeaching((prev) => prev.filter((tt) => tt.dosenId !== dosenId));
  };

  const handleToggleMeeting = (dosenId: string, meetingNum: number) => {
    setEditableTeamTeaching((prev) =>
      prev.map((tt) => {
        if (tt.dosenId === dosenId) {
          const currentMeetings = normalizeAssignedMeetings(tt.assignedMeetings);
          const exists = currentMeetings.includes(meetingNum);
          const nextMeetings = exists
            ? currentMeetings.filter((m) => m !== meetingNum)
            : [...currentMeetings, meetingNum].sort((a, b) => a - b);
          return { ...tt, assignedMeetings: nextMeetings };
        }
        return tt;
      })
    );
  };

  const handleQuickPresetMeetings = (
    dosenId: string,
    preset: "UTS_BEFORE" | "UTS_AFTER" | "ALL" | "CLEAR"
  ) => {
    let meetings: number[] = [];
    if (preset === "UTS_BEFORE") meetings = [1, 2, 3, 4, 5, 6, 7, 8];
    if (preset === "UTS_AFTER") meetings = [9, 10, 11, 12, 13, 14, 15, 16];
    if (preset === "ALL") meetings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

    setEditableTeamTeaching((prev) =>
      prev.map((tt) => (tt.dosenId === dosenId ? { ...tt, assignedMeetings: meetings } : tt))
    );
  };

  const handleSaveTeamTeaching = async () => {
    if (!teamTeachingTargetCourse) return;
    setIsSavingTeamTeaching(true);
    try {
      const sanitizedTeam = editableTeamTeaching.map((tt, idx) => ({
        ...tt,
        role: tt.role || (idx === 0 ? "KOORDINATOR" : "ANGGOTA"),
        assignedMeetings: normalizeAssignedMeetings(tt.assignedMeetings),
      }));

      // Ensure at least one coordinator exists
      const hasKoordinator = sanitizedTeam.some((tt) => tt.role === "KOORDINATOR");
      if (!hasKoordinator && sanitizedTeam.length > 0) {
        sanitizedTeam[0].role = "KOORDINATOR";
      }

      const res = await setCourseTeamTeaching(
        teamTeachingTargetCourse.id,
        sanitizedTeam,
        teamTeachingTargetCourse.code,
        teamTeachingTargetCourse
      );
      if (res && res.success) {
        setPlottingToast(`✅ Alokasi Tim Teaching untuk "${teamTeachingTargetCourse.code}" berhasil disimpan ke database!`);
        setTeamTeachingTargetCourse(null);
      } else {
        alert(res?.error || "Gagal menyimpan alokasi tim teaching ke database. Silakan coba lagi.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan koneksi ke server: " + (err?.message || err));
    } finally {
      setIsSavingTeamTeaching(false);
      setTimeout(() => setPlottingToast(null), 4000);
    }
  };

  const handleQuickAssignLecturer = async (courseId: string, dosenId: string) => {
    const dosen = dosenList.find((d) => d.id === dosenId);
    if (!dosen) return;
    const targetCourse = courses.find((c) => c.id === courseId);
    const res = await assignCourseLecturer(courseId, dosenId, targetCourse?.code, targetCourse);
    if (res && res.success) {
      setPlottingToast(`✅ Berhasil mem-plot matakuliah "${targetCourse?.code || ""} - ${targetCourse?.name || ""}" ke Dosen ${dosen.name}!`);
    } else {
      alert(res?.error || "Gagal mem-plot dosen ke database.");
    }
    setTimeout(() => setPlottingToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Flash Plotting Toast */}
      {plottingToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{plottingToast}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300 border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Biro Administrasi Akademik & Kurikulum UCIC
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Plotting Matakuliah & Tim Teaching Dosen
          </h2>
          <p className="text-sm text-slate-300">
            Kelola data seluruh matakuliah universitas, tambahkan kelas baru, serta atur pembagian pekan perkuliahan (Pertemuan 1–16) bagi Dosen Tim Teaching.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Matakuliah</p>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {totalCourses} Matakuliah ({totalCredits} SKS)
            </h4>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Format Tim Teaching</p>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {teamTeachingCount} Kelas Multi-Dosen
            </h4>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Dosen Pengampu Tersedia</p>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {dosenList.length} Dosen Aktif
            </h4>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add Button */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode MK, nama matakuliah, atau nama dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            <option value="ALL">Semua Program Studi</option>
            <option value="Teknik Informatika">Teknik Informatika</option>
            <option value="Sistem Informasi">Sistem Informasi</option>
            <option value="Manajemen Bisnis Digital">Manajemen Bisnis Digital</option>
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            <option value="ALL">Semua Mode Kuliah</option>
            <option value="HYBRID">Mode HYBRID</option>
            <option value="ONLINE">Mode ONLINE</option>
            <option value="OFFLINE">Mode OFFLINE</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 shrink-0 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Matakuliah Baru
        </button>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <p>Tidak ada matakuliah yang sesuai dengan filter pencarian.</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const team = course.teamTeaching || [
              {
                dosenId: "user-dosen-1",
                dosenName: course.instructorName,
                dosenNip: course.instructorNip,
                dosenAvatar: course.instructorAvatar,
                role: "KOORDINATOR",
                assignedMeetings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
              },
            ];

            return (
              <div
                key={course.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Header Card */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {course.code}
                      </span>
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          course.deliveryMode === "HYBRID"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : course.deliveryMode === "ONLINE"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {course.deliveryMode}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {course.credits} SKS • {course.semester}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {course.studyProgram} ({course.faculty})
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {course.name}
                    </h3>

                    {/* Quick Plotting Selector for Lead Lecturer */}
                    <div className="flex flex-wrap items-center gap-2 py-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-600" /> Dosen Pengampu Utama:
                      </span>
                      <select
                        value={
                          course.instructorId ||
                          dosenList.find((d) => d.nim_nip && course.instructorNip && d.nim_nip === course.instructorNip)?.id ||
                          dosenList.find((d) => d.name === course.instructorName)?.id ||
                          ""
                        }
                        onChange={(e) => handleQuickAssignLecturer(course.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-extrabold text-blue-700 dark:text-blue-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      >
                        {dosenList.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} {d.nim_nip ? `(NIP: ${d.nim_nip})` : ""} - {d.faculty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {course.scheduleDay}, {course.scheduleTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-500" />
                        {course.room}
                      </span>
                      {course.meetingLink && (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-mono">
                          <Video className="w-3.5 h-3.5" />
                          Link Virtual Kelas Aktif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenTeamTeaching(course)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs flex items-center gap-2 border border-amber-200 dark:border-amber-800/60 transition-colors shadow-sm"
                    >
                      <Users className="w-4 h-4" /> Atur Tim Teaching ({team.length} Dosen)
                    </button>

                    <button
                      onClick={() => handleOpenEdit(course)}
                      title="Edit Informasi Matakuliah"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeletingCourseId(course.id)}
                      title="Hapus Matakuliah"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {onNavigate && (
                      <button
                        onClick={() => {
                          setActiveCourseId(course.id);
                          onNavigate("courses", course.id);
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                      >
                        Lihat Modul <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Team Teaching Allocation Breakdown */}
                <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" /> Alokasi Pengampu & Jadwal Pertemuan Tim Teaching:
                    </span>
                    <span className="text-slate-400">Total 16 Pertemuan Silabus</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {team.map((tt, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={tt.dosenAvatar}
                            alt={tt.dosenName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {tt.dosenName}
                              </p>
                              <span
                                className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                                  tt.role === "KOORDINATOR"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {tt.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">NIP: {tt.dosenNip}</p>
                          </div>
                        </div>

                        {/* Meetings Badge */}
                        <div className="text-right shrink-0">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                            Pekan {normalizeAssignedMeetings(tt.assignedMeetings).length > 0 ? normalizeAssignedMeetings(tt.assignedMeetings).join(", ") : "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 16-Week Visual Timeline Bar */}
                  <div className="pt-2">
                    <p className="text-[10px] text-slate-400 mb-1.5 font-medium">
                      Peta Visual 16 Pekan Perkuliahan:
                    </p>
                    <div className="grid grid-cols-16 gap-1">
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((week) => {
                        const assigned = team.find((tt) => normalizeAssignedMeetings(tt.assignedMeetings).includes(week));
                        const isCoordinator = assigned?.role === "KOORDINATOR";
                        return (
                          <div
                            key={week}
                            title={`Pekan ${week}: ${assigned ? assigned.dosenName : "Belum diatur"}`}
                            className={`h-7 rounded flex items-center justify-center font-bold text-[10px] text-white transition-all cursor-pointer ${
                              assigned
                                ? isCoordinator
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                            }`}
                          >
                            {week}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: TAMBAH MATAKULIAH BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Tambah Matakuliah Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Daftarkan mata kuliah baru ke dalam kurikulum semester aktif UCIC.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddCourse} className="space-y-4 text-xs">
              {/* Master Course Selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  📚 Pilih dari Katalog Matakuliah
                </label>
                <select
                  onChange={(e) => handleSelectMasterCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 focus:outline-none focus:border-blue-500 font-semibold text-blue-700 dark:text-blue-300"
                  defaultValue=""
                >
                  <option value="" disabled>— Pilih matakuliah dari katalog —</option>
                  {masterCourses.map((mk) => (
                    <option key={mk.id} value={mk.id}>
                      {mk.code} — {mk.name} ({mk.credits} SKS)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 Memilih dari katalog akan otomatis mengisi Kode, Nama, SKS, dan Deskripsi. Anda juga bisa mengisi manual di bawah.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Matakuliah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-mono uppercase"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Matakuliah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pemrograman Sistem Terdistribusi"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bobot SKS
                  </label>
                  <select
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value={1}>1 SKS</option>
                    <option value={2}>2 SKS</option>
                    <option value={3}>3 SKS</option>
                    <option value={4}>4 SKS</option>
                    <option value={6}>6 SKS (Skripsi/Tesis)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fakultas
                  </label>
                  <select
                    value={formFaculty}
                    onChange={(e) => handleChangeFaculty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {faculties.map((f) => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Program Studi
                  </label>
                  <select
                    value={formStudyProgram}
                    onChange={(e) => setFormStudyProgram(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {filteredStudyPrograms.length > 0 ? (
                      filteredStudyPrograms.map((sp) => (
                        <option key={sp.id} value={sp.name}>{sp.name} ({sp.degree})</option>
                      ))
                    ) : (
                      studyPrograms.map((sp) => (
                        <option key={sp.id} value={sp.name}>{sp.name} ({sp.degree})</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mode Perkuliahan
                  </label>
                  <select
                    value={formDeliveryMode}
                    onChange={(e) => setFormDeliveryMode(e.target.value as DeliveryMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-blue-600"
                  >
                    <option value="HYBRID">HYBRID (Campuran)</option>
                    <option value="ONLINE">ONLINE (Daring Penuh)</option>
                    <option value="OFFLINE">OFFLINE (Tatap Muka Lab/Kelas)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dosen Pengampu Utama / Koordinator *
                </label>
                <select
                  value={formInstructorId}
                  onChange={(e) => setFormInstructorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  {dosenList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.nim_nip ? `(NIP: ${d.nim_nip})` : ""} - {d.faculty}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 Anda dapat menambahkan Dosen Tim Teaching tambahan setelah kelas dibuat.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hari Perkuliahan
                  </label>
                  <select
                    value={formScheduleDay}
                    onChange={(e) => setFormScheduleDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Perkuliahan
                  </label>
                  <input
                    type="text"
                    value={formScheduleTime}
                    onChange={(e) => setFormScheduleTime(e.target.value)}
                    placeholder="08:00 - 10:30 WIB"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ruang Kelas / Lab
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="Lab RPL Gedung B Lt. 3"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Silabus Ringkas
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Capaian pembelajaran dan ruang lingkup matakuliah..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
                >
                  Simpan Matakuliah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MATAKULIAH */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Edit Data Matakuliah
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah data akademik, jadwal, ruang, atau dosen koordinator.
                </p>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Matakuliah
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono uppercase font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Matakuliah
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bobot SKS
                  </label>
                  <select
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value={1}>1 SKS</option>
                    <option value={2}>2 SKS</option>
                    <option value={3}>3 SKS</option>
                    <option value={4}>4 SKS</option>
                    <option value={6}>6 SKS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fakultas
                  </label>
                  <select
                    value={formFaculty}
                    onChange={(e) => handleChangeFaculty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {faculties.map((f) => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Program Studi
                  </label>
                  <select
                    value={formStudyProgram}
                    onChange={(e) => setFormStudyProgram(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {filteredStudyPrograms.length > 0 ? (
                      filteredStudyPrograms.map((sp) => (
                        <option key={sp.id} value={sp.name}>{sp.name} ({sp.degree})</option>
                      ))
                    ) : (
                      studyPrograms.map((sp) => (
                        <option key={sp.id} value={sp.name}>{sp.name} ({sp.degree})</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mode Perkuliahan
                  </label>
                  <select
                    value={formDeliveryMode}
                    onChange={(e) => setFormDeliveryMode(e.target.value as DeliveryMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-blue-600"
                  >
                    <option value="HYBRID">HYBRID</option>
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dosen Pengampu Utama / Koordinator
                </label>
                <select
                  value={formInstructorId}
                  onChange={(e) => setFormInstructorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  {dosenList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.nim_nip ? `(NIP: ${d.nim_nip})` : ""} - {d.faculty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hari Perkuliahan
                  </label>
                  <select
                    value={formScheduleDay}
                    onChange={(e) => setFormScheduleDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Perkuliahan
                  </label>
                  <input
                    type="text"
                    value={formScheduleTime}
                    onChange={(e) => setFormScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ruang Kelas / Lab
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Silabus
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isSavingEditCourse}
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEditCourse}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                  {isSavingEditCourse ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PENGATURAN TIM TEACHING & PENJADWALAN PERTEMUAN */}
      {teamTeachingTargetCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono text-xs font-bold">
                    {teamTeachingTargetCourse.code}
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Pengaturan Tim Teaching & Jadwal Pertemuan
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {teamTeachingTargetCourse.name} • Tentukan dosen yang mengajar pada nomor pertemuan tertentu (Pekan 1–16).
                </p>
              </div>
              <button
                onClick={() => setTeamTeachingTargetCourse(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Lecturer to Team Picker */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                + Tambah Dosen ke Tim Teaching:
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="add-dosen-select"
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Pilih Dosen Pengajar UCIC...
                  </option>
                  {dosenList
                    .filter((d) => !editableTeamTeaching.some((tt) => tt.dosenId === d.id))
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} (NIP: {d.nim_nip}) - {d.faculty}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById("add-dosen-select") as HTMLSelectElement;
                    if (sel && sel.value) {
                      handleAddTeamMember(sel.value);
                      sel.value = "";
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-colors"
                >
                  Tambahkan
                </button>
              </div>
            </div>

            {/* List of Lecturers with Interactive Meeting Number Grid */}
            <div className="space-y-4">
              {editableTeamTeaching.map((tt, idx) => (
                <div
                  key={tt.dosenId}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={tt.dosenAvatar}
                        alt={tt.dosenName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {tt.dosenName}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setEditableTeamTeaching((prev) =>
                                prev.map((item) => ({
                                  ...item,
                                  role: item.dosenId === tt.dosenId ? "KOORDINATOR" : "ANGGOTA",
                                }))
                              );
                            }}
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                              tt.role === "KOORDINATOR"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-700"
                            }`}
                            title="Klik untuk jadikan Koordinator Tim Pengampu"
                          >
                            {tt.role === "KOORDINATOR" ? "⭐ KOORDINATOR" : "Set Jadi Koordinator"}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">NIP: {tt.dosenNip}</p>
                      </div>
                    </div>

                    {editableTeamTeaching.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(tt.dosenId)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Hapus dari Tim
                      </button>
                    )}
                  </div>

                  {/* Meeting Assignment Buttons (1 to 16) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Pilih Pertemuan Yang Diajar ({normalizeAssignedMeetings(tt.assignedMeetings).length} Pertemuan Terpilih):
                      </label>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-slate-400">Pilihan Cepat:</span>
                        <button
                          type="button"
                          onClick={() => handleQuickPresetMeetings(tt.dosenId, "UTS_BEFORE")}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 hover:text-blue-700 font-semibold"
                        >
                          Pekan 1–8 (Sebelum UTS)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPresetMeetings(tt.dosenId, "UTS_AFTER")}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 hover:text-blue-700 font-semibold"
                        >
                          Pekan 9–16 (Setelah UTS)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPresetMeetings(tt.dosenId, "ALL")}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 hover:text-emerald-700 font-semibold"
                        >
                          Semua (1–16)
                        </button>
                      </div>
                    </div>

                    {/* 16 Number Toggles */}
                    <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                      {Array.from({ length: 16 }, (_, i) => i + 1).map((weekNum) => {
                        const isSelected = normalizeAssignedMeetings(tt.assignedMeetings).includes(weekNum);
                        return (
                          <button
                            key={weekNum}
                            type="button"
                            onClick={() => handleToggleMeeting(tt.dosenId, weekNum)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            <span className="text-[9px] text-slate-400 dark:text-slate-400 opacity-70">P</span>
                            {weekNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Buttons */}
            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isSavingTeamTeaching}
                onClick={() => setTeamTeachingTargetCourse(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSavingTeamTeaching}
                onClick={handleSaveTeamTeaching}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
              >
                {isSavingTeamTeaching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan ke Database...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Simpan Alokasi Tim Teaching
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingCourseId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Konfirmasi Hapus Matakuliah
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus matakuliah ini dari kurikulum? Modul dan penugasan terkait akan ikut terhapus.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingCourseId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Ya, Hapus Matakuliah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
