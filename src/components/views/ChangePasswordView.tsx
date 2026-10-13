"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

export const ChangePasswordView: React.FC = () => {
  const { currentUser, changePassword } = useApp();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Password strength checker
  const strength = (() => {
    if (!newPassword) return { level: 0, label: "", color: "" };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    if (score <= 1) return { level: score, label: "Lemah", color: "bg-rose-500" };
    if (score === 2) return { level: score, label: "Sedang", color: "bg-amber-500" };
    if (score === 3) return { level: score, label: "Kuat", color: "bg-blue-500" };
    return { level: score, label: "Sangat Kuat", color: "bg-emerald-500" };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (newPassword !== confirmPassword) {
      setResult({ type: "error", message: "Konfirmasi password baru tidak sesuai. Periksa kembali!" });
      return;
    }
    if (newPassword.length < 6) {
      setResult({ type: "error", message: "Password baru minimal 6 karakter." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setResult({ type: res.success ? "success" : "error", message: res.message });
      if (res.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setResult({ type: "error", message: err?.message || "Terjadi kesalahan saat mengubah kata sandi." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-blue-600" />
          Ubah Kata Sandi Akun
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Perbarui password login Anda untuk menjaga keamanan akun di LMS UCIC.
        </p>
      </div>

      {/* User Card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 border border-blue-200/60 dark:border-blue-800/40">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30"
        />
        <div>
          <p className="font-extrabold text-slate-900 dark:text-white text-sm">{currentUser.name}</p>
          <p className="text-xs text-slate-500">{currentUser.email}</p>
          <span
            className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
              currentUser.role === "DOSEN"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            }`}
          >
            {currentUser.role === "DOSEN" ? "Dosen Pengampu" : "Mahasiswa"}
          </span>
        </div>
      </div>

      {/* Result Alert */}
      {result && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border text-sm font-semibold ${
            result.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {result.message}
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Current Password */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password Saat Ini
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Masukkan password aktif Anda saat ini"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* New Password */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showNew ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.level ? strength.color : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Kekuatan:{" "}
                  <span className={`font-bold ${
                    strength.level <= 1 ? "text-rose-500" :
                    strength.level === 2 ? "text-amber-500" :
                    strength.level === 3 ? "text-blue-500" : "text-emerald-500"
                  }`}>
                    {strength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none transition-colors font-mono ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-rose-400 focus:border-rose-500"
                    : confirmPassword && confirmPassword === newPassword
                    ? "border-emerald-400 focus:border-emerald-500"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-[11px] text-rose-500 font-semibold">
                ✗ Konfirmasi password tidak sesuai
              </p>
            )}
            {confirmPassword && confirmPassword === newPassword && (
              <p className="mt-1 text-[11px] text-emerald-500 font-semibold">
                ✓ Password cocok
              </p>
            )}
          </div>

          {/* Tips */}
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="font-bold text-blue-800 dark:text-blue-300 text-[11px] mb-1.5">
              Tips Password Aman:
            </p>
            <ul className="text-[11px] text-blue-700 dark:text-blue-400 space-y-0.5">
              <li>• Minimal 8 karakter untuk password kuat</li>
              <li>• Gabungkan huruf besar, huruf kecil, angka, dan simbol</li>
              <li>• Jangan gunakan tanggal lahir atau nama sebagai password</li>
              <li>• Simpan di pengelola kata sandi (password manager)</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Memperbarui Password...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Perbarui Password
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
