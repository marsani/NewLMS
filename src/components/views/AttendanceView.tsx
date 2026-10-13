"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { AttendanceSession, AttendanceStatus } from "@/types";
import {
  CalendarCheck,
  QrCode,
  KeyRound,
  CheckCircle2,
  Clock,
  MapPin,
  Video,
  Plus,
  Users,
  ShieldCheck,
  AlertCircle,
  X,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const AttendanceView: React.FC = () => {
  const {
    currentUser,
    userCourses,
    userAttendanceSessions,
    checkInAttendance,
    createAttendanceSession,
  } = useApp();

  // Student check-in states
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    userAttendanceSessions.find((s) => s.isOpen)?.id || userAttendanceSessions[0]?.id || ""
  );
  const [inputPasscode, setInputPasscode] = useState("");
  const [attendanceMode, setAttendanceMode] = useState<"PRESENT_ONLINE" | "PRESENT_OFFLINE">("PRESENT_ONLINE");
  const [checkInResult, setCheckInResult] = useState<{ success: boolean; message: string } | null>(null);

  // Dosen generate modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(userCourses[0]?.id || "");
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionWeek, setSessionWeek] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(60);

  const selectedSession = userAttendanceSessions.find((s) => s.id === selectedSessionId) || userAttendanceSessions[0] || null;

  const handleStudentCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !inputPasscode.trim()) return;

    const res = checkInAttendance(selectedSessionId, inputPasscode, attendanceMode);
    setCheckInResult(res);
    if (res.success) {
      setInputPasscode("");
    }
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic.trim()) return;

    const newSess = createAttendanceSession(
      selectedCourseId,
      sessionTopic,
      Number(sessionWeek),
      Number(durationMinutes)
    );
    setSelectedSessionId(newSess.id);
    setShowCreateModal(false);
    setSessionTopic("");
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT_ONLINE":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
            <Video className="w-3 h-3" /> Hadir Daring (Online)
          </span>
        );
      case "PRESENT_OFFLINE":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Hadir Luring (Di Kelas)
          </span>
        );
      case "PERMISSION":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Izin
          </span>
        );
      case "SICK":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            Sakit
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            Alpa
          </span>
        );
    }
  };

  if (userCourses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            Presensi Perkuliahan Hybrid
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Validasi kehadiran real-time menggunakan kode PIN sesi dinamis atau pemindaian QR Code.
          </p>
        </div>

        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Belum Ada Sesi Presensi
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Akun Dosen Anda belum mengampu matakuliah untuk membuka sesi presensi.
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
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            Presensi Perkuliahan Hybrid
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Validasi kehadiran real-time menggunakan kode PIN sesi dinamis atau pemindaian QR Code.
          </p>
        </div>

        {currentUser.role === "DOSEN" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" /> Buka Sesi Presensi Baru
          </button>
        )}
      </div>

      {/* Grid: Active Sessions & Check-In Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sessions List */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
            Daftar Sesi Perkuliahan
          </h3>

          {userAttendanceSessions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Belum ada sesi presensi untuk kelas yang diampu.
            </div>
          ) : (
            userAttendanceSessions.map((sess) => {
              const isSelected = sess.id === selectedSessionId;
              const hasCheckedIn = sess.records.some((r) => r.studentId === currentUser.id);

            return (
              <div
                key={sess.id}
                onClick={() => {
                  setSelectedSessionId(sess.id);
                  setCheckInResult(null);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? "bg-blue-50/50 dark:bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Pekan #{sess.weekNumber}
                  </span>
                  {sess.isOpen ? (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sesi Dibuka
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      Ditutup
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                  {sess.topic}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{sess.courseName}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                  <span>{sess.records.length} Hadir</span>
                  {currentUser.role === "STUDENT" && hasCheckedIn && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Presensi
                    </span>
                  )}
                </div>
              </div>
            );
          }))}
        </div>

        {/* Right: Active Session Details & Check-In Action */}
        {selectedSession && (
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Pekan #{selectedSession.weekNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {selectedSession.courseName}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                    {selectedSession.topic}
                  </h3>
                </div>

                {/* QR Code / PIN Display for Lecturer */}
                {currentUser.role === "DOSEN" && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                    <QrCode className="w-12 h-12 text-amber-600 mx-auto" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">
                        Kode PIN Presensi:
                      </p>
                      <p className="text-base font-mono font-black text-amber-600 tracking-wider">
                        {selectedSession.passcode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* STUDENT WORKSPACE: CHECK-IN FORM */}
              {currentUser.role === "STUDENT" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" /> Masukkan Kode Presensi Anda
                  </h4>

                  {checkInResult && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                        checkInResult.success
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {checkInResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{checkInResult.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleStudentCheckIn} className="space-y-4">
                    {/* Select Mode */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setAttendanceMode("PRESENT_ONLINE")}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          attendanceMode === "PRESENT_ONLINE"
                            ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 ring-1 ring-blue-600"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <Video className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">
                            Hadir Online (Daring)
                          </p>
                          <p className="text-[10px] text-slate-400">Via Google Meet / Zoom</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setAttendanceMode("PRESENT_OFFLINE")}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          attendanceMode === "PRESENT_OFFLINE"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 ring-1 ring-emerald-600"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">
                            Hadir Offline (Luring)
                          </p>
                          <p className="text-[10px] text-slate-400">Di Ruang Lab Komputer</p>
                        </div>
                      </div>
                    </div>

                    {/* PIN Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Kode PIN Sesi (Contoh: {selectedSession.passcode})
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Masukkan PIN dari Dosen..."
                          value={inputPasscode}
                          onChange={(e) => setInputPasscode(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                        />
                        <button
                          type="submit"
                          disabled={!selectedSession.isOpen}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Submit Presensi
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Attendee Record Table */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" /> Log Kehadiran Mahasiswa ({selectedSession.records.length})
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedSession.records.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center italic">
                      Belum ada presensi yang tercatat untuk sesi ini.
                    </p>
                  ) : (
                    selectedSession.records.map((rec) => (
                      <div
                        key={rec.id}
                        className="py-3 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.studentAvatar}
                            alt={rec.studentName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {rec.studentName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              NIM: {rec.studentNim} • {formatDateTime(rec.checkInTime)}
                            </p>
                          </div>
                        </div>

                        <div>{getStatusBadge(rec.status)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create Session (Dosen) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Buka Sesi Presensi Perkuliahan
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Matakuliah
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                >
                  {userCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Pekan Pertemuan
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={sessionWeek}
                  onChange={(e) => setSessionWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topik Bahasan Sesi
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sesi Pekan 3: Autentikasi JWT & Role Protection"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Durasi Sesi Dibuka (Menit)
                </label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
                >
                  Generate QR & Buka Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
