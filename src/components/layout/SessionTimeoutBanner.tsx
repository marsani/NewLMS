"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Clock, AlertTriangle, RefreshCw } from "lucide-react";

/**
 * SessionTimeoutBanner
 * Menampilkan countdown warning saat sesi akan habis dalam 5 menit terakhir.
 * Tampil sebagai sticky bar di bawah header.
 */
export const SessionTimeoutBanner: React.FC = () => {
  const { isAuthenticated, lastActivityTime, sessionTimeoutMinutes, resetSessionTimer } = useApp();
  const [secondsLeft, setSecondsLeft] = useState<number>(sessionTimeoutMinutes * 60);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - lastActivityTime) / 1000;
      const remaining = Math.max(0, sessionTimeoutMinutes * 60 - elapsed);
      setSecondsLeft(Math.floor(remaining));
      // Show warning in the last 5 minutes (300 seconds)
      setShowWarning(remaining > 0 && remaining <= 300);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivityTime, sessionTimeoutMinutes]);

  if (!isAuthenticated || !showWarning) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft <= 60; // Last 1 minute = red

  return (
    <div
      className={`w-full px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 transition-all ${
        isUrgent
          ? "bg-rose-600 dark:bg-rose-700 text-white"
          : "bg-amber-500/90 dark:bg-amber-600/90 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4 animate-pulse flex-shrink-0" />
        ) : (
          <Clock className="w-4 h-4 flex-shrink-0" />
        )}
        <span>
          {isUrgent
            ? `⚠️ Sesi akan berakhir dalam ${seconds} detik! Klik di mana saja untuk melanjutkan.`
            : `Sesi aktif akan berakhir dalam ${minutes}:${String(seconds).padStart(2, "0")} menit karena tidak ada aktivitas.`}
        </span>
      </div>
      <button
        onClick={resetSessionTimer}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0 font-bold"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Perpanjang Sesi
      </button>
    </div>
  );
};
