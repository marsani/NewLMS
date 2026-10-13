"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShieldCheck,
  Server,
  Database,
  Key,
  HardDrive,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const AdminSystemView: React.FC = () => {
  const { auditLogs, resetAllDataToDefault } = useApp();

  const [maxUploadMB, setMaxUploadMB] = useState(25);
  const [activeSemester, setActiveSemester] = useState("2026/2027 Ganjil");
  const [zoomApiKey, setZoomApiKey] = useState("zm_live_k89172948719284");
  const [r2StorageBucket, setR2StorageBucket] = useState("ucic-lms-hls-media");
  const [isSaved, setIsSaved] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    if (confirm("Apakah Anda yakin ingin mereset seluruh data LMS kembali ke data demo default awal? Semua penambahan data lokal akan dihapus.")) {
      resetAllDataToDefault();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-rose-600" />
          Konfigurasi Sistem & Audit Trail Keamanan
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Pengaturan infrastruktur cloud, batasan kuota storage/upload, kredensial integrasi video streaming, dan log aktivitas real-time.
        </p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Node Server Status</p>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Operasional Normal
            </h4>
            <p className="text-[10px] text-slate-500">Next.js App Router (SSR Ready)</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">PostgreSQL & Prisma</p>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Terkoneksi (12ms)
            </h4>
            <p className="text-[10px] text-slate-500">Connection Pool: 15/50 Active</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Object Storage (R2/S3)</p>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              142.8 GB / 1 TB
            </h4>
            <p className="text-[10px] text-slate-500">Media HLS & PDF Dokumen</p>
          </div>
        </div>
      </div>

      {/* Settings Form & Real-time Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-rose-600" /> Parameter Konfigurasi Global
          </h3>

          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Pengaturan sistem berhasil disimpan!
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester Akademik Aktif
              </label>
              <select
                value={activeSemester}
                onChange={(e) => setActiveSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="2026/2027 Ganjil">Tahun Ajaran 2026/2027 (Semester Ganjil)</option>
                <option value="2026/2027 Genap">Tahun Ajaran 2026/2027 (Semester Genap)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batas Ukuran Upload Pengumpulan Tugas (MB)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={maxUploadMB}
                onChange={(e) => setMaxUploadMB(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Zoom API Key / Google Meet Enterprise Client ID
              </label>
              <input
                type="password"
                value={zoomApiKey}
                onChange={(e) => setZoomApiKey(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cloudflare R2 / AWS S3 Storage Bucket
              </label>
              <input
                type="text"
                value={r2StorageBucket}
                onChange={(e) => setR2StorageBucket(e.target.value)}
                className="w-full px-3 py-2 font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors"
            >
              Simpan Konfigurasi
            </button>
          </form>

          {/* Local Persistence & Reset Section */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-600" /> Penyimpanan Data Persisten
                </h4>
                <p className="text-[11px] text-slate-400">
                  Data yang Anda inputkan otomatis tersimpan di peramban sehingga tidak hilang saat halaman di-refresh.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                Aktif & Terlindungi
              </span>
            </div>

            {resetSuccess && (
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 text-[11px] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700" /> Data telah berhasil direset kembali ke data default demo!
              </div>
            )}

            <button
              type="button"
              onClick={handleResetData}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Reset Seluruh Data ke Default Demo
            </button>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Log Aktivitas Audit Trail
            </h3>
            <span className="text-[11px] text-slate-400">Terakhir diperbarui sekarang</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[350px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {log.userName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{log.details}</p>
                <span className="text-[10px] text-slate-400 block">IP: {log.ipAddress}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
