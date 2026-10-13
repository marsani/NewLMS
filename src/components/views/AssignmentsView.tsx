"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Assignment, AssignmentSubmission } from "@/types";
import {
  FileCheck2,
  Calendar,
  Clock,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  MessageSquare,
  Award,
  Sparkles,
  Search,
  ExternalLink,
  X,
  Plus,
  Edit2,
  Trash2,
  Download,
  Paperclip,
  Upload,
} from "lucide-react";
import { formatDateTime, getRemainingTime } from "@/lib/utils";

interface AssignmentsViewProps {
  selectedAssignmentId?: string;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({ selectedAssignmentId }) => {
  const {
    currentUser,
    userAssignments,
    courses,
    userCourses,
    submitAssignment,
    gradeSubmission,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    uploadAssignmentQuestionFile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "GRADED">("ALL");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
    userAssignments.find((a) => a.id === selectedAssignmentId) || userAssignments[0] || null
  );

  React.useEffect(() => {
    if (selectedAssignmentId) {
      const found = userAssignments.find((a) => a.id === selectedAssignmentId);
      if (found) setSelectedAssignment(found);
    } else if (!selectedAssignment && userAssignments.length > 0) {
      setSelectedAssignment(userAssignments[0]);
    }
  }, [userAssignments, selectedAssignment, selectedAssignmentId]);

  // Toast / feedback message
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Student upload states
  const [uploadFile, setUploadFile] = useState<{ name: string; size: string } | null>(null);
  const [studentNotes, setStudentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState(false);

  // Dosen grading modal states
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [inputScore, setInputScore] = useState<number>(90);
  const [inputFeedback, setInputFeedback] = useState<string>("");

  // Dosen Create Assignment Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createCourseId, setCreateCourseId] = useState(userCourses[0]?.id || courses[0]?.id || "");
  const [createTitle, setCreateTitle] = useState("");
  const [createInstructions, setCreateInstructions] = useState("");
  const [createDeadline, setCreateDeadline] = useState("2026-09-28T23:59");
  const [createMaxScore, setCreateMaxScore] = useState<number>(100);
  const [createSoalFileName, setCreateSoalFileName] = useState("");
  const [createSoalFileSize, setCreateSoalFileSize] = useState("");
  const [createSoalUrl, setCreateSoalUrl] = useState("");

  // Dosen Edit Assignment Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editMaxScore, setEditMaxScore] = useState<number>(100);
  const [editSoalFileName, setEditSoalFileName] = useState("");
  const [editSoalFileSize, setEditSoalFileSize] = useState("");
  const [editSoalUrl, setEditSoalUrl] = useState("");

  // Dosen Quick Upload Soal Modal
  const [showUploadSoalModal, setShowUploadSoalModal] = useState(false);
  const [quickSoalFileName, setQuickSoalFileName] = useState("");
  const [quickSoalFileSize, setQuickSoalFileSize] = useState("");
  const [quickSoalUrl, setQuickSoalUrl] = useState("");

  // Check current student submission
  const mySubmission = selectedAssignment?.submissions.find(
    (s) => s.studentId === currentUser.id
  );

  const handleSimulateFileSelect = () => {
    if (!selectedAssignment) return;
    setUploadFile({
      name: `Tugas_${selectedAssignment.title.slice(0, 15).replace(/\s+/g, "_")}_${currentUser.name.replace(/\s+/g, "")}.pdf`,
      size: "3.2 MB",
    });
  };

  const handleDoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !selectedAssignment) return;
    setIsSubmitting(true);
    setTimeout(() => {
      submitAssignment(selectedAssignment.id, uploadFile, studentNotes);
      setIsSubmitting(false);
      setSubmitSuccessMsg(true);
      setTimeout(() => setSubmitSuccessMsg(false), 4000);
    }, 600);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission || !selectedAssignment) return;
    gradeSubmission(selectedAssignment.id, gradingSubmission.id, Number(inputScore), inputFeedback);
    setGradingSubmission(null);
    showToast(`✅ Nilai untuk ${gradingSubmission.studentName} berhasil dirilis!`);
  };

  const handleOpenCreateModal = () => {
    setCreateCourseId(userCourses[0]?.id || courses[0]?.id || "");
    setCreateTitle("");
    setCreateInstructions("");
    setCreateDeadline("2026-09-28T23:59");
    setCreateMaxScore(100);
    setCreateSoalFileName("");
    setCreateSoalFileSize("");
    setCreateSoalUrl("");
    setShowCreateModal(true);
  };

  const handleSaveCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createCourseId) return;

    const targetCourse = courses.find((c) => c.id === createCourseId);
    const newAssign = createAssignment({
      courseId: createCourseId,
      courseName: targetCourse?.name || "Matakuliah",
      title: createTitle.trim(),
      instructions: createInstructions.trim() || "Kerjakan tugas sesuai spesifikasi dan ketentuan.",
      attachmentFileName: createSoalFileName || (createSoalUrl ? "Berkas_Soal_Tugas.pdf" : ""),
      attachmentFileSize: createSoalFileSize || (createSoalFileName ? "2.4 MB" : ""),
      attachmentUrl: createSoalUrl.trim() || (createSoalFileName ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" : ""),
      deadline: createDeadline ? new Date(createDeadline).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: Number(createMaxScore) || 100,
    });

    setSelectedAssignment(newAssign);
    setShowCreateModal(false);
    showToast(`✅ Tugas baru "${newAssign.title}" beserta berkas soal berhasil dibuat!`);
  };

  const handleOpenEditModal = (assign: Assignment) => {
    setEditTitle(assign.title);
    setEditInstructions(assign.instructions);
    setEditDeadline(assign.deadline ? assign.deadline.slice(0, 16) : "");
    setEditMaxScore(assign.maxScore);
    setEditSoalFileName(assign.attachmentFileName || "");
    setEditSoalFileSize(assign.attachmentFileSize || "");
    setEditSoalUrl(assign.attachmentUrl || "");
    setShowEditModal(true);
  };

  const handleSaveEditAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !editTitle.trim()) return;

    updateAssignment(selectedAssignment.id, {
      title: editTitle.trim(),
      instructions: editInstructions.trim(),
      deadline: editDeadline ? new Date(editDeadline).toISOString() : selectedAssignment.deadline,
      maxScore: Number(editMaxScore) || 100,
      attachmentFileName: editSoalFileName,
      attachmentFileSize: editSoalFileSize,
      attachmentUrl: editSoalUrl.trim(),
    });

    setSelectedAssignment((prev) =>
      prev
        ? {
            ...prev,
            title: editTitle.trim(),
            instructions: editInstructions.trim(),
            deadline: editDeadline ? new Date(editDeadline).toISOString() : prev.deadline,
            maxScore: Number(editMaxScore) || 100,
            attachmentFileName: editSoalFileName,
            attachmentFileSize: editSoalFileSize,
            attachmentUrl: editSoalUrl.trim(),
          }
        : null
    );

    setShowEditModal(false);
    showToast(`✅ Perubahan tugas & berkas soal berhasil disimpan!`);
  };

  const handleOpenUploadSoalModal = (assign: Assignment) => {
    setQuickSoalFileName(assign.attachmentFileName || `Soal_${assign.title.slice(0, 15).replace(/\s+/g, "_")}.pdf`);
    setQuickSoalFileSize(assign.attachmentFileSize || "2.1 MB");
    setQuickSoalUrl(assign.attachmentUrl || "");
    setShowUploadSoalModal(true);
  };

  const handleSaveQuickSoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    uploadAssignmentQuestionFile(selectedAssignment.id, {
      name: quickSoalFileName || "Lembar_Soal_Tugas.pdf",
      size: quickSoalFileSize || "2.1 MB",
      url: quickSoalUrl.trim() || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    });

    setSelectedAssignment((prev) =>
      prev
        ? {
            ...prev,
            attachmentFileName: quickSoalFileName || "Lembar_Soal_Tugas.pdf",
            attachmentFileSize: quickSoalFileSize || "2.1 MB",
            attachmentUrl: quickSoalUrl.trim() || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          }
        : null
    );

    setShowUploadSoalModal(false);
    showToast(`✅ Berkas soal tugas berhasil diunggah!`);
  };

  const handleDeleteAssignment = (assignId: string, assignTitle: string) => {
    if (confirm(`Hapus tugas "${assignTitle}" beserta seluruh riwayat pengumpulannya?`)) {
      deleteAssignment(assignId);
      const remaining = userAssignments.filter((a) => a.id !== assignId);
      setSelectedAssignment(remaining[0] || null);
      showToast(`🗑️ Tugas berhasil dihapus.`);
    }
  };

  const handleRemoveQuestionFile = (assignId: string) => {
    if (confirm("Hapus lampiran berkas soal dari tugas ini?")) {
      updateAssignment(assignId, {
        attachmentFileName: "",
        attachmentFileSize: "",
        attachmentUrl: "",
      });
      setSelectedAssignment((prev) =>
        prev
          ? {
              ...prev,
              attachmentFileName: "",
              attachmentFileSize: "",
              attachmentUrl: "",
            }
          : null
      );
      showToast(`✅ Lampiran soal tugas telah dihapus.`);
    }
  };

  if (userAssignments.length === 0 || !selectedAssignment) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-emerald-600" />
              {currentUser.role === "DOSEN" ? "Meja Penilaian & Tugas" : "Penugasan & Praktikum"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser.role === "DOSEN"
                ? "Kelola tugas perkuliahan, unggah berkas soal, periksa pengumpulan mahasiswa, dan input nilai."
                : "Unggah tugas sesuai rubrik dan pantau batas waktu pengumpulan."}
            </p>
          </div>

          {(currentUser.role === "DOSEN" || currentUser.role === "ADMIN") && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Buat Tugas Baru
            </button>
          )}
        </div>

        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
            <FileCheck2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Belum Ada Tugas Perkuliahan
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {currentUser.role === "DOSEN"
                ? "Belum ada tugas yang dibuat. Klik tombol di bawah untuk membuat tugas baru dan mengunggah lembar soal bagi mahasiswa."
                : "Tidak ada tugas aktif untuk matakuliah Anda saat ini."}
            </p>
          </div>
          {(currentUser.role === "DOSEN" || currentUser.role === "ADMIN") && (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Buat Tugas & Upload Soal Sekarang
            </button>
          )}
        </div>

        {/* MODAL CREATE ASSIGNMENT */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" /> Buat Tugas Perkuliahan Baru
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCreateAssignment} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pilih Matakuliah
                  </label>
                  <select
                    value={createCourseId}
                    onChange={(e) => setCreateCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Tugas
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tugas 1: Perancangan Skema Database & Relasi ORM"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>

                {/* Upload Question File Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-emerald-600" /> Unggah Berkas Soal Tugas (Dosen)
                    </span>
                    {createSoalFileName && (
                      <button
                        type="button"
                        onClick={() => {
                          setCreateSoalFileName("");
                          setCreateSoalFileSize("");
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-bold"
                      >
                        Hapus File
                      </button>
                    )}
                  </div>

                  <div
                    onClick={() => {
                      setCreateSoalFileName(
                        `Soal_${createTitle ? createTitle.slice(0, 18).replace(/\s+/g, "_") : "Tugas"}.pdf`
                      );
                      setCreateSoalFileSize("2.4 MB");
                    }}
                    className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                      createSoalFileName
                        ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-sm"
                        : "border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-white/70 dark:bg-slate-900/60"
                    }`}
                  >
                    {createSoalFileName ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-emerald-600" />
                        <div className="text-left">
                          <p className="font-bold text-xs text-slate-900 dark:text-white">
                            {createSoalFileName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Ukuran: {createSoalFileSize} • Siap Diunduh Mahasiswa
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
                      Atau Masukkan Tautan / URL Dokumen Soal (Opsional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... atau https://..."
                      value={createSoalUrl}
                      onChange={(e) => setCreateSoalUrl(e.target.value)}
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
                      value={createDeadline}
                      onChange={(e) => setCreateDeadline(e.target.value)}
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
                      value={createMaxScore}
                      onChange={(e) => setCreateMaxScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Petunjuk & Spesifikasi Tugas
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Rincian instruksi pengerjaan, format berkas pengumpulan, dan rubrik penilaian..."
                    value={createInstructions}
                    onChange={(e) => setCreateInstructions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                  >
                    Terbitkan Tugas
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 max-w-md p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMsg}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-600" />
            {currentUser.role === "DOSEN" ? "Meja Penilaian & Tugas" : "Penugasan & Praktikum"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.role === "DOSEN"
              ? "Kelola tugas perkuliahan, unggah berkas soal, periksa pengumpulan mahasiswa, dan input nilai."
              : "Unggah tugas sesuai rubrik dan pantau batas waktu pengumpulan."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Create Assignment Button (Dosen & Admin) */}
          {(currentUser.role === "DOSEN" || currentUser.role === "ADMIN") && (
            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Buat Tugas Baru
            </button>
          )}

          {/* Tab Filters */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "ALL"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Semua ({userAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "PENDING"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Perlu Tindakan
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: List on Left, Detail & Submission on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Assignment List */}
        <div className="space-y-3">
          {userAssignments.map((assign) => {
            const isSelected = assign.id === selectedAssignment?.id;
            const rem = getRemainingTime(assign.deadline);
            const userSub = assign.submissions.find((s) => s.studentId === currentUser.id);

            return (
              <div
                key={assign.id}
                onClick={() => {
                  setSelectedAssignment(assign);
                  setUploadFile(null);
                  setStudentNotes("");
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? "bg-blue-50/50 dark:bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                    {assign.courseName}
                  </span>
                  {currentUser.role === "STUDENT" ? (
                    userSub ? (
                      userSub.status === "GRADED" ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Nilai: {userSub.score}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          Terkumpul
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {rem.text}
                      </span>
                    )
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {assign.attachmentFileName && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          📎 Soal
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        {assign.submissions.length} Pengumpulan
                      </span>
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                  {assign.title}
                </h4>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Tenggat: {formatDateTime(assign.deadline)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Assignment Details & Actions */}
        {selectedAssignment && (
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              {/* Header Info */}
              <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {selectedAssignment.courseName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Maks. Nilai: {selectedAssignment.maxScore} Poin
                    </span>

                    {/* Dosen Edit / Delete Assignment Action */}
                    {(currentUser.role === "DOSEN" || currentUser.role === "ADMIN") && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(selectedAssignment)}
                          title="Edit Tugas & Berkas Soal"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAssignment(selectedAssignment.id, selectedAssignment.title)
                          }
                          title="Hapus Tugas"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {selectedAssignment.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>
                    Batas Akhir: <strong>{formatDateTime(selectedAssignment.deadline)}</strong>
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Petunjuk & Spesifikasi Tugas
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {selectedAssignment.instructions}
                </div>
              </div>

              {/* LECTURER QUESTION FILE ATTACHMENT SECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" /> Berkas / Lembar Soal Tugas
                  </h4>
                  {(currentUser.role === "DOSEN" || currentUser.role === "ADMIN") && (
                    <button
                      onClick={() => handleOpenUploadSoalModal(selectedAssignment)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {selectedAssignment.attachmentFileName ? "Ganti Berkas Soal" : "Unggah Berkas Soal"}
                    </button>
                  )}
                </div>

                {selectedAssignment.attachmentFileName || selectedAssignment.attachmentUrl ? (
                  /* Attached Question File Display Card */
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {selectedAssignment.attachmentFileName || "Dokumen_Soal_Tugas.pdf"}
                          </p>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-[9px] shrink-0">
                            Lembar Soal
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Ukuran: {selectedAssignment.attachmentFileSize || "2.1 MB"} • Berkas resmi dari Dosen Pengampu
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={selectedAssignment.attachmentUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh / Buka Lembar Soal
                      </a>
                      {(currentUser.role === "DOSEN" || currentUser.role === "ADMIN") && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionFile(selectedAssignment.id)}
                          title="Hapus Lampiran Soal"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* No File Attached Placeholder */
                  currentUser.role === "DOSEN" || currentUser.role === "ADMIN" ? (
                    <div
                      onClick={() => handleOpenUploadSoalModal(selectedAssignment)}
                      className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer transition-all space-y-1.5"
                    >
                      <UploadCloud className="w-8 h-8 text-blue-500 mx-auto" />
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Belum Ada Berkas Soal Terlampir
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Klik di sini untuk mengunggah lembar soal tugas (PDF / DOCX / ZIP) atau menyematkan URL dokumen studi kasus bagi mahasiswa.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Instruksi dan soal tugas tertera lengkap pada petunjuk di atas.</span>
                    </div>
                  )
                )}
              </div>

              {/* Rubrics (If any) */}
              {selectedAssignment.rubric && selectedAssignment.rubric.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Rubrik Penilaian
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedAssignment.rubric.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                      >
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{r.criteria}</p>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Bobot: {r.weightPercent}%</span>
                          <span className="font-bold text-blue-600">{r.maxPoints} Poin</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STUDENT WORKSPACE: SUBMISSION AREA */}
              {currentUser.role === "STUDENT" && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-blue-600" /> Status Pengumpulan Tugas Anda
                  </h4>

                  {mySubmission ? (
                    /* Already Submitted Display */
                    <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-blue-600 text-white shadow">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                              {mySubmission.fileName}
                            </h5>
                            <p className="text-[11px] text-slate-500">
                              Ukuran: {mySubmission.fileSize} • Dikumpulkan: {formatDateTime(mySubmission.submittedAt)}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${
                            mySubmission.status === "GRADED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}
                        >
                          {mySubmission.status === "GRADED" ? "Sudah Dinilai" : "Menunggu Dinilai"}
                        </span>
                      </div>

                      {mySubmission.submissionNotes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl">
                          <strong>Catatan Mahasiswa:</strong> {mySubmission.submissionNotes}
                        </p>
                      )}

                      {mySubmission.status === "GRADED" && (
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <Award className="w-4 h-4" /> Nilai Akhir:
                            </span>
                            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                              {mySubmission.score} / {selectedAssignment.maxScore}
                            </span>
                          </div>
                          {mySubmission.feedback && (
                            <p className="text-xs text-slate-700 dark:text-slate-200">
                              <strong>Umpan Balik Dosen ({mySubmission.gradedBy}):</strong> &ldquo;{mySubmission.feedback}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Submission Form */
                    <form onSubmit={handleDoSubmit} className="space-y-4">
                      {submitSuccessMsg && (
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Berkas tugas berhasil dikirim ke Dosen!
                        </div>
                      )}

                      <div
                        onClick={handleSimulateFileSelect}
                        className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                          uploadFile
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40"
                        }`}
                      >
                        <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                        {uploadFile ? (
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white">
                              {uploadFile.name}
                            </p>
                            <span className="text-[11px] text-slate-400">{uploadFile.size}</span>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                              Klik untuk memilih berkas tugas (PDF / ZIP)
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">Maksimal ukuran berkas 25MB</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Catatan Tambahan untuk Dosen (Opsional)
                        </label>
                        <textarea
                          rows={2}
                          value={studentNotes}
                          onChange={(e) => setStudentNotes(e.target.value)}
                          placeholder="Tuliskan link repositori GitHub atau catatan pengerjaan..."
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!uploadFile || isSubmitting}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          "Mengunggah berkas..."
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" /> Kumpulkan Tugas Sekarang
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* DOSEN WORKSPACE: SUBMISSIONS LIST TABLE */}
              {currentUser.role === "DOSEN" && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" /> Daftar Pengumpulan Mahasiswa ({selectedAssignment.submissions.length})
                  </h4>

                  {selectedAssignment.submissions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                      Belum ada mahasiswa yang mengumpulkan tugas ini.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedAssignment.submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="py-3 flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={sub.studentAvatar}
                              alt={sub.studentName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {sub.studentName}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                NIM: {sub.studentNim} • {formatDateTime(sub.submittedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {sub.status === "GRADED" ? (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Skor: {sub.score}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Perlu Dinilai
                              </span>
                            )}

                            <button
                              onClick={() => {
                                setGradingSubmission(sub);
                                setInputScore(sub.score || 85);
                                setInputFeedback(sub.feedback || "");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
                            >
                              Koreksi & Nilai
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREATE ASSIGNMENT */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Buat Tugas Perkuliahan Baru
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreateAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Matakuliah
                </label>
                <select
                  value={createCourseId}
                  onChange={(e) => setCreateCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Tugas
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tugas 1: Perancangan Skema Database & Relasi ORM"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              {/* Upload Question File Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-emerald-600" /> Unggah Berkas Soal Tugas (Dosen)
                  </span>
                  {createSoalFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setCreateSoalFileName("");
                        setCreateSoalFileSize("");
                      }}
                      className="text-[10px] text-rose-600 hover:underline font-bold"
                    >
                      Hapus File
                    </button>
                  )}
                </div>

                <div
                  onClick={() => {
                    setCreateSoalFileName(
                      `Soal_${createTitle ? createTitle.slice(0, 18).replace(/\s+/g, "_") : "Tugas"}.pdf`
                    );
                    setCreateSoalFileSize("2.4 MB");
                  }}
                  className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    createSoalFileName
                      ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-sm"
                      : "border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-white/70 dark:bg-slate-900/60"
                  }`}
                >
                  {createSoalFileName ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-emerald-600" />
                      <div className="text-left">
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {createSoalFileName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Ukuran: {createSoalFileSize} • Siap Diunduh Mahasiswa
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
                    Atau Masukkan Tautan / URL Dokumen Soal (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... atau https://..."
                    value={createSoalUrl}
                    onChange={(e) => setCreateSoalUrl(e.target.value)}
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
                    value={createDeadline}
                    onChange={(e) => setCreateDeadline(e.target.value)}
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
                    value={createMaxScore}
                    onChange={(e) => setCreateMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Petunjuk & Spesifikasi Tugas
                </label>
                <textarea
                  rows={4}
                  placeholder="Rincian instruksi pengerjaan, format berkas pengumpulan, dan rubrik penilaian..."
                  value={createInstructions}
                  onChange={(e) => setCreateInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                >
                  Terbitkan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT ASSIGNMENT & SOAL */}
      {showEditModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" /> Edit Soal & Detail Tugas
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Tugas
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              {/* Upload / Replace Question File */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-emerald-600" /> Berkas Soal Tugas (Dosen)
                  </span>
                  {editSoalFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditSoalFileName("");
                        setEditSoalFileSize("");
                        setEditSoalUrl("");
                      }}
                      className="text-[10px] text-rose-600 hover:underline font-bold"
                    >
                      Hapus Berkas
                    </button>
                  )}
                </div>

                <div
                  onClick={() => {
                    setEditSoalFileName(
                      `Soal_${editTitle ? editTitle.slice(0, 18).replace(/\s+/g, "_") : "Tugas"}.pdf`
                    );
                    setEditSoalFileSize("2.5 MB");
                    setEditSoalUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
                  }}
                  className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    editSoalFileName
                      ? "border-emerald-500 bg-white dark:bg-slate-900 shadow-sm"
                      : "border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-white/70 dark:bg-slate-900/60"
                  }`}
                >
                  {editSoalFileName ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-emerald-600" />
                      <div className="text-left">
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          {editSoalFileName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Ukuran: {editSoalFileSize || "2.5 MB"} • Klik untuk ganti berkas
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
                    Tautan / URL Berkas Soal
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editSoalUrl}
                    onChange={(e) => setEditSoalUrl(e.target.value)}
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
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
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
                    value={editMaxScore}
                    onChange={(e) => setEditMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-medium text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Petunjuk & Spesifikasi Tugas
                </label>
                <textarea
                  rows={4}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-xs"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK UPLOAD SOAL MODAL */}
      {showUploadSoalModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-emerald-600" /> Unggah Berkas Soal Tugas
                </h3>
                <p className="text-[11px] text-slate-500 truncate max-w-xs">{selectedAssignment.title}</p>
              </div>
              <button
                onClick={() => setShowUploadSoalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickSoal} className="space-y-4 text-xs">
              <div
                onClick={() => {
                  setQuickSoalFileName(
                    `Soal_${selectedAssignment.title.slice(0, 15).replace(/\s+/g, "_")}.pdf`
                  );
                  setQuickSoalFileSize("2.6 MB");
                  setQuickSoalUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
                }}
                className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                  quickSoalFileName
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm"
                    : "border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40"
                }`}
              >
                <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                {quickSoalFileName ? (
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">
                      {quickSoalFileName}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      Ukuran: {quickSoalFileSize || "2.6 MB"} • Siap Diunggah
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Klik untuk memilih berkas soal tugas (PDF / DOCX / ZIP)
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Maksimal ukuran berkas 25MB</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Atau Tautan Dokumen Soal (Google Drive / PDF URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={quickSoalUrl}
                  onChange={(e) => setQuickSoalUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadSoalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!quickSoalFileName && !quickSoalUrl}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold shadow transition-all"
                >
                  Unggah & Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Grading (Dosen) */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={gradingSubmission.studentAvatar}
                  alt={gradingSubmission.studentName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {gradingSubmission.studentName}
                  </h3>
                  <span className="text-xs text-slate-400">NIM: {gradingSubmission.studentNim}</span>
                </div>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Berkas Terlampir: {gradingSubmission.fileName} ({gradingSubmission.fileSize})
              </p>
              {gradingSubmission.submissionNotes && (
                <p className="text-slate-500 italic">
                  &ldquo;{gradingSubmission.submissionNotes}&rdquo;
                </p>
              )}
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Input Nilai (Skala 0 - {selectedAssignment.maxScore})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedAssignment.maxScore}
                  value={inputScore}
                  onChange={(e) => setInputScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-extrabold text-blue-600 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Umpan Balik & Saran Perbaikan
                </label>
                <textarea
                  rows={3}
                  value={inputFeedback}
                  onChange={(e) => setInputFeedback(e.target.value)}
                  placeholder="Beri umpan balik konstruktif terhadap kode, arsitektur, dan kerapian pengerjaan..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
                >
                  Simpan & Rilis Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
