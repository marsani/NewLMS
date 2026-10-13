"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Quiz, Question, QuizAttempt } from "@/types";
import {
  HelpCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  Send,
  Flag,
} from "lucide-react";
import confetti from "canvas-confetti";

interface QuizViewProps {
  initialQuizId?: string;
}

export const QuizView: React.FC<QuizViewProps> = ({ initialQuizId }) => {
  const { currentUser, userQuizzes, saveQuizAttempt } = useApp();

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(
    userQuizzes.find((q) => q.id === initialQuizId) || userQuizzes[0] || null
  );

  React.useEffect(() => {
    if (!activeQuiz && userQuizzes.length > 0) {
      setActiveQuiz(userQuizzes[0]);
    }
  }, [userQuizzes, activeQuiz]);

  // Exam Player Mode: "OVERVIEW" | "IN_EXAM" | "RESULT"
  const [examMode, setExamMode] = useState<"OVERVIEW" | "IN_EXAM" | "RESULT">(
    activeQuiz?.userAttempt?.isCompleted ? "RESULT" : "OVERVIEW"
  );

  // Exam states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((activeQuiz?.durationMinutes || 15) * 60);
  const [violationCount, setViolationCount] = useState(0);
  const [showAntiCheatModal, setShowAntiCheatModal] = useState(false);
  const [examFinishedAttempt, setExamFinishedAttempt] = useState<QuizAttempt | null>(
    activeQuiz?.userAttempt || null
  );

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup Timer & Anti-Cheat listeners when in exam
  useEffect(() => {
    if (examMode !== "IN_EXAM" || !activeQuiz) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Countdown Timer
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Anti-Cheat Tab Switching Detector
    const handleVisibilityChange = () => {
      if (document.hidden && activeQuiz?.isTabLockEnabled) {
        setViolationCount((prev) => prev + 1);
        setShowAntiCheatModal(true);
      }
    };

    const handleWindowBlur = () => {
      if (activeQuiz?.isTabLockEnabled) {
        setViolationCount((prev) => prev + 1);
        setShowAntiCheatModal(true);
      }
    };

    // Disable Right Click & Copy
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
    };
  }, [examMode, activeQuiz]);

  const startExam = () => {
    if (!activeQuiz) return;
    setUserAnswers({});
    setFlaggedQuestions({});
    setViolationCount(0);
    setCurrentQuestionIdx(0);
    setTimeLeftSeconds(activeQuiz.durationMinutes * 60);
    setExamMode("IN_EXAM");
  };

  const selectAnswer = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const finishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!activeQuiz) return;

    // Calculate score
    let calculatedScore = 0;
    activeQuiz.questions.forEach((q) => {
      const studentAns = userAnswers[q.id];
      if (q.questionType === "MULTIPLE_CHOICE") {
        if (studentAns === q.correctAnswer) {
          calculatedScore += q.points;
        }
      } else {
        // Essay auto-estimate score if filled
        if (studentAns && studentAns.trim().length > 10) {
          calculatedScore += q.points * 0.9;
        }
      }
    });

    const finalScore = Math.round(calculatedScore);

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: activeQuiz.id,
      studentId: currentUser.id,
      startedAt: new Date(Date.now() - (activeQuiz.durationMinutes * 60 - timeLeftSeconds) * 1000).toISOString(),
      finishedAt: new Date().toISOString(),
      score: finalScore,
      isCompleted: true,
      violationCount,
      answers: userAnswers,
    };

    saveQuizAttempt(attempt);
    setExamFinishedAttempt(attempt);
    setExamMode("RESULT");

    if (finalScore >= activeQuiz.passingScore) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!activeQuiz || userQuizzes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-purple-600" />
            Kuis & Ujian Online Terintegrasi
          </h2>
        </div>

        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Belum Ada Kuis Aktif
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {currentUser.role === "DOSEN"
                ? "Tidak ada kuis yang dibuat untuk matakuliah yang Anda ampu. Anda dapat membuat kuis baru melalui Modul Pembelajaran di Studio Matakuliah."
                : "Belum ada kuis atau evaluasi mandiri yang ditugaskan untuk matakuliah Anda saat ini."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = activeQuiz.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === activeQuiz.questions.length - 1;

  /* =========================================================
     1. EXAM OVERVIEW SCREEN (INSTRUCTION & START)
  ========================================================= */
  if (examMode === "OVERVIEW") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-purple-600" />
            Kuis & Ujian Online Terintegrasi
          </h2>
        </div>

        {/* Quiz Card Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {activeQuiz.courseName}
              </span>
              {activeQuiz.isTabLockEnabled && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Anti-Cheat Aktif
                </span>
              )}
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {activeQuiz.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeQuiz.description}
            </p>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Batas Waktu</p>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                {activeQuiz.durationMinutes} Menit
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <HelpCircle className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Jumlah Soal</p>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                {activeQuiz.questions.length} Butir
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <Award className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Batas Kelulusan</p>
              <p className="font-extrabold text-sm text-emerald-600">
                {activeQuiz.passingScore} Poin
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <RotateCcw className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Kesempatan Ujian</p>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                {activeQuiz.maxAttempts} Kali
              </p>
            </div>
          </div>

          {/* Anti-Cheat Rules Box */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
            <h5 className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4" /> Peraturan Ujian & Sistem Integritas:
            </h5>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
              <li>Dilarang berpindah tab browser, membuka aplikasi lain, atau meminimize window.</li>
              <li>Aksi klik kanan, salin teks (copy-paste), dan inspect element dinonaktifkan.</li>
              <li>Setiap pelanggaran tercatat otomatis pada log sistem Dosen dan pengawas ujian.</li>
            </ul>
          </div>

          {/* Start Exam CTA Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={startExam}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Mulai Pengerjaan Kuis Sekarang
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     2. FULLSCREEN DISTRACTION-FREE EXAM PLAYER
  ========================================================= */
  if (examMode === "IN_EXAM") {
    return (
      <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col select-none overflow-y-auto">
        {/* Anti-Cheat Warning Modal Triggered on Tab Switch */}
        {showAntiCheatModal && (
          <div className="fixed inset-0 z-50 bg-rose-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-rose-500 p-6 space-y-4 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="font-extrabold text-lg text-rose-600">
                Peringatan Sistem Integritas!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Anda terdeteksi berpindah tab browser atau meninggalkan jendela ujian.
                Pelanggaran ke-<strong>{violationCount}</strong> telah dicatat dalam log Dosen.
              </p>
              <button
                onClick={() => setShowAntiCheatModal(false)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-all"
              >
                Saya Mengerti, Lanjutkan Ujian
              </button>
            </div>
          </div>
        )}

        {/* Exam Header Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {activeQuiz.title}
              </h4>
              <p className="text-[10px] text-slate-400">
                Soal {currentQuestionIdx + 1} dari {activeQuiz.questions.length} • Peserta: {currentUser.name}
              </p>
            </div>
          </div>

          {/* Real-time Countdown Timer Pill */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold shadow-sm ${
                timeLeftSeconds < 180
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse border border-rose-300"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={finishExam}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Selesai Ujian
            </button>
          </div>
        </header>

        {/* Main Quiz Content Area */}
        <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question View (Left 3 Columns) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Nomor {currentQuestionIdx + 1} • {currentQ.points} Poin
                </span>

                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    flaggedQuestions[currentQ.id]
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flaggedQuestions[currentQ.id] ? "Ditandai Ragu" : "Tandai Ragu"}
                </button>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.questionText}
              </h3>

              {/* Options or Essay Input */}
              {currentQ.questionType === "MULTIPLE_CHOICE" && currentQ.options ? (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = userAnswers[currentQ.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => selectAnswer(currentQ.id, opt.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 shadow-md ring-1 ring-blue-600"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-400 text-slate-400"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                          {opt.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tuliskan Jawaban Essay Anda:
                  </label>
                  <textarea
                    rows={6}
                    value={userAnswers[currentQ.id] || ""}
                    onChange={(e) => selectAnswer(currentQ.id, e.target.value)}
                    placeholder="Ketikkan analisa dan jawaban lengkap di sini..."
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Soal Sebelumnya
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={finishExam}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Kumpulkan & Selesai
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
                  >
                    Soal Berikutnya <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar (Right 1 Column) */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Navigasi Nomor Soal
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {activeQuiz.questions.map((q, idx) => {
                  const isAnswered = !!userAnswers[q.id];
                  const isCurrent = idx === currentQuestionIdx;
                  const isFlagged = !!flaggedQuestions[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-10 rounded-xl font-bold text-xs transition-all relative ${
                        isCurrent
                          ? "ring-2 ring-blue-600 bg-blue-600 text-white shadow"
                          : isAnswered
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : isFlagged
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Sudah dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Ditandai ragu-ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>Belum dijawab</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     3. EXAM RESULT & EXPLANATION REVIEW SCREEN
  ========================================================= */
  const attempt = examFinishedAttempt || activeQuiz.userAttempt;
  const isPassed = attempt && attempt.score ? attempt.score >= activeQuiz.passingScore : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Result Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg ${
            isPassed
              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 shadow-emerald-500/20"
              : "bg-rose-100 dark:bg-rose-950 text-rose-600 shadow-rose-500/20"
          }`}
        >
          {isPassed ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <XCircle className="w-10 h-10" />
          )}
        </div>

        <div className="space-y-1">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
              isPassed
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            {isPassed ? "LULUS KUIS" : "BELUM LULUS"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white pt-2">
            {attempt?.score} <span className="text-lg text-slate-400 font-normal">/ 100 Poin</span>
          </h2>
          <p className="text-xs text-slate-500">
            Passing Grade: {activeQuiz.passingScore} Poin • Diselesaikan oleh: {currentUser.name}
          </p>
        </div>

        {attempt && attempt.violationCount > 0 && (
          <div className="p-3 max-w-md mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Terdeteksi {attempt.violationCount} kali perpindahan tab selama ujian.</span>
          </div>
        )}

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => setExamMode("OVERVIEW")}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Kembali ke Ringkasan
          </button>
        </div>
      </div>

      {/* Answer Key & Discussion Review */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" /> Pembahasan Soal & Kunci Jawaban
        </h3>

        <div className="space-y-4">
          {activeQuiz.questions.map((q, idx) => {
            const userAns = attempt?.answers[q.id];
            const isCorrect = userAns === q.correctAnswer;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-500">
                    Soal #{idx + 1} ({q.points} Poin)
                  </span>
                  {q.questionType === "MULTIPLE_CHOICE" && (
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {isCorrect ? "Benar" : "Salah"}
                    </span>
                  )}
                </div>

                <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {q.questionText}
                </p>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200">
                    <strong>💡 Pembahasan Dosen:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
