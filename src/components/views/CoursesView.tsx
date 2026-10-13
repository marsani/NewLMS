"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Course, Module, ModuleItem, ModuleItemType, normalizeAssignedMeetings } from "@/types";
import { parseVideoUrl } from "@/lib/videoHelper";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  HelpCircle,
  FileCheck2,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  Eye,
  EyeOff,
  CheckCircle2,
  PlayCircle,
  Download,
  Users,
  Sparkles,
  Layers,
  Edit2,
  Trash2,
  X,
  Youtube,
  AlertCircle,
  Info,
  UploadCloud,
  Loader2,
  Pencil,
} from "lucide-react";

interface CoursesViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ onNavigate }) => {
  const {
    currentUser,
    courses,
    userCourses,
    activeCourseId,
    setActiveCourseId,
    assignCourseLecturer,
    addCourseModule,
    updateCourseModule,
    deleteCourseModule,
    addModuleItem,
    updateModuleItem,
    deleteModuleItem,
    toggleModulePublish,
    createAssignment,
    updateAssignment,
    assignments,
  } = useApp();

  const [selectedClaimCourseId, setSelectedClaimCourseId] = useState(courses[0]?.id || "");

  const activeCourse = userCourses.find((c) => c.id === activeCourseId) || userCourses[0] || null;

  // If no courses are assigned to this user/dosen
  if (!activeCourse || userCourses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {currentUser.role === "ADMIN"
                ? "Belum Ada Matakuliah Dibuat"
                : currentUser.role === "DOSEN"
                ? "Belum Ada Matakuliah Yang Diampu"
                : "Belum Ada Matakuliah Aktif"}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {currentUser.role === "ADMIN"
                ? "Sistem belum memiliki data matakuliah. Silakan buat matakuliah baru melalui menu Plotting Matakuliah."
                : currentUser.role === "DOSEN"
                ? "Akun Dosen Anda belum di-plotting pada matakuliah manapun di semester ini. Silakan hubungi admin akademik untuk penugasan kelas atau koordinasi tim teaching."
                : "Belum ada kelas perkuliahan aktif yang dibuka untuk semester ini. Silakan hubungi bagian akademik atau tunggu plotting kelas dari dosen pengampu."}
            </p>
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
              Akun Aktif: <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span> ({currentUser.role === "STUDENT" ? "NIM" : "NIP"}: {currentUser.nim_nip || "-"})
            </div>
          </div>

          {/* Quick Claim / Connect to Course if available */}
          {courses.length > 0 && currentUser.role === "DOSEN" && (
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-left">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                💡 Hubungkan Akun Anda Langsung ke Matakuliah:
              </label>
              <select
                value={selectedClaimCourseId || courses[0]?.id || ""}
                onChange={(e) => setSelectedClaimCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} ({c.credits} SKS)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedClaimCourseId || courses[0]?.id;
                  if (!targetId) return;
                  assignCourseLecturer(targetId, currentUser.id);
                  setActiveCourseId(targetId);
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Hubungkan Saya Sebagai Dosen Pengampu
              </button>
            </div>
          )}

          {currentUser.role === "ADMIN" && (
            <button
              onClick={() => onNavigate("admin-courses")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all shadow-md"
            >
              Buka Manajemen Plotting Matakuliah →
            </button>
          )}
        </div>
      </div>
    );
  }

  // States
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "mod-1": true,
    "mod-2": true,
  });
  const [selectedItemForPreview, setSelectedItemForPreview] = useState<ModuleItem | null>(null);

  // Dosen Modals
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string>("");
  const [showAllWeeksForCoordinator, setShowAllWeeksForCoordinator] = useState(false);

  // Edit Item Modal States
  const [editingItem, setEditingItem] = useState<{ moduleId: string; item: ModuleItem } | null>(null);

  // Edit Module Modal States
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [editModuleDesc, setEditModuleDesc] = useState("");
  const [editModuleWeek, setEditModuleWeek] = useState(1);
  const [editModuleAssignedDosenId, setEditModuleAssignedDosenId] = useState("");
  const [editModuleIsPublished, setEditModuleIsPublished] = useState(true);
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [moduleToast, setModuleToast] = useState<string | null>(null);

  // Form states (Add Module)
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  const [newModuleWeek, setNewModuleWeek] = useState(1);

  // Identify if current lecturer is part of team teaching in activeCourse
  const currentLecturerTeamMember = React.useMemo(() => {
    if (!activeCourse?.teamTeaching || activeCourse.teamTeaching.length === 0) return null;
    if (currentUser.role !== "DOSEN") return null;

    const normalizeLecturer = (str: string) =>
      (str || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\b(dr|dra|ir|prof|phd|mkom|skom|mt|mti|st|si|msi|mm|bapak|bpk|ibu|dosen)\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const currentNorm = normalizeLecturer(currentUser.name);
    const currentTokens = currentNorm.split(" ").filter((t) => t.length >= 3);

    const found = activeCourse.teamTeaching.find((tt) => {
      if (tt.dosenId && (tt.dosenId === currentUser.id || tt.dosenId === currentUser.nim_nip)) return true;
      if (
        tt.dosenNip &&
        currentUser.nim_nip &&
        tt.dosenNip.trim().toLowerCase() === currentUser.nim_nip.trim().toLowerCase()
      )
        return true;
      const ttNorm = normalizeLecturer(tt.dosenName || "");
      const ttTokens = ttNorm.split(" ").filter((t) => t.length >= 3);
      const ttTokenMatch = currentTokens.some((t) => ttTokens.includes(t));
      return (
        (currentNorm && ttNorm && (currentNorm === ttNorm || currentNorm.includes(ttNorm) || ttNorm.includes(currentNorm))) ||
        ttTokenMatch
      );
    });

    if (!found) return null;
    return {
      ...found,
      assignedMeetings: normalizeAssignedMeetings(found.assignedMeetings),
    };
  }, [activeCourse, currentUser]);

  const existingWeeks = React.useMemo(() => {
    return new Set(activeCourse?.modules?.map((m) => m.weekNumber) || []);
  }, [activeCourse]);

  const selectableWeeks = React.useMemo(() => {
    if (!activeCourse) return Array.from({ length: 16 }, (_, i) => i + 1);

    const myMeetings = normalizeAssignedMeetings(currentLecturerTeamMember?.assignedMeetings);

    if (
      currentLecturerTeamMember &&
      myMeetings.length > 0 &&
      !showAllWeeksForCoordinator
    ) {
      return myMeetings;
    }

    return Array.from({ length: 16 }, (_, i) => i + 1);
  }, [activeCourse, currentLecturerTeamMember, showAllWeeksForCoordinator]);

  const handleOpenAddModule = () => {
    const nextAvailableWeek =
      selectableWeeks.find((w) => !existingWeeks.has(w)) ||
      selectableWeeks[0] ||
      1;
    setNewModuleWeek(nextAvailableWeek);
    setNewModuleTitle("");
    setNewModuleDesc("");
    setShowAddModuleModal(true);
  };

  // Form states (Add Item)
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemType, setNewItemType] = useState<ModuleItemType>("VIDEO_HLS");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemSoalFileName, setNewItemSoalFileName] = useState("");
  const [newItemSoalFileSize, setNewItemSoalFileSize] = useState("");
  const [newItemDeadline, setNewItemDeadline] = useState("2026-09-28T23:59");
  const [newItemMaxScore, setNewItemMaxScore] = useState<number>(100);

  // Form states (Edit Item)
  const [editItemTitle, setEditItemTitle] = useState("");
  const [editItemType, setEditItemType] = useState<ModuleItemType>("DOCUMENT");
  const [editItemUrl, setEditItemUrl] = useState("");
  const [editItemDesc, setEditItemDesc] = useState("");
  const [editItemSoalFileName, setEditItemSoalFileName] = useState("");
  const [editItemSoalFileSize, setEditItemSoalFileSize] = useState("");
  const [editItemDeadline, setEditItemDeadline] = useState("2026-09-28T23:59");
  const [editItemMaxScore, setEditItemMaxScore] = useState<number>(100);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim() || !activeCourse) return;
    setIsSavingModule(true);
    try {
      // Resolve assigned dosen for this selected week
      const assignedMember = activeCourse?.teamTeaching?.find((tt) =>
        tt.assignedMeetings.includes(Number(newModuleWeek))
      );
      const assignedDosenId = assignedMember?.dosenId || (currentUser.role === "DOSEN" ? currentUser.id : undefined);

      const res = await addCourseModule(
        activeCourse.id,
        newModuleTitle.trim(),
        newModuleDesc.trim(),
        Number(newModuleWeek),
        assignedDosenId
      );

      if (res && res.success) {
        setModuleToast(`✅ Modul Pekan ${newModuleWeek} berhasil ditambahkan dan disimpan ke database!`);
        setNewModuleTitle("");
        setNewModuleDesc("");
        setShowAddModuleModal(false);
      } else {
        alert(res?.error || "Gagal menyimpan modul ke database.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + (err?.message || err));
    } finally {
      setIsSavingModule(false);
      setTimeout(() => setModuleToast(null), 4000);
    }
  };

  const handleOpenEditModule = (mod: Module) => {
    setEditingModule(mod);
    setEditModuleTitle(mod.title);
    setEditModuleDesc(mod.description || "");
    setEditModuleWeek(mod.weekNumber);
    setEditModuleAssignedDosenId(mod.assignedDosenId || "");
    setEditModuleIsPublished(mod.isPublished);
  };

  const handleSaveEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !editModuleTitle.trim() || !activeCourse) return;
    setIsSavingModule(true);
    try {
      const res = await updateCourseModule(activeCourse.id, editingModule.id, {
        title: editModuleTitle.trim(),
        description: editModuleDesc.trim(),
        weekNumber: Number(editModuleWeek),
        assignedDosenId: editModuleAssignedDosenId || undefined,
        isPublished: editModuleIsPublished,
      });

      if (res && res.success) {
        setModuleToast(`✅ Modul Pekan ${editModuleWeek} ("${editModuleTitle}") berhasil diperbarui di database!`);
        setEditingModule(null);
      } else {
        alert(res?.error || "Gagal memperbarui modul di database.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + (err?.message || err));
    } finally {
      setIsSavingModule(false);
      setTimeout(() => setModuleToast(null), 4000);
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (!activeCourse) return;
    if (confirm(`Hapus seluruh modul "${moduleTitle}" beserta isinya dari database?`)) {
      setIsSavingModule(true);
      try {
        const res = await deleteCourseModule(activeCourse.id, moduleId);
        if (res && res.success) {
          setModuleToast(`✅ Modul "${moduleTitle}" berhasil dihapus dari database.`);
        } else {
          alert(res?.error || "Gagal menghapus modul dari database.");
        }
      } catch (err: any) {
        alert("Terjadi kesalahan: " + (err?.message || err));
      } finally {
        setIsSavingModule(false);
        setTimeout(() => setModuleToast(null), 4000);
      }
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !targetModuleId || !activeCourse) return;
    setIsSavingItem(true);
    try {
      let linkedAssignmentId: string | undefined = undefined;

      if (newItemType === "ASSIGNMENT") {
        const created = createAssignment({
          courseId: activeCourse.id,
          courseName: activeCourse.name,
          title: newItemTitle.trim(),
          instructions: newItemDesc.trim() || "Kerjakan tugas sesuai instruksi dan berkas panduan yang dilampirkan.",
          attachmentFileName: newItemSoalFileName || (newItemUrl ? "Lembar_Soal_Tugas.pdf" : ""),
          attachmentFileSize: newItemSoalFileSize || (newItemSoalFileName ? "1.8 MB" : ""),
          attachmentUrl: newItemUrl.trim() || (newItemSoalFileName ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" : ""),
          deadline: newItemDeadline ? new Date(newItemDeadline).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          maxScore: Number(newItemMaxScore) || 100,
        });
        linkedAssignmentId = created.id;
      }

      const res = await addModuleItem(activeCourse.id, targetModuleId, {
        title: newItemTitle.trim(),
        type: newItemType,
        contentUrl: newItemUrl.trim() || (newItemType === "VIDEO_HLS" ? "https://www.youtube.com/watch?v=kqtD5dpn9C8" : newItemType === "DOCUMENT" ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" : undefined),
        description: newItemDesc.trim(),
        durationMinutes: 30,
        isMandatory: true,
        isCompleted: false,
        assignmentId: linkedAssignmentId,
      });

      if (res && res.success) {
        setModuleToast(`✅ Materi "${newItemTitle}" berhasil ditambahkan dan disimpan ke database!`);
        setNewItemTitle("");
        setNewItemUrl("");
        setNewItemDesc("");
        setNewItemSoalFileName("");
        setNewItemSoalFileSize("");
        setShowAddItemModal(false);
      } else {
        alert(res?.error || "Gagal menyimpan materi ke database.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + (err?.message || err));
    } finally {
      setIsSavingItem(false);
      setTimeout(() => setModuleToast(null), 4000);
    }
  };

  const handleOpenEditItem = (moduleId: string, item: ModuleItem) => {
    setEditingItem({ moduleId, item });
    setEditItemTitle(item.title);
    setEditItemType(item.type);
    setEditItemUrl(item.contentUrl || "");
    setEditItemDesc(item.description || "");

    // Find linked assignment if available
    const linkedAssign = item.assignmentId
      ? assignments.find((a) => a.id === item.assignmentId)
      : assignments.find((a) => a.title === item.title && a.courseId === activeCourse?.id);

    if (linkedAssign) {
      setEditItemSoalFileName(linkedAssign.attachmentFileName || "");
      setEditItemSoalFileSize(linkedAssign.attachmentFileSize || "");
      setEditItemDeadline(linkedAssign.deadline ? linkedAssign.deadline.slice(0, 16) : "2026-09-28T23:59");
      setEditItemMaxScore(linkedAssign.maxScore || 100);
      setEditItemUrl(linkedAssign.attachmentUrl || item.contentUrl || "");
      setEditItemDesc(linkedAssign.instructions || item.description || "");
    } else {
      setEditItemSoalFileName("");
      setEditItemSoalFileSize("");
      setEditItemDeadline("2026-09-28T23:59");
      setEditItemMaxScore(100);
    }
  };

  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editItemTitle.trim() || !activeCourse) return;
    setIsSavingItem(true);
    try {
      let targetAssignmentId = editingItem.item.assignmentId;

      if (editItemType === "ASSIGNMENT") {
        if (targetAssignmentId) {
          updateAssignment(targetAssignmentId, {
            title: editItemTitle.trim(),
            instructions: editItemDesc.trim(),
            attachmentFileName: editItemSoalFileName,
            attachmentFileSize: editItemSoalFileSize,
            attachmentUrl: editItemUrl.trim(),
            deadline: editItemDeadline ? new Date(editItemDeadline).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            maxScore: Number(editItemMaxScore) || 100,
          });
        } else {
          const created = createAssignment({
            courseId: activeCourse.id,
            courseName: activeCourse.name,
            title: editItemTitle.trim(),
            instructions: editItemDesc.trim() || "Kerjakan tugas sesuai instruksi dan berkas panduan yang dilampirkan.",
            attachmentFileName: editItemSoalFileName || (editItemUrl ? "Lembar_Soal_Tugas.pdf" : ""),
            attachmentFileSize: editItemSoalFileSize || (editItemSoalFileName ? "2.0 MB" : ""),
            attachmentUrl: editItemUrl.trim() || (editItemSoalFileName ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" : ""),
            deadline: editItemDeadline ? new Date(editItemDeadline).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            maxScore: Number(editItemMaxScore) || 100,
          });
          targetAssignmentId = created.id;
        }
      }

      const res = await updateModuleItem(activeCourse.id, editingItem.moduleId, editingItem.item.id, {
        title: editItemTitle.trim(),
        type: editItemType,
        contentUrl: editItemUrl.trim(),
        description: editItemDesc.trim(),
        assignmentId: targetAssignmentId,
      });

      if (res && res.success) {
        setModuleToast(`✅ Materi "${editItemTitle}" berhasil diperbarui di database!`);
        setEditingItem(null);
      } else {
        alert(res?.error || "Gagal memperbarui materi di database.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + (err?.message || err));
    } finally {
      setIsSavingItem(false);
      setTimeout(() => setModuleToast(null), 4000);
    }
  };

  const handleDeleteItem = async (moduleId: string, itemId: string, itemTitle: string) => {
    if (!activeCourse) return;
    if (confirm(`Apakah Anda yakin ingin menghapus materi: "${itemTitle}" dari database?`)) {
      try {
        const res = await deleteModuleItem(activeCourse.id, moduleId, itemId);
        if (res && res.success) {
          setModuleToast(`✅ Materi "${itemTitle}" berhasil dihapus dari database.`);
        } else {
          alert(res?.error || "Gagal menghapus materi.");
        }
      } catch (err: any) {
        alert("Terjadi kesalahan: " + (err?.message || err));
      } finally {
        setTimeout(() => setModuleToast(null), 4000);
      }
    }
  };

  const getItemIcon = (type: ModuleItemType) => {
    switch (type) {
      case "DOCUMENT":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "VIDEO_HLS":
        return <Video className="w-4 h-4 text-rose-500" />;
      case "HYBRID_SESSION":
        return <Users className="w-4 h-4 text-amber-500" />;
      case "ASSIGNMENT":
        return <FileCheck2 className="w-4 h-4 text-emerald-500" />;
      case "QUIZ":
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
    }
  };

  // Video embed metadata
  const videoInfo = selectedItemForPreview ? parseVideoUrl(selectedItemForPreview.contentUrl) : null;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {moduleToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{moduleToast}</span>
        </div>
      )}

      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {userCourses.map((course) => {
          const isActive = course.id === activeCourse?.id;
          return (
            <button
              key={course.id}
              onClick={() => setActiveCourseId(course.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <span className="font-mono">{course.code}</span>
              <span className="max-w-[180px] truncate">{course.name}</span>
            </button>
          );
        })}
      </div>

      {/* Course Header Banner */}
      {activeCourse && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="relative h-40 sm:h-52 w-full overflow-hidden bg-slate-900">
            <img
              src={activeCourse.coverImage}
              alt={activeCourse.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white font-mono">
                    {activeCourse.code}
                  </span>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      activeCourse.deliveryMode === "HYBRID"
                        ? "bg-amber-500 text-slate-950"
                        : activeCourse.deliveryMode === "ONLINE"
                        ? "bg-blue-500 text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    MODE: {activeCourse.deliveryMode}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {activeCourse.credits} SKS • {activeCourse.semester}
                  </span>
                  {activeCourse.teamTeaching && activeCourse.teamTeaching.length > 1 && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500 text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Tim Teaching ({activeCourse.teamTeaching.length} Dosen)
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {activeCourse.name}
                </h2>
              </div>

              {activeCourse.meetingLink && (
                <a
                  href={activeCourse.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Video className="w-4 h-4" /> Gabung Kelas Hybrid
                </a>
              )}
            </div>
          </div>

          {/* Details Bar & Team Teaching Badges */}
          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={activeCourse.instructorAvatar}
                alt={activeCourse.instructorName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
              />
              <div>
                <p className="text-slate-400 text-[11px]">
                  {activeCourse.teamTeaching && activeCourse.teamTeaching.length > 1
                    ? "Dosen Koordinator"
                    : "Dosen Pengampu"}
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {activeCourse.instructorName}
                </p>
                <p className="text-[10px] text-slate-500">NIP: {activeCourse.instructorNip}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Jadwal & Waktu</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {activeCourse.scheduleDay}, {activeCourse.scheduleTime}
                </p>
                <p className="text-[10px] text-slate-500">{activeCourse.room}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Program Studi</p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {activeCourse.studyProgram}
                </p>
                <p className="text-[10px] text-slate-500">{activeCourse.faculty}</p>
              </div>
            </div>
          </div>

          {/* Team Teaching Members Roster */}
          {activeCourse.teamTeaching && activeCourse.teamTeaching.length > 0 && (
            <div className="px-5 py-3 sm:px-6 bg-blue-50/50 dark:bg-blue-950/20 border-t border-blue-100 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold">
                <Users className="w-4 h-4 text-blue-600" /> Dosen Pengajar Tim Teaching:
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {activeCourse.teamTeaching.map((tt, idx) => {
                  const meetings = normalizeAssignedMeetings(tt.assignedMeetings);
                  const isCurrentDosen = currentLecturerTeamMember && (tt.dosenId === currentLecturerTeamMember.dosenId || (tt.dosenNip && tt.dosenNip === currentLecturerTeamMember.dosenNip));
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border shadow-sm ${
                        isCurrentDosen
                          ? "bg-blue-100/70 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 ring-1 ring-blue-500/20"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <img
                        src={tt.dosenAvatar}
                        alt={tt.dosenName}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/30"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {tt.dosenName} {isCurrentDosen ? "(Anda)" : ""}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                        Pekan {meetings.length > 0 ? meetings.join(", ") : "-"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modules Structure & Course Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Struktur Silabus & Modul Pembelajaran
            </h3>
            <p className="text-xs text-slate-500">
              Pelajari materi berurutan per pekan, tonton video perkuliahan (YouTube/HLS), dan kerjakan evaluasi.
            </p>
          </div>

          {(currentUser.role === "DOSEN" || currentUser.role === "ADMIN") && (
            <button
              onClick={handleOpenAddModule}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah Modul Pekan
            </button>
          )}
        </div>

        {/* Modules Accordion */}
        <div className="space-y-3">
          {activeCourse?.modules.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              Belum ada modul yang ditambahkan untuk matakuliah ini.
            </div>
          ) : (
            activeCourse?.modules.map((mod) => {
              const isExpanded = !!expandedModules[mod.id];
              const assignedLecturer =
                mod.assignedDosenName ||
                activeCourse.teamTeaching?.find((tt) => normalizeAssignedMeetings(tt.assignedMeetings).includes(mod.weekNumber))
                  ?.dosenName ||
                activeCourse.instructorName;

              const isMyWeek =
                currentLecturerTeamMember &&
                normalizeAssignedMeetings(currentLecturerTeamMember.assignedMeetings).includes(mod.weekNumber);

              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl bg-white dark:bg-slate-900 border overflow-hidden shadow-sm transition-all ${
                    isMyWeek
                      ? "border-blue-300 dark:border-blue-800 ring-1 ring-blue-500/15"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {/* Module Accordion Header */}
                  <div
                    onClick={() => toggleModule(mod.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded-lg text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {mod.title}
                          </h4>
                          {assignedLecturer && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${
                              isMyWeek
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                            }`}>
                              👨‍🏫 Pengajar: {assignedLecturer} {isMyWeek ? "• (Pekan Anda)" : ""}
                            </span>
                          )}
                          {!mod.isPublished && (
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Draft (Belum Rilis)
                            </span>
                          )}
                        </div>
                        {mod.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium hidden sm:inline">
                        {mod.items.length} Komponen
                      </span>
                      {(currentUser.role === "DOSEN" || currentUser.role === "ADMIN") && (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleModulePublish(activeCourse.id, mod.id)}
                            title={mod.isPublished ? "Sembunyikan Modul" : "Publikasikan Modul"}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {mod.isPublished ? (
                              <Eye className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setTargetModuleId(mod.id);
                              setShowAddItemModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambah Item
                          </button>
                          <button
                            onClick={() => handleOpenEditModule(mod)}
                            title="Edit Modul Pekan"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id, mod.title)}
                            title="Hapus Modul Pekan"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Module Items List */}
                  {isExpanded && (
                    <div className="px-4 pb-4 sm:px-6 sm:pb-5 pt-1 space-y-2 border-t border-slate-100 dark:border-slate-800/80">
                      {mod.items.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2 italic">
                          Belum ada materi atau tugas dalam pekan ini.
                        </p>
                      ) : (
                        mod.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-3 border border-slate-100 dark:border-slate-800/60"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm shrink-0">
                                {getItemIcon(item.type)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                                    {item.title}
                                  </p>
                                  {item.type === "VIDEO_HLS" && item.contentUrl?.includes("youtube") && (
                                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-0.5">
                                      <Youtube className="w-2.5 h-2.5" /> YouTube
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {item.description || `${item.type} • Durasi ~${item.durationMinutes} menit`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Action buttons (View/Open) */}
                              {item.type === "ASSIGNMENT" ? (
                                <button
                                  onClick={() => onNavigate("assignments", item.assignmentId)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                  <FileCheck2 className="w-3.5 h-3.5" />
                                  {currentUser.role === "DOSEN" || currentUser.role === "ADMIN"
                                    ? "Kelola & Koreksi Tugas"
                                    : "Buka Tugas"}
                                </button>
                              ) : item.type === "QUIZ" ? (
                                <button
                                  onClick={() => onNavigate("quizzes", item.quizId)}
                                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  {currentUser.role === "DOSEN" || currentUser.role === "ADMIN"
                                    ? "Kelola & Rekap Kuis"
                                    : "Kerjakan Kuis"}
                                </button>
                              ) : item.type === "HYBRID_SESSION" ? (
                                <a
                                  href={item.contentUrl || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                                >
                                  <Users className="w-3.5 h-3.5" /> Gabung Sesi
                                </a>
                              ) : (
                                <button
                                  onClick={() => setSelectedItemForPreview(item)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                                >
                                  {item.type === "VIDEO_HLS" ? (
                                    <>
                                      <PlayCircle className="w-3.5 h-3.5" /> Tonton Video
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="w-3.5 h-3.5" /> Baca Dokumen
                                    </>
                                  )}
                                </button>
                              )}

                              {/* Dosen Edit and Delete Item Action Buttons */}
                              {(currentUser.role === "DOSEN" || currentUser.role === "ADMIN") && (
                                <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700">
                                  <button
                                    onClick={() => handleOpenEditItem(mod.id, item)}
                                    title="Edit Materi / Tautan Video"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(mod.id, item.id, item.title)}
                                    title="Hapus Materi"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL VIDEO / DOCUMENT PLAYER PREVIEW (WITH YOUTUBE IFRAME SUPPORT) */}
      {selectedItemForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                  {getItemIcon(selectedItemForPreview.type)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedItemForPreview.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {selectedItemForPreview.type === "VIDEO_HLS"
                      ? videoInfo?.type === "YOUTUBE"
                        ? "Pemutar Video YouTube Terintegrasi"
                        : "Pemutar Video Pembelajaran Interaktif"
                      : "Pembaca Dokumen Terintegrasi"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemForPreview(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video & Document Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {selectedItemForPreview.type === "VIDEO_HLS" ? (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                    {videoInfo?.type === "YOUTUBE" || videoInfo?.type === "GDRIVE" || videoInfo?.type === "VIMEO" ? (
                      /* Responsive IFrame for YouTube / Google Drive / Vimeo */
                      <iframe
                        className="w-full h-full border-0"
                        src={videoInfo.embedUrl}
                        title={selectedItemForPreview.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      /* HTML5 Direct MP4 / HLS Video tag */
                      <video
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                        src={videoInfo?.embedUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                      >
                        Browser Anda tidak mendukung tag video.
                      </video>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-200 flex items-start justify-between gap-3">
                    <div>
                      💡 <strong>Smart Progress Tracking:</strong> Menonton materi video perkuliahan hingga tuntas akan otomatis memperbarui progres kelulusan modul Anda.
                    </div>
                    {videoInfo?.originalUrl && (
                      <a
                        href={videoInfo.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0 flex items-center gap-1"
                      >
                        Buka di Tab Asli <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-center space-y-3">
                    <FileText className="w-16 h-16 text-blue-500 mx-auto" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {selectedItemForPreview.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Dokumen Perkuliahan • Format PDF/Dokumen • LMS-UCIC
                      </p>
                    </div>
                    <div className="pt-2 flex justify-center gap-3">
                      <a
                        href={selectedItemForPreview.contentUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" /> Buka Tab Baru
                      </a>
                      <button
                        onClick={() => setSelectedItemForPreview(null)}
                        className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT ITEM (DOSEN) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" /> Edit Materi / Komponen Pembelajaran
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-3.5 text-xs max-h-[80vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipe Komponen
                </label>
                <select
                  value={editItemType}
                  onChange={(e) => setEditItemType(e.target.value as ModuleItemType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="VIDEO_HLS">🎥 Video Perkuliahan (YouTube / MP4 / HLS)</option>
                  <option value="DOCUMENT">📄 Dokumen / Slide Presentasi (PDF/PPT/Word)</option>
                  <option value="ASSIGNMENT">📝 Tugas Kuliah & Unggah Berkas Soal</option>
                  <option value="HYBRID_SESSION">🌐 Tautan Pertemuan Hybrid (Zoom/Google Meet)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {editItemType === "ASSIGNMENT" ? "Judul Tugas Kuliah" : "Judul Materi"}
                </label>
                <input
                  type="text"
                  value={editItemTitle}
                  onChange={(e) => setEditItemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              {/* Assignment-Specific Fields: Question file, Deadline, Max score */}
              {editItemType === "ASSIGNMENT" ? (
                <>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-emerald-600" /> Berkas Soal Tugas (Dosen)
                      </span>
                      {editItemSoalFileName && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditItemSoalFileName("");
                            setEditItemSoalFileSize("");
                            setEditItemUrl("");
                          }}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          Hapus File
                        </button>
                      )}
                    </div>

                    <div
                      onClick={() => {
                        setEditItemSoalFileName(
                          `Soal_${editItemTitle ? editItemTitle.slice(0, 18).replace(/\s+/g, "_") : "Tugas"}.pdf`
                        );
                        setEditItemSoalFileSize("2.4 MB");
                        setEditItemUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
                      }}
                      className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                        editItemSoalFileName
                          ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-sm"
                          : "border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-white/70 dark:bg-slate-900/60"
                      }`}
                    >
                      {editItemSoalFileName ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="w-8 h-8 text-emerald-600" />
                          <div className="text-left">
                            <p className="font-bold text-xs text-slate-900 dark:text-white">
                              {editItemSoalFileName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Ukuran: {editItemSoalFileSize || "2.4 MB"} • Klik untuk ganti berkas
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            Klik untuk mengunggah berkas soal tugas (PDF / DOCX / ZIP)
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Maksimal 25MB • Mahasiswa dapat mengunduh berkas soal ini
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Atau Masukkan Tautan / URL Berkas Soal
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... atau https://..."
                        value={editItemUrl}
                        onChange={(e) => setEditItemUrl(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Batas Waktu Pengumpulan (Deadline)
                      </label>
                      <input
                        type="datetime-local"
                        value={editItemDeadline}
                        onChange={(e) => setEditItemDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nilai Maksimal (Poin)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={editItemMaxScore}
                        onChange={(e) => setEditItemMaxScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium text-xs"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Tautan Video / Berkas
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... atau https://..."
                    value={editItemUrl}
                    onChange={(e) => setEditItemUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 Tips: Salin langsung link YouTube (contoh: <code>https://www.youtube.com/watch?v=...</code> atau <code>https://youtu.be/...</code>), sistem akan otomatis memutar video di LMS!
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {editItemType === "ASSIGNMENT" ? "Petunjuk & Spesifikasi Tugas Bagi Mahasiswa" : "Deskripsi / Petunjuk Mahasiswa"}
                </label>
                <textarea
                  rows={editItemType === "ASSIGNMENT" ? 3 : 2}
                  value={editItemDesc}
                  onChange={(e) => setEditItemDesc(e.target.value)}
                  placeholder={
                    editItemType === "ASSIGNMENT"
                      ? "Jelaskan rincian instruksi pengerjaan tugas, format pengumpulan (PDF/ZIP), dan kriteria penilaian..."
                      : "Keterangan materi yang harus dipelajari mahasiswa..."
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow flex items-center gap-2"
                >
                  {isSavingItem ? (
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

      {/* MODAL ADD MODULE (DOSEN) */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" /> Tambah Modul Pertemuan Baru
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeCourse.code} • {activeCourse.name}
                </p>
              </div>
              <button
                onClick={() => setShowAddModuleModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Team Teaching Information Banner */}
            {currentLecturerTeamMember && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-blue-950 dark:text-blue-200 text-xs">
                      Tim Teaching: {currentLecturerTeamMember.role === "KOORDINATOR" ? "Koordinator Tim" : "Dosen Anggota"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px]">
                    {currentLecturerTeamMember.assignedMeetings.length} Pertemuan Terjadwal
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  Pekan mengajar Anda:{" "}
                  <span className="font-extrabold text-blue-950 dark:text-white">
                    Pekan {currentLecturerTeamMember.assignedMeetings.join(", ")}
                  </span>
                  . Pilihan nomor pekan di bawah otomatis disesuaikan dengan alokasi Anda.
                </p>

                {currentLecturerTeamMember.role === "KOORDINATOR" && (
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between">
                    <label className="text-[11px] text-blue-900 dark:text-blue-200 font-semibold cursor-pointer flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={showAllWeeksForCoordinator}
                        onChange={(e) => setShowAllWeeksForCoordinator(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      Buka semua pekan (Hak Akses Koordinator)
                    </label>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleCreateModule} className="space-y-4 text-xs">
              {/* Week / Pertemuan Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Nomor Pekan / Pertemuan
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {selectableWeeks.length} pekan tersedia
                  </span>
                </div>

                <select
                  value={newModuleWeek}
                  onChange={(e) => {
                    const selectedW = Number(e.target.value);
                    setNewModuleWeek(selectedW);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                >
                  {selectableWeeks.map((weekNum) => {
                    const isExisting = existingWeeks.has(weekNum);
                    const assignedMember = activeCourse.teamTeaching?.find((tt) =>
                      tt.assignedMeetings.includes(weekNum)
                    );
                    const isMyWeek = currentLecturerTeamMember?.assignedMeetings?.includes(weekNum);

                    return (
                      <option key={weekNum} value={weekNum}>
                        Pekan {weekNum}
                        {isExisting ? " — (Sudah ada modul)" : " — (Tersedia)"}
                        {assignedMember ? ` • Pengajar: ${assignedMember.dosenName}` : ""}
                        {isMyWeek ? " [Jadwal Anda]" : ""}
                      </option>
                    );
                  })}
                </select>

                {/* Quick select pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Pilih Cepat:</span>
                  {selectableWeeks.map((weekNum) => {
                    const isSelected = newModuleWeek === weekNum;
                    const isExisting = existingWeeks.has(weekNum);
                    return (
                      <button
                        key={weekNum}
                        type="button"
                        onClick={() => setNewModuleWeek(weekNum)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-400"
                            : isExisting
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        Pekan {weekNum}
                        {isExisting && <span className="text-[9px] opacity-70">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Warning if week already has module */}
                {existingWeeks.has(newModuleWeek) && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-amber-800 dark:text-amber-300 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      Modul untuk <strong>Pekan {newModuleWeek}</strong> sudah ada di silabus. Modul baru ini akan ditambahkan sebagai modul tambahan pada pertemuan tersebut.
                    </div>
                  </div>
                )}

                {/* Lecturer preview for selected week */}
                {(() => {
                  const assignedForWeek =
                    activeCourse.teamTeaching?.find((tt) => tt.assignedMeetings.includes(newModuleWeek))?.dosenName ||
                    activeCourse.instructorName;
                  return (
                    <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Dosen Pengampu Terjadwal:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        👨‍🏫 {assignedForWeek}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Modul
                </label>
                <input
                  type="text"
                  placeholder={`e.g. Pekan ${newModuleWeek}: Microservices Architecture & Containerization`}
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi & Capaian Pembelajaran
                </label>
                <textarea
                  rows={3}
                  placeholder="Rincian topik, CPMK, atau instruksi materi yang akan dibahas pada pekan ini..."
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingModule}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {isSavingModule ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Modul"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT MODULE (DOSEN) */}
      {editingModule && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-500" /> Edit Modul Pertemuan
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeCourse.code} • {activeCourse.name}
                </p>
              </div>
              <button
                onClick={() => setEditingModule(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditModule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Pekan / Pertemuan
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={editModuleWeek}
                    onChange={(e) => setEditModuleWeek(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status Rilis
                  </label>
                  <select
                    value={editModuleIsPublished ? "true" : "false"}
                    onChange={(e) => setEditModuleIsPublished(e.target.value === "true")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="true">Publikasikan (Aktif)</option>
                    <option value="false">Draft (Disembunyikan)</option>
                  </select>
                </div>
              </div>

              {/* Dosen Pengampu selector if team teaching */}
              {activeCourse.teamTeaching && activeCourse.teamTeaching.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dosen Pengampu Pertemuan Ini
                  </label>
                  <select
                    value={editModuleAssignedDosenId}
                    onChange={(e) => setEditModuleAssignedDosenId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Dosen Utama ({activeCourse.instructorName}) --</option>
                    {activeCourse.teamTeaching.map((tt) => (
                      <option key={tt.dosenId} value={tt.dosenId}>
                        {tt.dosenName} ({tt.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Modul
                </label>
                <input
                  type="text"
                  value={editModuleTitle}
                  onChange={(e) => setEditModuleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-xs text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi & Capaian Pembelajaran
                </label>
                <textarea
                  rows={3}
                  value={editModuleDesc}
                  onChange={(e) => setEditModuleDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingModule(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingModule}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {isSavingModule ? (
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

      {/* MODAL ADD ITEM (DOSEN) */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Tambah Komponen Materi / Evaluasi
              </h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs max-h-[80vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipe Komponen
                </label>
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as ModuleItemType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="VIDEO_HLS">🎥 Video Perkuliahan (YouTube / HLS / MP4)</option>
                  <option value="DOCUMENT">📄 Dokumen / Slide Presentasi (PDF/PPT/Word)</option>
                  <option value="ASSIGNMENT">📝 Tugas Kuliah & Unggah Berkas Soal</option>
                  <option value="HYBRID_SESSION">🌐 Tautan Pertemuan Hybrid (Zoom/Google Meet)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {newItemType === "ASSIGNMENT" ? "Judul Tugas Kuliah" : "Judul Materi / Komponen"}
                </label>
                <input
                  type="text"
                  placeholder={
                    newItemType === "ASSIGNMENT"
                      ? "e.g. Tugas 2: Pembuatan REST API & Relasi Model Database"
                      : "e.g. Video Kuliah: Pengenalan State Management Next.js"
                  }
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              {/* Assignment-Specific Fields: Upload Question File, Deadline, Max Score */}
              {newItemType === "ASSIGNMENT" ? (
                <>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-emerald-600" /> Unggah Berkas Soal Tugas (Dosen)
                      </span>
                      {newItemSoalFileName && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewItemSoalFileName("");
                            setNewItemSoalFileSize("");
                          }}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          Hapus File
                        </button>
                      )}
                    </div>

                    <div
                      onClick={() => {
                        setNewItemSoalFileName(
                          `Soal_${newItemTitle ? newItemTitle.slice(0, 18).replace(/\s+/g, "_") : "Tugas"}.pdf`
                        );
                        setNewItemSoalFileSize("2.2 MB");
                      }}
                      className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                        newItemSoalFileName
                          ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-sm"
                          : "border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-white/70 dark:bg-slate-900/60"
                      }`}
                    >
                      {newItemSoalFileName ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="w-8 h-8 text-emerald-600" />
                          <div className="text-left">
                            <p className="font-bold text-xs text-slate-900 dark:text-white">
                              {newItemSoalFileName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Ukuran: {newItemSoalFileSize} • Siap Dilampirkan Untuk Mahasiswa
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            Klik untuk memilih berkas soal tugas (PDF / DOCX / ZIP)
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Maksimal 25MB • Mahasiswa dapat mengunduh berkas soal ini
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Atau Masukkan Tautan / URL Berkas Soal (Opsional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... atau https://..."
                        value={newItemUrl}
                        onChange={(e) => setNewItemUrl(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Batas Waktu Pengumpulan (Deadline)
                      </label>
                      <input
                        type="datetime-local"
                        value={newItemDeadline}
                        onChange={(e) => setNewItemDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nilai Maksimal (Poin)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={newItemMaxScore}
                        onChange={(e) => setNewItemMaxScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium text-xs"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      URL Berkas / Tautan Video
                    </label>
                    {newItemType === "VIDEO_HLS" && (
                      <button
                        type="button"
                        onClick={() => setNewItemUrl("https://www.youtube.com/watch?v=kqtD5dpn9C8")}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
                      >
                        <Youtube className="w-3 h-3 text-rose-500" /> Gunakan Contoh YouTube
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder={
                      newItemType === "VIDEO_HLS"
                        ? "https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                        : "https://..."
                    }
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    {newItemType === "VIDEO_HLS"
                      ? "✨ Mendukung link YouTube (copy paste link dari browser), Google Drive Video, Vimeo, atau file .mp4 langsung."
                      : "Mendukung tautan PDF, Google Docs, atau file slide bahan ajar."}
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {newItemType === "ASSIGNMENT"
                    ? "Petunjuk & Spesifikasi Tugas Bagi Mahasiswa"
                    : "Deskripsi / Keterangan Singkat"}
                </label>
                <textarea
                  rows={newItemType === "ASSIGNMENT" ? 3 : 2}
                  placeholder={
                    newItemType === "ASSIGNMENT"
                      ? "Jelaskan langkah pengerjaan, format pengumpulan (PDF/ZIP), dan kriteria penilaian..."
                      : "Keterangan materi yang harus dipelajari mahasiswa..."
                  }
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow flex items-center gap-2"
                >
                  {isSavingItem ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : newItemType === "ASSIGNMENT" ? (
                    "Buat & Terbitkan Tugas"
                  ) : (
                    "Tambahkan ke Modul"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
