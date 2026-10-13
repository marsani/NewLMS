"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Role, Permission } from "@/types";
import {
  GraduationCap,
  Shield,
  BookOpen,
  KeyRound,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  ChevronRight,
  Sun,
  Moon,
  Info,
  Layers,
} from "lucide-react";

export const LoginView: React.FC = () => {
  const { login, rolePermissions, isDarkMode, toggleTheme } = useApp();

  const [identifier, setIdentifier] = useState("admin@cic.ac.id");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<Role>("ADMIN");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate random 5-character alphanumeric Captcha
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput("");
    setErrorMessage(null);
  };

  // Draw Captcha onto HTML5 Canvas with security noise & skew
  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !captchaCode) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isDarkMode ? "#1e293b" : "#f1f5f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add random noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = isDarkMode ? `rgba(96, 165, 250, 0.4)` : `rgba(37, 99, 235, 0.3)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Add random noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = isDarkMode ? `rgba(248, 113, 113, 0.5)` : `rgba(220, 38, 38, 0.4)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Render characters with distortion
    ctx.font = "bold 24px 'Courier New', monospace";
    ctx.textBaseline = "middle";

    const colors = isDarkMode
      ? ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"]
      : ["#1d4ed8", "#059669", "#d97706", "#db2777", "#7c3aed"];

    for (let i = 0; i < captchaCode.length; i++) {
      ctx.save();
      const x = 20 + i * 26;
      const y = canvas.height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(captchaCode[i], 0, 0);
      ctx.restore();
    }
  }, [captchaCode, isDarkMode]);

  // Quick preset account filler
  const handleQuickFill = (type: "STUDENT" | "DOSEN" | "ADMIN") => {
    if (type === "STUDENT") {
      setIdentifier("");
      setPassword("");
    } else if (type === "DOSEN") {
      setIdentifier("");
      setPassword("");
    } else if (type === "ADMIN") {
      setIdentifier("admin@cic.ac.id");
      setPassword("admin123");
    }
    setErrorMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Silakan isi NIM / NIP / Email dan kata sandi.");
      return;
    }

    if (!captchaInput.trim()) {
      setErrorMessage("Silakan masukkan kode Captcha keamanan.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password, captchaInput, captchaCode);
      setIsLoading(false);

      if (!res.success) {
        setErrorMessage(res.message);
        generateCaptcha(); // refresh captcha on failed attempt
      } else {
        setSuccessMessage(res.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Dark Mode Toggle & Help */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => {
            setSelectedRoleForModal("STUDENT");
            setShowPermissionsModal(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Info className="w-3.5 h-3.5 text-blue-500" /> Matriks Hak Akses Role
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* University Header Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 items-center justify-center text-white shadow-xl shadow-blue-600/30 mb-1">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            LMS<span className="text-amber-500">·</span>UCIC <span className="text-xs px-2 py-0.5 font-bold rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ml-1">HYBRID</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Universitas Catur Insan Cendekia • Sistem Perkuliahan Hybrid
          </p>
        </div>

        {/* Quick Persona Selector Pills */}
        <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" /> Masuk Sebagai:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("ADMIN")}
              className={`p-2.5 rounded-xl text-center border transition-all ${
                identifier === "admin@cic.ac.id"
                  ? "bg-rose-50 dark:bg-rose-950/60 border-rose-600 text-rose-700 dark:text-rose-300 font-bold ring-1 ring-rose-600 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <Shield className="w-4 h-4 mx-auto mb-1 text-rose-600" />
              <span className="text-[10px] block font-semibold">Admin</span>
              <span className="text-[8px] text-slate-400 block">admin@cic</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("DOSEN")}
              className={`p-2.5 rounded-xl text-center border transition-all ${
                identifier !== "admin@cic.ac.id" && identifier === ""
                  ? "bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-500"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <GraduationCap className="w-4 h-4 mx-auto mb-1 text-amber-600" />
              <span className="text-[10px] block font-semibold">Dosen</span>
              <span className="text-[8px] text-slate-400 block">NIP / Email</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("STUDENT")}
              className={`p-2.5 rounded-xl text-center border transition-all ${
                identifier !== "admin@cic.ac.id" && identifier !== ""
                  ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-600"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="w-4 h-4 mx-auto mb-1 text-blue-600" />
              <span className="text-[10px] block font-semibold">Mahasiswa</span>
              <span className="text-[8px] text-slate-400 block">NIM / Email</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">
            Login sebagai <strong>Admin</strong> untuk mengelola & mengisi data Mahasiswa & Dosen.
          </p>
        </div>

        {/* Login Form Box */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-bold">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* NIM / NIP / Email */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                NIM / NIP / Email Pengguna
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 2101001 atau saniman@cic.ac.id"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-medium text-xs"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi (Password)
                </label>
                <span className="text-[10px] text-slate-400">Default: mhs123 / dosen123 / admin123</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-medium text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Interactive Captcha Security Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" /> Verifikasi Captcha Keamanan
                </span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> Muat Ulang
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Visual Canvas */}
                <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-900 shrink-0">
                  <canvas ref={canvasRef} width={150} height={42} className="block" />
                </div>

                {/* Captcha Input */}
                <input
                  type="text"
                  maxLength={5}
                  placeholder="Ketik 5 Kode..."
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-center tracking-widest font-mono font-extrabold uppercase rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-amber-500 hover:from-blue-600 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Memverifikasi Autentikasi...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Masuk ke Portal LMS-UCIC
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400">
          Dilindungi oleh SSL/TLS Enkripsi & Anti-Brute Force Guard LMS-UCIC.
        </p>
      </div>

      {/* Permissions Matrix Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Matriks Pengaturan Hak Akses (Role-Based Access Control)
                  </h3>
                  <p className="text-xs text-slate-400">Universitas Catur Insan Cendekia (UCIC)</p>
                </div>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Role Tab Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
              {(["STUDENT", "DOSEN", "ADMIN"] as Role[]).map((r) => {
                const info = rolePermissions[r];
                const isActive = selectedRoleForModal === r;
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRoleForModal(r)}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-bold"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>

            {/* Role Details */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  {rolePermissions[selectedRoleForModal].label}
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  {rolePermissions[selectedRoleForModal].description}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Daftar Hak Akses & Kemampuan Sistem ({rolePermissions[selectedRoleForModal].permissions.length} Izin):
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {rolePermissions[selectedRoleForModal].permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                        {perm}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow"
              >
                Tutup Matriks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
