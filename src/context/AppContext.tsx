"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  Role,
  Permission,
  Course,
  Module,
  ModuleItem,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizAttempt,
  AttendanceSession,
  AttendanceRecord,
  GradeItem,
  ForumTopic,
  SystemAuditLog,
  Faculty,
  StudyProgram,
  MasterCourse,
  normalizeAssignedMeetings,
} from "@/types";
import {
  MOCK_USERS,
  ROLE_PERMISSIONS,
  MOCK_COURSES,
  MOCK_ASSIGNMENTS,
  MOCK_QUIZZES,
  MOCK_ATTENDANCE_SESSIONS,
  MOCK_STUDENT_GRADES,
  MOCK_FORUM_TOPICS,
  MOCK_AUDIT_LOGS,
  MOCK_FACULTIES,
  MOCK_STUDY_PROGRAMS,
  MOCK_MASTER_COURSES,
} from "@/data/mockData";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "ASSIGNMENT" | "QUIZ" | "HYBRID" | "GRADE" | "SYSTEM";
  link?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];

interface AppContextType {
  currentUser: User;
  users: User[];
  isAuthenticated: boolean;
  login: (identifier: string, password: string, captchaInput: string, captchaExpected: string) => { success: boolean; message: string };
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  rolePermissions: typeof ROLE_PERMISSIONS;
  switchUser: (userId: string) => void;
  switchRole: (role: Role) => void;
  courses: Course[];
  userCourses: Course[];
  activeCourseId: string | null;
  setActiveCourseId: (id: string | null) => void;
  assignments: Assignment[];
  userAssignments: Assignment[];
  quizzes: Quiz[];
  userQuizzes: Quiz[];
  attendanceSessions: AttendanceSession[];
  userAttendanceSessions: AttendanceSession[];
  grades: GradeItem[];
  userGrades: GradeItem[];
  forumTopics: ForumTopic[];
  userForumTopics: ForumTopic[];
  auditLogs: SystemAuditLog[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Actions
  addCourse: (courseData: Partial<Course>) => Promise<{ success: boolean; error?: string; course?: Course }>;
  updateCourse: (courseId: string, courseData: Partial<Course>) => Promise<{ success: boolean; error?: string }>;
  deleteCourse: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  assignCourseLecturer: (courseId: string, dosenId: string, courseCode?: string, fallbackCourse?: Partial<Course>) => Promise<{ success: boolean; error?: string }>;
  setCourseTeamTeaching: (courseId: string, teamTeaching: any[], courseCode?: string, fallbackCourse?: Partial<Course>) => Promise<{ success: boolean; error?: string }>;
  createAssignment: (data: Partial<Assignment>) => Assignment;
  updateAssignment: (assignmentId: string, updatedData: Partial<Assignment>) => void;
  deleteAssignment: (assignmentId: string) => void;
  uploadAssignmentQuestionFile: (assignmentId: string, file: { name: string; size: string; url?: string }) => void;
  submitAssignment: (assignmentId: string, file: { name: string; size: string }, notes: string) => void;
  gradeSubmission: (assignmentId: string, submissionId: string, score: number, feedback: string) => void;
  addCourseModule: (courseId: string, title: string, description: string, weekNumber: number, assignedDosenId?: string) => Promise<{ success: boolean; error?: string; module?: any }>;
  updateCourseModule: (courseId: string, moduleId: string, moduleData: Partial<Module>) => Promise<{ success: boolean; error?: string }>;
  deleteCourseModule: (courseId: string, moduleId: string) => Promise<{ success: boolean; error?: string }>;
  addModuleItem: (courseId: string, moduleId: string, item: any) => Promise<{ success: boolean; error?: string; item?: any }>;
  updateModuleItem: (courseId: string, moduleId: string, itemId: string, itemData: any) => Promise<{ success: boolean; error?: string }>;
  deleteModuleItem: (courseId: string, moduleId: string, itemId: string) => Promise<{ success: boolean; error?: string }>;
  toggleModulePublish: (courseId: string, moduleId: string) => Promise<{ success: boolean; error?: string }>;
  saveQuizAttempt: (attempt: QuizAttempt) => void;
  checkInAttendance: (sessionId: string, passcode: string, mode: "PRESENT_ONLINE" | "PRESENT_OFFLINE") => { success: boolean; message: string };
  createAttendanceSession: (courseId: string, topic: string, weekNumber: number, durationMinutes: number) => AttendanceSession;
  addUser: (user: Partial<User>) => Promise<{ success: boolean; error?: string; user?: User }>;
  updateUser: (id: string, user: Partial<User>) => Promise<{ success: boolean; error?: string; user?: User }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordToDefault: (userId: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  addForumPost: (courseId: string, title: string, content: string, tags: string[]) => void;
  addForumReply: (topicId: string, content: string) => void;
  
  // Master Data
  faculties: Faculty[];
  studyPrograms: StudyProgram[];
  masterCourses: MasterCourse[];
  addFaculty: (data: Partial<Faculty>) => void;
  updateFaculty: (id: string, data: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;
  addStudyProgram: (data: Partial<StudyProgram>) => void;
  updateStudyProgram: (id: string, data: Partial<StudyProgram>) => void;
  deleteStudyProgram: (id: string) => void;
  addMasterCourse: (data: Partial<MasterCourse>) => void;
  updateMasterCourse: (id: string, data: Partial<MasterCourse>) => void;
  deleteMasterCourse: (id: string) => void;

  // Session timeout
  sessionTimeoutMinutes: number;
  lastActivityTime: number;
  resetSessionTimer: () => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Storage reset
  resetAllDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Default Admin
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Start logged out
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(MOCK_QUIZZES);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(MOCK_ATTENDANCE_SESSIONS);
  const [grades, setGrades] = useState<GradeItem[]>(MOCK_STUDENT_GRADES);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(MOCK_FORUM_TOPICS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(MOCK_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Master Data States
  const [faculties, setFaculties] = useState<Faculty[]>(MOCK_FACULTIES);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>(MOCK_STUDY_PROGRAMS);
  const [masterCourses, setMasterCourses] = useState<MasterCourse[]>(MOCK_MASTER_COURSES);

  // ── LOAD FROM LOCALSTORAGE ON MOUNT ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedUsers = localStorage.getItem("lms_ucic_users");
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed) && parsed.length > 0) setUsers(parsed);
        } catch (e) {}
      }

      const savedAuth = localStorage.getItem("lms_ucic_auth");
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          if (parsed.currentUser) setCurrentUser(parsed.currentUser);
          if (typeof parsed.isAuthenticated === "boolean") setIsAuthenticated(parsed.isAuthenticated);
        } catch (e) {}
      }

      const savedCourses = localStorage.getItem("lms_ucic_courses");
      if (savedCourses) {
        try {
          const parsed = JSON.parse(savedCourses);
          if (Array.isArray(parsed)) setCourses(parsed);
        } catch (e) {}
      }

      const savedActiveCourseId = localStorage.getItem("lms_ucic_activeCourseId");
      if (savedActiveCourseId) setActiveCourseId(savedActiveCourseId);

      const savedAssignments = localStorage.getItem("lms_ucic_assignments");
      if (savedAssignments) {
        try {
          const parsed = JSON.parse(savedAssignments);
          if (Array.isArray(parsed)) setAssignments(parsed);
        } catch (e) {}
      }

      const savedQuizzes = localStorage.getItem("lms_ucic_quizzes");
      if (savedQuizzes) {
        try {
          const parsed = JSON.parse(savedQuizzes);
          if (Array.isArray(parsed)) setQuizzes(parsed);
        } catch (e) {}
      }

      const savedAttendance = localStorage.getItem("lms_ucic_attendance");
      if (savedAttendance) {
        try {
          const parsed = JSON.parse(savedAttendance);
          if (Array.isArray(parsed)) setAttendanceSessions(parsed);
        } catch (e) {}
      }

      const savedGrades = localStorage.getItem("lms_ucic_grades");
      if (savedGrades) {
        try {
          const parsed = JSON.parse(savedGrades);
          if (Array.isArray(parsed)) setGrades(parsed);
        } catch (e) {}
      }

      const savedForum = localStorage.getItem("lms_ucic_forum");
      if (savedForum) {
        try {
          const parsed = JSON.parse(savedForum);
          if (Array.isArray(parsed)) setForumTopics(parsed);
        } catch (e) {}
      }

      const savedLogs = localStorage.getItem("lms_ucic_auditLogs");
      if (savedLogs) {
        try {
          const parsed = JSON.parse(savedLogs);
          if (Array.isArray(parsed)) setAuditLogs(parsed);
        } catch (e) {}
      }

      const savedNotifs = localStorage.getItem("lms_ucic_notifications");
      if (savedNotifs) {
        try {
          const parsed = JSON.parse(savedNotifs);
          if (Array.isArray(parsed)) setNotifications(parsed);
        } catch (e) {}
      }

      const savedTheme = localStorage.getItem("lms_ucic_theme");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      }

      // Master Data
      const savedFaculties = localStorage.getItem("lms_ucic_faculties");
      if (savedFaculties) {
        try {
          const parsed = JSON.parse(savedFaculties);
          if (Array.isArray(parsed)) setFaculties(parsed);
        } catch (e) {}
      }

      const savedStudyPrograms = localStorage.getItem("lms_ucic_studyPrograms");
      if (savedStudyPrograms) {
        try {
          const parsed = JSON.parse(savedStudyPrograms);
          if (Array.isArray(parsed)) setStudyPrograms(parsed);
        } catch (e) {}
      }

      const savedMasterCourses = localStorage.getItem("lms_ucic_masterCourses");
      if (savedMasterCourses) {
        try {
          const parsed = JSON.parse(savedMasterCourses);
          if (Array.isArray(parsed)) setMasterCourses(parsed);
        } catch (e) {}
      }

      // Fetch fresh real data from SQLite Server Database (so data is synced across all browsers/devices)
      syncWithServer();
    } catch (err) {
      console.error("Gagal memuat cache data dari localStorage:", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // ── AUTO-SYNC WITH SERVER (THROTTLED & CLEANED UP) ────────────────────────
  const isSyncingRef = useRef<boolean>(false);
  const lastSyncTimeRef = useRef<number>(0);

  const syncWithServer = useCallback(async (force = false) => {
    const now = Date.now();
    // Throttle sync to at most once every 4 seconds unless forced
    if (!force && (isSyncingRef.current || now - lastSyncTimeRef.current < 4000)) {
      return;
    }
    isSyncingRef.current = true;
    lastSyncTimeRef.current = now;

    try {
      const [resUsers, resCourses, resMasterCourses, resFaculties, resProdis] = await Promise.all([
        fetch("/api/users").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/courses").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/master-courses").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/faculties").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/study-programs").then((r) => (r.ok ? r.json() : null)),
      ]);

      if (Array.isArray(resUsers) && resUsers.length > 0) {
        setUsers(resUsers);
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_ucic_users", JSON.stringify(resUsers));
        }

        // Synchronize currentUser with canonical database record
        setCurrentUser((prevUser) => {
          if (!prevUser) return prevUser;
          const matched = resUsers.find(
            (u) =>
              u.id === prevUser.id ||
              (u.nim_nip && prevUser.nim_nip && u.nim_nip.trim().toLowerCase() === prevUser.nim_nip.trim().toLowerCase()) ||
              (u.email && prevUser.email && u.email.trim().toLowerCase() === prevUser.email.trim().toLowerCase())
          );
          if (matched) {
            const updatedUser = { ...prevUser, ...matched };
            if (typeof window !== "undefined") {
              const savedAuth = localStorage.getItem("lms_ucic_auth");
              if (savedAuth) {
                try {
                  const parsed = JSON.parse(savedAuth);
                  localStorage.setItem("lms_ucic_auth", JSON.stringify({ ...parsed, currentUser: updatedUser }));
                } catch (e) {}
              }
            }
            return updatedUser;
          }
          return prevUser;
        });
      }

      if (Array.isArray(resCourses)) {
        setCourses(resCourses);
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_ucic_courses", JSON.stringify(resCourses));
        }
      }

      if (Array.isArray(resMasterCourses)) {
        setMasterCourses(resMasterCourses);
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_ucic_masterCourses", JSON.stringify(resMasterCourses));
        }
      }

      if (Array.isArray(resFaculties)) {
        setFaculties(resFaculties);
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_ucic_faculties", JSON.stringify(resFaculties));
        }
      }

      if (Array.isArray(resProdis)) {
        setStudyPrograms(resProdis);
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_ucic_studyPrograms", JSON.stringify(resProdis));
        }
      }
    } catch (err) {
      console.log("Error sync with server:", err);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Auto sync when browser tab gets focus or becomes visible
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncWithServer();
      }
    };
    const handleFocus = () => {
      syncWithServer();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncWithServer]);

  // ── AUTO-SAVE TO LOCALSTORAGE WHEN STATE CHANGES ───────────────────────────
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_users", JSON.stringify(users));
  }, [users, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_auth", JSON.stringify({ isAuthenticated, currentUser }));
  }, [isAuthenticated, currentUser, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_courses", JSON.stringify(courses));
  }, [courses, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    if (activeCourseId) {
      localStorage.setItem("lms_ucic_activeCourseId", activeCourseId);
    }
  }, [activeCourseId, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_assignments", JSON.stringify(assignments));
  }, [assignments, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_quizzes", JSON.stringify(quizzes));
  }, [quizzes, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_attendance", JSON.stringify(attendanceSessions));
  }, [attendanceSessions, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_grades", JSON.stringify(grades));
  }, [grades, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_forum", JSON.stringify(forumTopics));
  }, [forumTopics, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_auditLogs", JSON.stringify(auditLogs));
  }, [auditLogs, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_notifications", JSON.stringify(notifications));
  }, [notifications, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_faculties", JSON.stringify(faculties));
  }, [faculties, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_studyPrograms", JSON.stringify(studyPrograms));
  }, [studyPrograms, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_masterCourses", JSON.stringify(masterCourses));
  }, [masterCourses, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("lms_ucic_theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, isInitialized]);

  // Session timeout state
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const isAuthenticatedRef = useRef(false);
  isAuthenticatedRef.current = isAuthenticated;

  // ── SESSION TIMEOUT ──────────────────────────────────────────────────────
  // Reset the inactivity timer — called on every user interaction
  const resetSessionTimer = useCallback(() => {
    if (!isAuthenticatedRef.current) return;
    setLastActivityTime(Date.now());
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    sessionTimerRef.current = setTimeout(() => {
      // Auto-logout after 30 minutes of inactivity
      if (isAuthenticatedRef.current) {
        setIsAuthenticated(false);
        const log: SystemAuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: "system",
          userName: "System",
          userRole: "ADMIN",
          action: "SESSION_TIMEOUT",
          category: "AUTH",
          ipAddress: "127.0.0.1",
          status: "WARNING",
          details: "Sesi otomatis berakhir karena tidak ada aktivitas selama 30 menit.",
        };
        setAuditLogs((prev) => [log, ...prev]);
      }
    }, SESSION_TIMEOUT_MS);
  }, [SESSION_TIMEOUT_MS]);

  // Start/stop activity listeners based on auth state
  useEffect(() => {
    if (!isAuthenticated) {
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
      return;
    }
    // Listen for any user activity to reset the timer
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    const handleActivity = () => resetSessionTimer();
    events.forEach((ev) => window.addEventListener(ev, handleActivity, { passive: true }));
    // Start the timer immediately upon login
    resetSessionTimer();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    };
  }, [isAuthenticated, resetSessionTimer]);
  // ────────────────────────────────────────────────────────────────────────

  // Compute filtered courses for the active logged-in user
  const userCourses = React.useMemo(() => {
    if (currentUser.role === "ADMIN") {
      return courses;
    }
    if (currentUser.role === "DOSEN") {
      const normalizeLecturer = (str: string) =>
        (str || "")
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .replace(/\b(dr|dra|ir|prof|phd|mkom|skom|mt|mti|st|si|msi|mm|bapak|bpk|ibu|dosen)\b/g, "")
          .replace(/\s+/g, " ")
          .trim();

      const currentNorm = normalizeLecturer(currentUser.name);
      const currentTokens = currentNorm.split(" ").filter((t) => t.length >= 3);

      return courses.filter((c) => {
        // 1. Direct ID match (most accurate & reliable)
        const matchLeadId = Boolean(
          (c.instructorId && c.instructorId === currentUser.id) ||
          (c.instructorId && currentUser.nim_nip && c.instructorId === currentUser.nim_nip) ||
          (c.instructorNip && c.instructorNip === currentUser.id)
        );

        // 2. NIP match (if NIP exists and not empty)
        const matchLeadNip = Boolean(
          c.instructorNip &&
          currentUser.nim_nip &&
          c.instructorNip.trim() !== "" &&
          c.instructorNip.trim().toLowerCase() === currentUser.nim_nip.trim().toLowerCase()
        );

        // 3. Name match (case-insensitive, title stripped, token match)
        const leadNorm = normalizeLecturer(c.instructorName || "");
        const leadTokens = leadNorm.split(" ").filter((t) => t.length >= 3);
        const hasTokenMatch = currentTokens.some((t) => leadTokens.includes(t));
        const matchLeadName = Boolean(
          (currentNorm && leadNorm && (currentNorm === leadNorm || currentNorm.includes(leadNorm) || leadNorm.includes(currentNorm))) ||
          hasTokenMatch
        );

        // 4. Team teaching match (by dosenId, dosenNip, or name/tokens)
        const matchTeam = c.teamTeaching?.some((tt) => {
          const teamIdMatch = Boolean(
            (tt.dosenId && tt.dosenId === currentUser.id) ||
            (tt.dosenId && currentUser.nim_nip && tt.dosenId === currentUser.nim_nip) ||
            (tt.dosenNip && tt.dosenNip === currentUser.id)
          );
          const teamNipMatch = Boolean(
            tt.dosenNip &&
            currentUser.nim_nip &&
            tt.dosenNip.trim() !== "" &&
            tt.dosenNip.trim().toLowerCase() === currentUser.nim_nip.trim().toLowerCase()
          );
          const ttNorm = normalizeLecturer(tt.dosenName || "");
          const ttTokens = ttNorm.split(" ").filter((t) => t.length >= 3);
          const ttTokenMatch = currentTokens.some((t) => ttTokens.includes(t));
          const teamNameMatch = Boolean(
            (currentNorm && ttNorm && (currentNorm === ttNorm || currentNorm.includes(ttNorm) || ttNorm.includes(currentNorm))) ||
            ttTokenMatch
          );
          return teamIdMatch || teamNipMatch || teamNameMatch;
        });

        // 5. Module assigned lecturer match
        const matchModule = c.modules?.some((m) => {
          const modIdMatch = Boolean(
            (m.assignedDosenId && m.assignedDosenId === currentUser.id) ||
            (m.assignedDosenId && currentUser.nim_nip && m.assignedDosenId === currentUser.nim_nip)
          );
          const modNipMatch = Boolean(
            m.assignedDosenNip &&
            currentUser.nim_nip &&
            m.assignedDosenNip.trim() !== "" &&
            m.assignedDosenNip.trim().toLowerCase() === currentUser.nim_nip.trim().toLowerCase()
          );
          return modIdMatch || modNipMatch;
        });

        return matchLeadId || matchLeadNip || matchLeadName || matchTeam || matchModule;
      });
    }
    // STUDENT - All enrolled courses
    return courses;
  }, [courses, currentUser]);

  // Scoped collections for Dosen & Students
  const userAssignments = React.useMemo(() => {
    if (currentUser.role === "ADMIN") return assignments;
    const allowedCourseIds = new Set(userCourses.map((c) => c.id));
    return assignments.filter((a) => allowedCourseIds.has(a.courseId));
  }, [assignments, userCourses, currentUser.role]);

  const userQuizzes = React.useMemo(() => {
    if (currentUser.role === "ADMIN") return quizzes;
    const allowedCourseIds = new Set(userCourses.map((c) => c.id));
    return quizzes.filter((q) => allowedCourseIds.has(q.courseId));
  }, [quizzes, userCourses, currentUser.role]);

  const userAttendanceSessions = React.useMemo(() => {
    if (currentUser.role === "ADMIN") return attendanceSessions;
    const allowedCourseIds = new Set(userCourses.map((c) => c.id));
    return attendanceSessions.filter((s) => allowedCourseIds.has(s.courseId));
  }, [attendanceSessions, userCourses, currentUser.role]);

  const userGrades = React.useMemo(() => {
    if (currentUser.role === "ADMIN") return grades;
    if (currentUser.role === "DOSEN") {
      const allowedCourseIds = new Set(userCourses.map((c) => c.id));
      return grades.filter((g) => allowedCourseIds.has(g.courseId));
    }
    return grades;
  }, [grades, userCourses, currentUser.role]);

  const userForumTopics = React.useMemo(() => {
    if (currentUser.role === "ADMIN") return forumTopics;
    const allowedCourseIds = new Set(userCourses.map((c) => c.id));
    return forumTopics.filter((t) => allowedCourseIds.has(t.courseId));
  }, [forumTopics, userCourses, currentUser.role]);

  // Keep activeCourseId valid when switching users / deleting courses
  useEffect(() => {
    if (userCourses.length > 0) {
      if (!activeCourseId || !userCourses.some((c) => c.id === activeCourseId)) {
        setActiveCourseId(userCourses[0].id);
      }
    } else {
      setActiveCourseId(null);
    }
  }, [userCourses, currentUser]);

  // Login handler with Captcha validation
  const login = (
    identifier: string,
    password: string,
    captchaInput: string,
    captchaExpected: string
  ): { success: boolean; message: string } => {
    // 1. Verify Captcha
    if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaExpected.trim().toUpperCase()) {
      return {
        success: false,
        message: "Kode Captcha keamanan tidak sesuai atau salah hitung. Silakan coba lagi!",
      };
    }

    // 2. Find User by NIM/NIP, Email, or admin alias
    const cleanId = identifier.trim().toLowerCase();
    const userFound = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.nim_nip.toLowerCase() === cleanId ||
        (cleanId === "admin" && (u.role === "ADMIN" || u.email.toLowerCase() === "admin@cic.ac.id"))
    );

    if (!userFound) {
      return {
        success: false,
        message: "NIM / NIP / Email tidak terdaftar dalam sistem LMS-UCIC.",
      };
    }

    // 3. Verify Password
    if (userFound.password && userFound.password !== password) {
      // Audit log failed attempt
      const failLog: SystemAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: userFound.id,
        userName: userFound.name,
        userRole: userFound.role,
        action: "AUTH_FAILED",
        category: "AUTH",
        ipAddress: "127.0.0.1",
        status: "FAILED",
        details: `Percobaan login gagal untuk akun ${userFound.name} (Kata sandi salah).`,
      };
      setAuditLogs((prev) => [failLog, ...prev]);

      return {
        success: false,
        message: "Kata sandi yang Anda masukkan salah. Periksa kembali!",
      };
    }

    // 4. Successful login
    setCurrentUser(userFound);
    setIsAuthenticated(true);
    setLastActivityTime(Date.now()); // Reset activity time on login
    syncWithServer(); // Fetch fresh courses & users from server database on login

    const successLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: userFound.id,
      userName: userFound.name,
      userRole: userFound.role,
      action: "AUTH_LOGIN",
      category: "AUTH",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      details: `Login berhasil sebagai ${userFound.role} (${userFound.name}) dengan verifikasi Captcha.`,
    };
    setAuditLogs((prev) => [successLog, ...prev]);

    return {
      success: true,
      message: `Selamat datang kembali, ${userFound.name}!`,
    };
  };

  const logout = () => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    // Audit log for manual logout
    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "AUTH_LOGOUT",
      category: "AUTH",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      details: `${currentUser.name} logout dari sesi aktif.`,
    };
    setAuditLogs((prev) => [log, ...prev]);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lms_ucic_activeView");
      localStorage.setItem("lms_ucic_auth", JSON.stringify({ isAuthenticated: false, currentUser }));
    }
  };

  // Check if current user has specific permission
  const hasPermission = (perm: Permission): boolean => {
    if (!currentUser) return false;
    const rolePerms = ROLE_PERMISSIONS[currentUser.role]?.permissions || [];
    return rolePerms.includes(perm) || (currentUser.permissions || []).includes(perm);
  };

  // Handle Theme Toggle
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const switchRole = (role: Role) => {
    const userOfRole = users.find((u) => u.role === role);
    if (userOfRole) {
      setCurrentUser(userOfRole);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Submit Assignment
  const submitAssignment = (
    assignmentId: string,
    file: { name: string; size: string },
    notes: string
  ) => {
    const newSubmission: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentNim: currentUser.nim_nip,
      studentAvatar: currentUser.avatar,
      fileUrl: "#",
      fileName: file.name,
      fileSize: file.size,
      submissionNotes: notes,
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
    };

    setAssignments((prev) =>
      prev.map((assign) => {
        if (assign.id === assignmentId) {
          const filtered = assign.submissions.filter((s) => s.studentId !== currentUser.id);
          return { ...assign, submissions: [...filtered, newSubmission] };
        }
        return assign;
      })
    );

    // Audit log
    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "SUBMIT_ASSIGNMENT",
      category: "SUBMISSION",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      details: `Mengunggah berkas ${file.name} untuk tugas ID: ${assignmentId}`,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Create Assignment (Lecturer / Admin)
  const createAssignment = (data: Partial<Assignment>): Assignment => {
    const newId = data.id || `assign-${Date.now()}`;
    const targetCourse = courses.find((c) => c.id === data.courseId) || courses[0];
    const newAssignment: Assignment = {
      id: newId,
      courseId: data.courseId || targetCourse?.id || "course-1",
      courseName: data.courseName || targetCourse?.name || "Matakuliah",
      title: data.title || "Tugas Baru",
      instructions: data.instructions || "Silakan kerjakan tugas sesuai instruksi dan rubrik yang telah ditentukan.",
      attachmentUrl: data.attachmentUrl || "",
      attachmentFileName: data.attachmentFileName || "",
      attachmentFileSize: data.attachmentFileSize || "",
      maxScore: data.maxScore || 100,
      deadline: data.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      allowLate: data.allowLate ?? true,
      rubric: data.rubric || [
        { criteria: "Ketepatan Jawaban & Kerapian", weightPercent: 50, maxPoints: 50 },
        { criteria: "Kelengkapan Analisis & Dokumentasi", weightPercent: 50, maxPoints: 50 },
      ],
      submissions: data.submissions || [],
    };

    setAssignments((prev) => [newAssignment, ...prev]);

    // Audit log
    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "CREATE_ASSIGNMENT",
      category: "SYSTEM",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      details: `Membuat tugas perkuliahan baru: "${newAssignment.title}"`,
    };
    setAuditLogs((prev) => [log, ...prev]);

    return newAssignment;
  };

  // Update Assignment (Lecturer / Admin)
  const updateAssignment = (assignmentId: string, updatedData: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, ...updatedData } : a))
    );
  };

  // Delete Assignment
  const deleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  };

  // Upload Assignment Question File (Lecturer)
  const uploadAssignmentQuestionFile = (
    assignmentId: string,
    file: { name: string; size: string; url?: string }
  ) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              attachmentFileName: file.name,
              attachmentFileSize: file.size,
              attachmentUrl: file.url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            }
          : a
      )
    );

    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "UPLOAD_QUESTION",
      category: "COURSE",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      details: `Mengunggah berkas soal "${file.name}" untuk tugas ID: ${assignmentId}`,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Grade Submission (Lecturer)
  const gradeSubmission = (
    assignmentId: string,
    submissionId: string,
    score: number,
    feedback: string
  ) => {
    setAssignments((prev) =>
      prev.map((assign) => {
        if (assign.id === assignmentId) {
          const updatedSubs = assign.submissions.map((sub) => {
            if (sub.id === submissionId) {
              return {
                ...sub,
                score,
                feedback,
                status: "GRADED" as const,
                gradedBy: currentUser.name,
                gradedAt: new Date().toISOString(),
              };
            }
            return sub;
          });
          return { ...assign, submissions: updatedSubs };
        }
        return assign;
      })
    );
  };

  // Add Course (Admin)
  const addCourse = async (courseData: Partial<Course>): Promise<{ success: boolean; error?: string; course?: Course }> => {
    const courseId = `course-${Date.now()}`;

    const resolvedInstructor =
      (courseData.instructorId ? users.find((u) => u.id === courseData.instructorId || u.nim_nip === courseData.instructorId) : null) ||
      (courseData.instructorNip ? users.find((u) => u.nim_nip === courseData.instructorNip) : null) ||
      (courseData.instructorName ? users.find((u) => u.name === courseData.instructorName) : null) ||
      users.find((u) => u.role === "DOSEN") ||
      null;

    const resolvedInstructorId = courseData.instructorId || resolvedInstructor?.id || (courseData.instructorNip ? users.find((u) => u.nim_nip === courseData.instructorNip)?.id : undefined);
    const resolvedInstructorName = courseData.instructorName || resolvedInstructor?.name || "Dosen Pengampu";
    const resolvedInstructorNip = courseData.instructorNip || resolvedInstructor?.nim_nip || "-";
    const resolvedInstructorAvatar = courseData.instructorAvatar || resolvedInstructor?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

    const newCourse: Course = {
      id: courseId,
      code: courseData.code || `IF${Math.floor(1000 + Math.random() * 9000)}`,
      name: courseData.name || "Matakuliah Baru",
      description: courseData.description || "",
      credits: courseData.credits || 3,
      coverImage:
        courseData.coverImage ||
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      faculty: courseData.faculty || resolvedInstructor?.faculty || "Fakultas Teknologi Informasi",
      studyProgram: courseData.studyProgram || resolvedInstructor?.studyProgram || "Teknik Informatika",
      academicYear: courseData.academicYear || "2026/2027",
      semester: courseData.semester || "Ganjil (Semester 5)",
      instructorId: resolvedInstructorId,
      instructorName: resolvedInstructorName,
      instructorAvatar: resolvedInstructorAvatar,
      instructorNip: resolvedInstructorNip,
      deliveryMode: courseData.deliveryMode || "HYBRID",
      room: courseData.room || "Ruang Kelas Hybrid A.101",
      scheduleDay: courseData.scheduleDay || "Senin",
      scheduleTime: courseData.scheduleTime || "08:00 - 10:30 WIB",
      meetingLink: courseData.meetingLink || "https://meet.google.com/abc-defg-hij",
      progressPercent: 0,
      totalStudents: 35,
      teamTeaching: courseData.teamTeaching || [
        {
          dosenId: resolvedInstructorId || "dosen-1",
          dosenName: resolvedInstructorName,
          dosenNip: resolvedInstructorNip,
          dosenAvatar: resolvedInstructorAvatar,
          role: "KOORDINATOR",
          assignedMeetings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        },
      ],
      modules: courseData.modules || [],
    };

    setCourses((prev) => {
      const next = [newCourse, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCourse,
          actorId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setCourses((prev) => {
          const next = prev.filter((c) => c.id !== newCourse.id);
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
          }
          return next;
        });
        return { success: false, error: errJson.error || `Gagal menyimpan matakuliah (${res.status})` };
      }

      const savedCourse = await res.json();
      if (savedCourse && savedCourse.id) {
        setCourses((prev) => {
          const next = prev.map((c) => (c.id === newCourse.id ? { ...c, ...savedCourse } : c));
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
          }
          return next;
        });
      }

      // Log audit
      const auditLog: SystemAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "CREATE_COURSE",
        category: "COURSE",
        ipAddress: "127.0.0.1",
        status: "SUCCESS",
        details: `Menambahkan matakuliah baru: ${newCourse.code} - ${newCourse.name}`,
      };
      setAuditLogs((prev) => [auditLog, ...prev]);

      return { success: true, course: savedCourse || newCourse };
    } catch (err: any) {
      console.error("Gagal sync course ke database:", err);
      setCourses((prev) => {
        const next = prev.filter((c) => c.id !== newCourse.id);
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
        }
        return next;
      });
      return { success: false, error: err?.message || "Koneksi ke server terputus saat menyimpan matakuliah." };
    }
  };

  // Update Course (Admin)
  const updateCourse = async (courseId: string, courseData: Partial<Course>): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (courseId || "").trim();
    const cleanCode = (courseData.code || "").trim().toUpperCase();

    const targetCourse = courses.find((c) =>
      (cleanId && c.id === cleanId) ||
      (cleanId && c.code?.trim().toUpperCase() === cleanId.toUpperCase()) ||
      (cleanCode && c.code?.trim().toUpperCase() === cleanCode)
    );

    const effectiveId = targetCourse?.id || cleanId;
    const effectiveCode = (courseData.code || targetCourse?.code || cleanId).toUpperCase();

    // Optimistic local state update
    setCourses((prev) => {
      const next = prev.map((c) => {
        const isMatch =
          c.id === effectiveId ||
          c.code?.trim().toUpperCase() === effectiveCode ||
          (cleanId && c.id === cleanId) ||
          (cleanId && c.code?.trim().toUpperCase() === cleanId.toUpperCase());
        return isMatch ? { ...c, ...courseData, id: c.id, code: courseData.code || c.code } : c;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    try {
      const lookupKey = effectiveId || effectiveCode;
      const res = await fetch(`/api/courses/${encodeURIComponent(lookupKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...courseData,
          id: effectiveId,
          code: effectiveCode,
          actorId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }

      const saved = await res.json();
      if (saved && saved.id) {
        setCourses((prev) => {
          const next = prev.map((c) =>
            c.id === effectiveId || c.id === saved.id || c.code?.toUpperCase() === saved.code?.toUpperCase()
              ? { ...c, ...saved }
              : c
          );
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
          }
          return next;
        });
      }
      return { success: true };
    } catch (err: any) {
      console.error("Gagal update course ke database:", err);
      return { success: false, error: err?.message || "Gagal memperbarui matakuliah di server." };
    } finally {
      // Log audit
      const auditLog: SystemAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "UPDATE_COURSE",
        category: "COURSE",
        ipAddress: "127.0.0.1",
        status: "SUCCESS",
        details: `Memperbarui data matakuliah: ${targetCourse?.code || effectiveCode}`,
      };
      setAuditLogs((prev) => [auditLog, ...prev]);
    }
  };

  // Delete Course (Admin)
  const deleteCourse = async (courseId: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (courseId || "").trim().toUpperCase();
    const target = courses.find((c) =>
      c.id === courseId ||
      c.code?.trim().toUpperCase() === cleanId
    );

    setCourses((prev) => {
      const next = prev.filter((c) =>
        c.id !== courseId &&
        c.code?.trim().toUpperCase() !== cleanId &&
        (!target || c.id !== target.id)
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    if (activeCourseId === courseId || (target && activeCourseId === target.id)) {
      const remaining = courses.filter((c) => c.id !== courseId && c.id !== target?.id);
      setActiveCourseId(remaining[0]?.id || null);
    }

    try {
      const lookupKey = target?.id || target?.code || courseId;
      const res = await fetch(`/api/courses/${encodeURIComponent(lookupKey)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: currentUser.id }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }

      // Log audit
      const auditLog: SystemAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: "DELETE_COURSE",
        category: "COURSE",
        ipAddress: "127.0.0.1",
        status: "SUCCESS",
        details: `Menghapus matakuliah: ${target?.code || courseId} - ${target?.name || ""}`,
      };
      setAuditLogs((prev) => [auditLog, ...prev]);

      return { success: true };
    } catch (err: any) {
      console.error("Gagal hapus course dari database:", err);
      if (target) {
        setCourses((prev) => [target, ...prev]);
      }
      return { success: false, error: err?.message || "Gagal menghapus matakuliah dari database." };
    }
  };

  // Set Course Team Teaching (Admin / Dosen Lead)
  const setCourseTeamTeaching = async (
    courseId: string,
    teamTeaching: any[],
    courseCode?: string,
    fallbackCourse?: Partial<Course>
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (courseId || "").trim();
    const cleanCode = (courseCode || fallbackCourse?.code || "").trim().toUpperCase();

    // Match course from existing state or fallback object
    const targetCourse = courses.find((c) =>
      (cleanId && c.id === cleanId) ||
      (cleanId && c.code?.trim().toUpperCase() === cleanId.toUpperCase()) ||
      (cleanCode && c.code?.trim().toUpperCase() === cleanCode) ||
      (fallbackCourse?.id && c.id === fallbackCourse.id)
    ) || fallbackCourse;

    const effectiveId = targetCourse?.id || cleanId;
    const effectiveCode = (targetCourse?.code || cleanCode || cleanId).toUpperCase();

    if (!targetCourse && !effectiveId && !effectiveCode) {
      return { success: false, error: "Matakuliah tidak ditemukan." };
    }

    const koordinator = teamTeaching.find((tt) => tt.role === "KOORDINATOR") || teamTeaching[0];

    // Build payload synchronously outside React state callback
    const updatedPayload: any = {
      id: effectiveId,
      code: effectiveCode,
      name: targetCourse?.name,
      description: targetCourse?.description,
      credits: targetCourse?.credits,
      faculty: targetCourse?.faculty,
      studyProgram: targetCourse?.studyProgram,
      academicYear: targetCourse?.academicYear,
      semester: targetCourse?.semester,
      instructorId: koordinator?.dosenId || targetCourse?.instructorId,
      instructorName: koordinator?.dosenName || targetCourse?.instructorName,
      instructorNip: koordinator?.dosenNip || targetCourse?.instructorNip,
      instructorAvatar: koordinator?.dosenAvatar || targetCourse?.instructorAvatar,
      deliveryMode: targetCourse?.deliveryMode,
      room: targetCourse?.room,
      scheduleDay: targetCourse?.scheduleDay,
      scheduleTime: targetCourse?.scheduleTime,
      meetingLink: targetCourse?.meetingLink,
      teamTeaching,
      actorId: currentUser.id,
    };

    // Optimistically update React state and localStorage
    setCourses((prev) => {
      let matchedAny = false;
      const next = prev.map((c) => {
        const isMatch =
          c.id === effectiveId ||
          c.code?.trim().toUpperCase() === effectiveCode ||
          (cleanId && c.id === cleanId) ||
          (cleanId && c.code?.trim().toUpperCase() === cleanId.toUpperCase());

        if (isMatch) {
          matchedAny = true;
          // Sync module assigned lecturers safely
          const updatedModules = (c.modules || []).map((mod) => {
            const matchingMember = teamTeaching.find((tt) =>
              normalizeAssignedMeetings(tt.assignedMeetings).includes(mod.weekNumber)
            );
            if (matchingMember) {
              return {
                ...mod,
                assignedDosenId: matchingMember.dosenId,
                assignedDosenName: matchingMember.dosenName,
                assignedDosenNip: matchingMember.dosenNip,
              };
            }
            return mod;
          });

          return {
            ...c,
            ...updatedPayload,
            modules: updatedModules,
          };
        }
        return c;
      });

      // If targetCourse wasn't in prev yet, prepend it
      const finalList = matchedAny ? next : [{ ...targetCourse, ...updatedPayload } as Course, ...prev];

      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(finalList));
      }
      return finalList;
    });

    // Persist to Server Database
    try {
      const lookupKey = effectiveId || effectiveCode;
      const res = await fetch(`/api/courses/${encodeURIComponent(lookupKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }

      const saved = await res.json();
      if (saved && saved.id) {
        setCourses((prev) => {
          const exists = prev.some((c) => c.id === saved.id || c.code === saved.code);
          const next = exists
            ? prev.map((c) => (c.id === effectiveId || c.id === saved.id || c.code === saved.code ? { ...c, ...saved } : c))
            : [saved, ...prev];
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
          }
          return next;
        });
      }
      return { success: true };
    } catch (err: any) {
      console.error("Gagal sync team teaching ke database:", err);
      return { success: false, error: err?.message || "Gagal menyimpan alokasi tim teaching ke database." };
    }
  };

  // Assign or Claim Course Lecturer (Admin or Lecturer)
  const assignCourseLecturer = async (
    courseId: string,
    dosenId: string,
    courseCode?: string,
    fallbackCourse?: Partial<Course>
  ): Promise<{ success: boolean; error?: string }> => {
    const targetDosen = users.find(
      (u) =>
        u.id === dosenId ||
        (u.nim_nip && u.nim_nip === dosenId) ||
        (u.email && u.email === dosenId)
    );
    if (!targetDosen) return { success: false, error: "Data dosen pengampu tidak ditemukan." };

    const cleanId = (courseId || "").trim();
    const cleanCode = (courseCode || fallbackCourse?.code || "").trim().toUpperCase();

    const targetCourse = courses.find((c) =>
      (cleanId && c.id === cleanId) ||
      (cleanId && c.code?.trim().toUpperCase() === cleanId.toUpperCase()) ||
      (cleanCode && c.code?.trim().toUpperCase() === cleanCode) ||
      (fallbackCourse?.id && c.id === fallbackCourse.id)
    ) || fallbackCourse;

    const effectiveId = targetCourse?.id || cleanId;
    const effectiveCode = (targetCourse?.code || cleanCode || cleanId).toUpperCase();

    if (!targetCourse && !effectiveId && !effectiveCode) {
      return { success: false, error: "Matakuliah tidak ditemukan." };
    }

    // Keep existing team teaching if present, setting targetDosen as KOORDINATOR
    let existingTeam = targetCourse?.teamTeaching && targetCourse.teamTeaching.length > 0
      ? [...targetCourse.teamTeaching]
      : [];

    const existingIdx = existingTeam.findIndex(
      (tt) => tt.dosenId === targetDosen.id || (tt.dosenNip && tt.dosenNip === targetDosen.nim_nip)
    );

    if (existingIdx >= 0) {
      existingTeam = existingTeam.map((tt, idx) => {
        if (idx === existingIdx) {
          return {
            ...tt,
            dosenId: targetDosen.id,
            dosenName: targetDosen.name,
            dosenNip: targetDosen.nim_nip,
            dosenAvatar: targetDosen.avatar,
            role: "KOORDINATOR" as const,
          };
        }
        return {
          ...tt,
          role: "ANGGOTA" as const,
        };
      });
    } else {
      existingTeam = existingTeam.map((tt) => ({ ...tt, role: "ANGGOTA" as const }));
      existingTeam.unshift({
        dosenId: targetDosen.id,
        dosenName: targetDosen.name,
        dosenNip: targetDosen.nim_nip,
        dosenAvatar: targetDosen.avatar,
        role: "KOORDINATOR" as const,
        assignedMeetings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      });
    }

    const updatedPayload: any = {
      id: effectiveId,
      code: effectiveCode,
      name: targetCourse?.name,
      description: targetCourse?.description,
      credits: targetCourse?.credits,
      faculty: targetCourse?.faculty,
      studyProgram: targetCourse?.studyProgram,
      academicYear: targetCourse?.academicYear,
      semester: targetCourse?.semester,
      instructorId: targetDosen.id,
      instructorName: targetDosen.name,
      instructorNip: targetDosen.nim_nip,
      instructorAvatar: targetDosen.avatar,
      deliveryMode: targetCourse?.deliveryMode,
      room: targetCourse?.room,
      scheduleDay: targetCourse?.scheduleDay,
      scheduleTime: targetCourse?.scheduleTime,
      meetingLink: targetCourse?.meetingLink,
      teamTeaching: existingTeam,
      actorId: currentUser.id,
    };

    setCourses((prev) => {
      const next = prev.map((c) => {
        const isMatch =
          c.id === effectiveId ||
          c.code?.trim().toUpperCase() === effectiveCode ||
          (cleanId && c.id === cleanId);
        if (isMatch) {
          return {
            ...c,
            ...updatedPayload,
          };
        }
        return c;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    // Persist to Server Database
    try {
      const lookupKey = effectiveId || effectiveCode;
      const res = await fetch(`/api/courses/${encodeURIComponent(lookupKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }

      const saved = await res.json();
      if (saved && saved.id) {
        setCourses((prev) => {
          const next = prev.map((c) => (c.id === effectiveId || c.id === saved.id || c.code === saved.code ? { ...c, ...saved } : c));
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
          }
          return next;
        });
      }
      return { success: true };
    } catch (err: any) {
      console.error("Gagal sync assignCourseLecturer ke database:", err);
      return { success: false, error: err?.message || "Gagal menyimpan penugasan dosen ke server." };
    }
  };

  // Helper to persist modules to SQLite server
  const syncModulesToServer = async (
    courseId: string,
    updatedModules: any[]
  ): Promise<{ success: boolean; error?: string; course?: Course }> => {
    try {
      const cleanId = (courseId || "").trim();
      const targetCourse = courses.find((c) =>
        c.id === cleanId ||
        c.code?.trim().toUpperCase() === cleanId.toUpperCase()
      );
      const lookupKey = targetCourse?.id || targetCourse?.code || cleanId;
      const res = await fetch(`/api/courses/${encodeURIComponent(lookupKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetCourse?.id || cleanId,
          code: targetCourse?.code,
          name: targetCourse?.name,
          modules: updatedModules,
          actorId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }

      const saved = await res.json();
      if (saved && saved.id) {
        setCourses((prev) => {
          const next = prev.map((c) =>
            c.id === cleanId ||
            c.id === saved.id ||
            c.code?.toUpperCase() === saved.code?.toUpperCase()
              ? { ...c, ...saved }
              : c
          );
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
          }
          return next;
        });
        return { success: true, course: saved };
      }
      return { success: true };
    } catch (err: any) {
      console.error("Gagal sync modules ke database server:", err);
      return { success: false, error: err?.message || "Gagal menyimpan modul ke server." };
    }
  };

  // Add Module to Course (Dosen / Admin)
  const addCourseModule = async (
    courseId: string,
    title: string,
    description: string,
    weekNumber: number,
    assignedDosenId?: string
  ): Promise<{ success: boolean; error?: string; module?: any }> => {
    const cleanId = (courseId || "").trim();
    const targetCourse = courses.find((c) =>
      c.id === cleanId ||
      c.code?.trim().toUpperCase() === cleanId.toUpperCase()
    );
    if (!targetCourse) return { success: false, error: "Matakuliah tidak ditemukan." };

    // Resolve assigned dosen from teamTeaching or parameter
    let assignedName = targetCourse.instructorName;
    let assignedNip = targetCourse.instructorNip;
    let dosenId = assignedDosenId;

    if (assignedDosenId) {
      const foundUser = users.find((u) => u.id === assignedDosenId || u.nim_nip === assignedDosenId);
      if (foundUser) {
        assignedName = foundUser.name;
        assignedNip = foundUser.nim_nip;
      }
    } else if (targetCourse.teamTeaching) {
      const member = targetCourse.teamTeaching.find((tt) =>
        normalizeAssignedMeetings(tt.assignedMeetings).includes(weekNumber)
      );
      if (member) {
        dosenId = member.dosenId;
        assignedName = member.dosenName;
        assignedNip = member.dosenNip;
      }
    }

    const currentModules = targetCourse.modules || [];
    const newModule = {
      id: `mod-${Date.now()}`,
      courseId: targetCourse.id,
      title: title.trim(),
      description: description?.trim() || "",
      weekNumber: Number(weekNumber),
      orderIndex: currentModules.length + 1,
      isPublished: true,
      assignedDosenId: dosenId,
      assignedDosenName: assignedName,
      assignedDosenNip: assignedNip,
      items: [],
    };

    const nextModules = [...currentModules, newModule];

    setCourses((prev) => {
      const next = prev.map((c) =>
        c.id === targetCourse.id || c.code === targetCourse.code
          ? { ...c, modules: nextModules }
          : c
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    const syncRes = await syncModulesToServer(targetCourse.id, nextModules);
    return { ...syncRes, module: newModule };
  };

  // Update Module (Dosen / Admin)
  const updateCourseModule = async (
    courseId: string,
    moduleId: string,
    moduleData: Partial<Module>
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (courseId || "").trim();
    const targetCourse = courses.find((c) =>
      c.id === cleanId ||
      c.code?.trim().toUpperCase() === cleanId.toUpperCase()
    );
    if (!targetCourse) return { success: false, error: "Matakuliah tidak ditemukan." };

    const currentModules = targetCourse.modules || [];
    const nextModules = currentModules.map((m) => {
      if (m.id === moduleId) {
        let assignedName = m.assignedDosenName;
        let assignedNip = m.assignedDosenNip;
        let dosenId = moduleData.assignedDosenId !== undefined ? moduleData.assignedDosenId : m.assignedDosenId;

        if (dosenId) {
          const foundUser = users.find((u) => u.id === dosenId || u.nim_nip === dosenId);
          if (foundUser) {
            assignedName = foundUser.name;
            assignedNip = foundUser.nim_nip;
          }
        }
        return {
          ...m,
          ...moduleData,
          assignedDosenId: dosenId,
          assignedDosenName: assignedName,
          assignedDosenNip: assignedNip,
        };
      }
      return m;
    });

    setCourses((prev) => {
      const next = prev.map((c) =>
        c.id === targetCourse.id || c.code === targetCourse.code
          ? { ...c, modules: nextModules }
          : c
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    return await syncModulesToServer(targetCourse.id, nextModules);
  };

  // Delete Module (Dosen / Admin)
  const deleteCourseModule = async (
    courseId: string,
    moduleId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (courseId || "").trim();
    const targetCourse = courses.find((c) =>
      c.id === cleanId ||
      c.code?.trim().toUpperCase() === cleanId.toUpperCase()
    );
    if (!targetCourse) return { success: false, error: "Matakuliah tidak ditemukan." };

    const currentModules = targetCourse.modules || [];
    const nextModules = currentModules.filter((m) => m.id !== moduleId);

    setCourses((prev) => {
      const next = prev.map((c) =>
        c.id === targetCourse.id || c.code === targetCourse.code
          ? { ...c, modules: nextModules }
          : c
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    return await syncModulesToServer(targetCourse.id, nextModules);
  };

  // Add Item to Module (Dosen / Admin)
  const addModuleItem = async (
    courseId: string,
    moduleId: string,
    itemData: any
  ): Promise<{ success: boolean; error?: string; item?: any }> => {
    const cleanId = (courseId || "").trim();
    const targetCourse = courses.find((c) =>
      c.id === cleanId ||
      c.code?.trim().toUpperCase() === cleanId.toUpperCase()
    );
    if (!targetCourse) return { success: false, error: "Matakuliah tidak ditemukan." };

    const currentModules = targetCourse.modules || [];
    const newItem = {
      id: `item-${Date.now()}`,
      moduleId,
      ...itemData,
      orderIndex: (currentModules.find((m) => m.id === moduleId)?.items || []).length + 1,
    };

    const nextModules = currentModules.map((m) => {
      if (m.id === moduleId) {
        return { ...m, items: [...(m.items || []), newItem] };
      }
      return m;
    });

    setCourses((prev) => {
      const next = prev.map((c) =>
        c.id === targetCourse.id || c.code === targetCourse.code
          ? { ...c, modules: nextModules }
          : c
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    const syncRes = await syncModulesToServer(targetCourse.id, nextModules);
    return { ...syncRes, item: newItem };
  };

  // Update Item in Module (Dosen / Admin)
  const updateModuleItem = async (
    courseId: string,
    moduleId: string,
    itemId: string,
    itemData: any
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (courseId || "").trim();
    const targetCourse = courses.find((c) =>
      c.id === cleanId ||
      c.code?.trim().toUpperCase() === cleanId.toUpperCase()
    );
    if (!targetCourse) return { success: false, error: "Matakuliah tidak ditemukan." };

    const currentModules = targetCourse.modules || [];
    const nextModules = currentModules.map((m) => {
      if (m.id === moduleId) {
        const updatedItems = (m.items || []).map((item) =>
          item.id === itemId ? { ...item, ...itemData } : item
        );
        return { ...m, items: updatedItems };
      }
      return m;
    });

    setCourses((prev) => {
      const next = prev.map((c) =>
        c.id === targetCourse.id || c.code === targetCourse.code
          ? { ...c, modules: nextModules }
          : c
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    return await syncModulesToServer(targetCourse.id, nextModules);
  };

  // Delete Item from Module (Dosen / Admin)
  const deleteModuleItem = async (
    courseId: string,
    moduleId: string,
    itemId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (courseId || "").trim();
    const targetCourse = courses.find((c) =>
      c.id === cleanId ||
      c.code?.trim().toUpperCase() === cleanId.toUpperCase()
    );
    if (!targetCourse) return { success: false, error: "Matakuliah tidak ditemukan." };

    const currentModules = targetCourse.modules || [];
    const nextModules = currentModules.map((m) => {
      if (m.id === moduleId) {
        return { ...m, items: (m.items || []).filter((item) => item.id !== itemId) };
      }
      return m;
    });

    setCourses((prev) => {
      const next = prev.map((c) =>
        c.id === targetCourse.id || c.code === targetCourse.code
          ? { ...c, modules: nextModules }
          : c
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    return await syncModulesToServer(targetCourse.id, nextModules);
  };

  // Toggle Module Publish Status (Dosen / Admin)
  const toggleModulePublish = async (
    courseId: string,
    moduleId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = (courseId || "").trim();
    const targetCourse = courses.find((c) =>
      c.id === cleanId ||
      c.code?.trim().toUpperCase() === cleanId.toUpperCase()
    );
    if (!targetCourse) return { success: false, error: "Matakuliah tidak ditemukan." };

    const currentModules = targetCourse.modules || [];
    const nextModules = currentModules.map((m) =>
      m.id === moduleId ? { ...m, isPublished: !m.isPublished } : m
    );

    setCourses((prev) => {
      const next = prev.map((c) =>
        c.id === targetCourse.id || c.code === targetCourse.code
          ? { ...c, modules: nextModules }
          : c
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_courses", JSON.stringify(next));
      }
      return next;
    });

    return await syncModulesToServer(targetCourse.id, nextModules);
  };

  // Save Quiz Attempt
  const saveQuizAttempt = (attempt: QuizAttempt) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === attempt.quizId) {
          return { ...q, userAttempt: attempt };
        }
        return q;
      })
    );

    // Audit log
    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "COMPLETE_QUIZ",
      category: "EXAM",
      ipAddress: "127.0.0.1",
      status: attempt.violationCount > 0 ? "WARNING" : "SUCCESS",
      details: `Menyelesaikan kuis dengan skor ${attempt.score}/100. Pelanggaran tab: ${attempt.violationCount}`,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Attendance Check-in
  const checkInAttendance = (
    sessionId: string,
    passcode: string,
    mode: "PRESENT_ONLINE" | "PRESENT_OFFLINE"
  ): { success: boolean; message: string } => {
    const session = attendanceSessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, message: "Sesi presensi tidak ditemukan." };
    if (!session.isOpen) return { success: false, message: "Sesi presensi sudah ditutup." };
    if (session.passcode.trim().toUpperCase() !== passcode.trim().toUpperCase()) {
      return { success: false, message: "Kode PIN presensi salah. Periksa kembali!" };
    }

    const alreadyChecked = session.records.some((r) => r.studentId === currentUser.id);
    if (alreadyChecked) {
      return { success: false, message: "Anda sudah melakukan presensi pada sesi ini." };
    }

    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}`,
      attendanceSessionId: sessionId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentNim: currentUser.nim_nip,
      studentAvatar: currentUser.avatar,
      status: mode,
      checkInTime: new Date().toISOString(),
      notes: mode === "PRESENT_ONLINE" ? "Presensi daring (Web App)" : "Presensi luring di kelas",
    };

    setAttendanceSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, records: [newRecord, ...s.records] } : s))
    );

    return { success: true, message: "Presensi berhasil dicatat! Kehadiran Anda terverifikasi." };
  };

  // Create Attendance Session (Lecturer)
  const createAttendanceSession = (
    courseId: string,
    topic: string,
    weekNumber: number,
    durationMinutes: number
  ): AttendanceSession => {
    const course = courses.find((c) => c.id === courseId);
    const pin = `UCIC-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString();

    const newSession: AttendanceSession = {
      id: `att-${Date.now()}`,
      courseId,
      courseName: course?.name || "Matakuliah",
      sessionDate: new Date().toISOString(),
      weekNumber,
      topic,
      passcode: pin,
      qrCodeToken: `QR_${Date.now()}_${pin}`,
      isOpen: true,
      expiresAt,
      deliveryMode: course?.deliveryMode || "HYBRID",
      records: [],
    };

    setAttendanceSessions((prev) => [newSession, ...prev]);
    return newSession;
  };

  // User Management
  const addUser = async (userData: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> => {
    const role = userData.role || "STUDENT";
    const defaultPwd = userData.defaultPassword || "ucic1234";
    const newUser: User = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name || "Pengguna Baru",
      email: (userData.email || "user@cic.ac.id").toLowerCase(),
      nim_nip: userData.nim_nip || `${Math.floor(1000000 + Math.random() * 9000000)}`,
      role: role,
      avatar:
        userData.avatar ||
        (role === "DOSEN"
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"),
      faculty: userData.faculty || "Fakultas Teknologi Informasi",
      studyProgram: userData.studyProgram || "Teknik Informatika",
      phone: userData.phone || "0812-0000-0000",
      status: "ACTIVE",
      defaultPassword: defaultPwd,
      password: userData.password || defaultPwd,
      permissions: ROLE_PERMISSIONS[role]?.permissions || [],
    };

    setUsers((prev) => {
      const next = [newUser, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_users", JSON.stringify(next));
      }
      return next;
    });

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUser,
          actorId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setUsers((prev) => {
          const next = prev.filter((u) => u.id !== newUser.id);
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_ucic_users", JSON.stringify(next));
          }
          return next;
        });
        return { success: false, error: errJson.error || `Gagal membuat pengguna (${res.status})` };
      }

      const savedUser = await res.json();
      if (savedUser && savedUser.id) {
        setUsers((prev) => {
          const next = prev.map((u) => (u.id === newUser.id ? { ...u, ...savedUser } : u));
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_ucic_users", JSON.stringify(next));
          }
          return next;
        });
      }

      return { success: true, user: savedUser || newUser };
    } catch (err: any) {
      console.error("Gagal sync user ke server:", err);
      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== newUser.id);
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_ucic_users", JSON.stringify(next));
        }
        return next;
      });
      return { success: false, error: err?.message || "Koneksi ke server gagal saat menambahkan pengguna." };
    }
  };

  const updateUser = async (id: string, updatedData: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> => {
    const existing = users.find((u) => u.id === id || u.nim_nip === id);
    setUsers((prev) => {
      const next = prev.map((u) => (u.id === id || u.nim_nip === id ? { ...u, ...updatedData } : u));
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_users", JSON.stringify(next));
      }
      return next;
    });
    if (currentUser.id === id || currentUser.nim_nip === id) {
      setCurrentUser((prev) => ({ ...prev, ...updatedData }));
    }

    try {
      const lookupKey = existing?.id || id;
      const res = await fetch(`/api/users/${lookupKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedData,
          actorId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        if (existing) {
          setUsers((prev) => prev.map((u) => (u.id === id || u.nim_nip === id ? existing : u)));
        }
        return { success: false, error: errJson.error || `Gagal update user (${res.status})` };
      }

      const savedUser = await res.json();
      if (savedUser && savedUser.id) {
        setUsers((prev) => {
          const next = prev.map((u) => (u.id === id || u.id === savedUser.id || u.nim_nip === savedUser.nim_nip ? { ...u, ...savedUser } : u));
          if (typeof window !== "undefined") {
            localStorage.setItem("lms_ucic_users", JSON.stringify(next));
          }
          return next;
        });
        if (currentUser.id === id || currentUser.id === savedUser.id) {
          setCurrentUser((prev) => ({ ...prev, ...savedUser }));
        }
      }

      return { success: true, user: savedUser };
    } catch (err: any) {
      console.error("Gagal update user ke server:", err);
      if (existing) {
        setUsers((prev) => prev.map((u) => (u.id === id || u.nim_nip === id ? existing : u)));
      }
      return { success: false, error: err?.message || "Koneksi ke server gagal saat memperbarui pengguna." };
    }
  };

  const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const existing = users.find((u) => u.id === id || u.nim_nip === id);
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id && u.nim_nip !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_users", JSON.stringify(next));
      }
      return next;
    });

    try {
      const lookupKey = existing?.id || id;
      const res = await fetch(`/api/users/${lookupKey}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: currentUser.id }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        if (existing) {
          setUsers((prev) => [existing, ...prev]);
        }
        return { success: false, error: errJson.error || `Gagal menghapus pengguna (${res.status})` };
      }

      return { success: true };
    } catch (err: any) {
      console.error("Gagal hapus user dari server:", err);
      if (existing) {
        setUsers((prev) => [existing, ...prev]);
      }
      return { success: false, error: err?.message || "Koneksi ke server gagal saat menghapus pengguna." };
    }
  };

  // Reset password user ke password default (Admin only)
  const resetPasswordToDefault = async (userId: string): Promise<{ success: boolean; message: string }> => {
    const target = users.find((u) => u.id === userId || u.nim_nip === userId);
    if (!target) return { success: false, message: "Pengguna tidak ditemukan." };
    const defaultPwd = target.defaultPassword || "ucic1234";

    setUsers((prev) => {
      const next = prev.map((u) => (u.id === userId || u.nim_nip === userId ? { ...u, password: defaultPwd } : u));
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_users", JSON.stringify(next));
      }
      return next;
    });

    try {
      const lookupKey = target.id;
      await fetch(`/api/users/${lookupKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: defaultPwd,
          defaultPassword: defaultPwd,
          actorId: currentUser.id,
        }),
      });
    } catch (e) {
      console.error("Gagal sync reset password ke DB:", e);
    }

    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "RESET_PASSWORD",
      category: "AUTH",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      details: `Admin mereset password ${target.name} (${target.nim_nip}) ke password default.`,
    };
    setAuditLogs((prev) => [log, ...prev]);
    return { success: true, message: `Password ${target.name} berhasil direset ke password default (${defaultPwd}).` };
  };

  // Ganti password sendiri (Dosen / Mahasiswa)
  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (currentUser.password && currentUser.password !== currentPassword) {
      return { success: false, message: "Password saat ini tidak sesuai. Periksa kembali!" };
    }
    if (newPassword.length < 6) {
      return { success: false, message: "Password baru minimal 6 karakter." };
    }
    const updated = { ...currentUser, password: newPassword };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setCurrentUser(updated);

    try {
      await fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: newPassword,
          actorId: currentUser.id,
        }),
      });
    } catch (e) {
      console.error("Gagal sync change password ke DB:", e);
    }

    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "CHANGE_PASSWORD",
      category: "AUTH",
      ipAddress: "127.0.0.1",
      status: "SUCCESS",
      details: `${currentUser.name} berhasil mengubah password akun.`,
    };
    setAuditLogs((prev) => [log, ...prev]);
    return { success: true, message: "Password berhasil diperbarui!" };
  };

  // Forum Actions
  const addForumPost = (courseId: string, title: string, content: string, tags: string[]) => {
    const course = courses.find((c) => c.id === courseId);
    const newTopic: ForumTopic = {
      id: `topic-${Date.now()}`,
      courseId,
      courseName: course?.name || "Diskusi Kuliah",
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      title,
      content,
      createdAt: new Date().toISOString(),
      repliesCount: 0,
      upvotes: 1,
      tags,
      replies: [],
    };
    setForumTopics((prev) => [newTopic, ...prev]);
  };

  const addForumReply = (topicId: string, content: string) => {
    const newReply = {
      id: `rep-${Date.now()}`,
      topicId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      isLecturerEndorsed: currentUser.role === "DOSEN",
    };

    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            repliesCount: t.repliesCount + 1,
            replies: [...t.replies, newReply],
          };
        }
        return t;
      })
    );
  };

  // ── FACULTY CRUD ──────────────────────────────────────────────────────────
  const addFaculty = (data: Partial<Faculty>) => {
    const newFaculty: Faculty = {
      id: `faculty-${Date.now()}`,
      name: data.name || "Fakultas Baru",
      code: data.code || "FB",
    };
    setFaculties((prev) => {
      const next = [newFaculty, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_faculties", JSON.stringify(next));
      }
      return next;
    });

    fetch("/api/faculties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFaculty),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((saved) => {
        if (saved && saved.id) {
          setFaculties((prev) => prev.map((f) => (f.id === newFaculty.id ? { ...f, ...saved } : f)));
        }
      })
      .catch((err) => console.log("Gagal simpan fakultas:", err));
  };

  const updateFaculty = (id: string, data: Partial<Faculty>) => {
    setFaculties((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...data } : f));
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_faculties", JSON.stringify(next));
      }
      return next;
    });

    fetch(`/api/faculties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch((err) => console.log("Gagal update fakultas:", err));
  };

  const deleteFaculty = (id: string) => {
    setFaculties((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_faculties", JSON.stringify(next));
      }
      return next;
    });
    // Also delete study programs belonging to this faculty
    setStudyPrograms((prev) => prev.filter((sp) => sp.facultyId !== id));

    fetch(`/api/faculties/${id}`, { method: "DELETE" }).catch((err) =>
      console.log("Gagal hapus fakultas:", err)
    );
  };

  // ── STUDY PROGRAM CRUD ────────────────────────────────────────────────────
  const addStudyProgram = (data: Partial<StudyProgram>) => {
    const newSP: StudyProgram = {
      id: `prodi-${Date.now()}`,
      facultyId: data.facultyId || "",
      name: data.name || "Program Studi Baru",
      code: data.code || "PS",
      degree: data.degree || "S1",
    };
    setStudyPrograms((prev) => {
      const next = [newSP, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_studyPrograms", JSON.stringify(next));
      }
      return next;
    });

    fetch("/api/study-programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSP),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((saved) => {
        if (saved && saved.id) {
          setStudyPrograms((prev) => prev.map((p) => (p.id === newSP.id ? { ...p, ...saved } : p)));
        }
      })
      .catch((err) => console.log("Gagal simpan program studi:", err));
  };

  const updateStudyProgram = (id: string, data: Partial<StudyProgram>) => {
    setStudyPrograms((prev) => {
      const next = prev.map((sp) => (sp.id === id ? { ...sp, ...data } : sp));
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_studyPrograms", JSON.stringify(next));
      }
      return next;
    });

    fetch(`/api/study-programs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch((err) => console.log("Gagal update program studi:", err));
  };

  const deleteStudyProgram = (id: string) => {
    setStudyPrograms((prev) => {
      const next = prev.filter((sp) => sp.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_studyPrograms", JSON.stringify(next));
      }
      return next;
    });

    fetch(`/api/study-programs/${id}`, { method: "DELETE" }).catch((err) =>
      console.log("Gagal hapus program studi:", err)
    );
  };

  // ── MASTER COURSE CRUD ────────────────────────────────────────────────────
  const addMasterCourse = (data: Partial<MasterCourse>) => {
    const newMK: MasterCourse = {
      id: `mk-${Date.now()}`,
      code: data.code || "MK0000",
      name: data.name || "Matakuliah Baru",
      credits: data.credits || 3,
      description: data.description || "",
    };
    setMasterCourses((prev) => {
      const next = [newMK, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_masterCourses", JSON.stringify(next));
      }
      return next;
    });

    fetch("/api/master-courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMK),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((saved) => {
        if (saved && saved.id) {
          setMasterCourses((prev) => prev.map((m) => (m.id === newMK.id ? { ...m, ...saved } : m)));
        }
      })
      .catch((err) => console.log("Gagal simpan master matakuliah:", err));
  };

  const updateMasterCourse = (id: string, data: Partial<MasterCourse>) => {
    setMasterCourses((prev) => {
      const next = prev.map((mk) => (mk.id === id ? { ...mk, ...data } : mk));
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_masterCourses", JSON.stringify(next));
      }
      return next;
    });

    fetch(`/api/master-courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch((err) => console.log("Gagal update master matakuliah:", err));
  };

  const deleteMasterCourse = (id: string) => {
    setMasterCourses((prev) => {
      const next = prev.filter((mk) => mk.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("lms_ucic_masterCourses", JSON.stringify(next));
      }
      return next;
    });

    fetch(`/api/master-courses/${id}`, { method: "DELETE" }).catch((err) =>
      console.log("Gagal hapus master matakuliah:", err)
    );
  };

  // ── RESET DATA TO DEFAULT DEMO ──────────────────────────────────────────
  const resetAllDataToDefault = () => {
    if (typeof window !== "undefined") {
      const keysToRemove = [
        "lms_ucic_users",
        "lms_ucic_courses",
        "lms_ucic_activeCourseId",
        "lms_ucic_assignments",
        "lms_ucic_quizzes",
        "lms_ucic_attendance",
        "lms_ucic_grades",
        "lms_ucic_forum",
        "lms_ucic_auditLogs",
        "lms_ucic_notifications",
        "lms_ucic_faculties",
        "lms_ucic_studyPrograms",
        "lms_ucic_masterCourses",
        "lms_ucic_auth",
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
    setUsers(MOCK_USERS);
    setCurrentUser(MOCK_USERS[0]);
    setIsAuthenticated(false);
    setCourses([]);
    setActiveCourseId(null);
    setAssignments([]);
    setQuizzes([]);
    setAttendanceSessions([]);
    setGrades([]);
    setForumTopics([]);
    setAuditLogs(MOCK_AUDIT_LOGS);
    setNotifications([]);
    setFaculties(MOCK_FACULTIES);
    setStudyPrograms(MOCK_STUDY_PROGRAMS);
    setMasterCourses(MOCK_MASTER_COURSES);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated,
        login,
        logout,
        hasPermission,
        rolePermissions: ROLE_PERMISSIONS,
        switchUser,
        switchRole,
        courses,
        userCourses,
        activeCourseId,
        setActiveCourseId,
        assignments,
        userAssignments,
        quizzes,
        userQuizzes,
        attendanceSessions,
        userAttendanceSessions,
        grades,
        userGrades,
        forumTopics,
        userForumTopics,
        auditLogs,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        addCourse,
        updateCourse,
        deleteCourse,
        assignCourseLecturer,
        setCourseTeamTeaching,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        uploadAssignmentQuestionFile,
        submitAssignment,
        gradeSubmission,
        addCourseModule,
        updateCourseModule,
        deleteCourseModule,
        addModuleItem,
        updateModuleItem,
        deleteModuleItem,
        toggleModulePublish,
        saveQuizAttempt,
        checkInAttendance,
        createAttendanceSession,
        addUser,
        updateUser,
        deleteUser,
        resetPasswordToDefault,
        changePassword,
        addForumPost,
        addForumReply,
        faculties,
        studyPrograms,
        masterCourses,
        addFaculty,
        updateFaculty,
        deleteFaculty,
        addStudyProgram,
        updateStudyProgram,
        deleteStudyProgram,
        addMasterCourse,
        updateMasterCourse,
        deleteMasterCourse,
        isDarkMode,
        toggleTheme,
        resetAllDataToDefault,
        sessionTimeoutMinutes: 30,
        lastActivityTime,
        resetSessionTimer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
