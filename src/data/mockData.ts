import {
  User,
  Role,
  Permission,
  Course,
  Assignment,
  Quiz,
  AttendanceSession,
  GradeItem,
  ForumTopic,
  SystemAuditLog,
  StudentSemesterRecap,
  DosenSemesterReport,
  AdminSemesterAnalytics,
  Faculty,
  StudyProgram,
  MasterCourse,
} from "@/types";

export const ROLE_PERMISSIONS: Record<Role, { label: string; description: string; permissions: Permission[] }> = {
  ADMIN: {
    label: "Administrator Sistem",
    description: "Hak akses penuh untuk mengelola pengguna, struktur akademik, kelas, konfigurasi sistem, dan audit trail.",
    permissions: [
      "MANAGE_USERS",
      "MANAGE_FACULTIES",
      "MANAGE_ALL_COURSES",
      "VIEW_AUDIT_LOGS",
      "CONFIGURE_SYSTEM",
    ],
  },
  DOSEN: {
    label: "Dosen Pengampu",
    description: "Hak akses untuk mengelola matakuliah yang diampu, menyusun modul, bank soal kuis, koreksi tugas, presensi QR, dan rekap nilai.",
    permissions: [
      "MANAGE_OWN_COURSES",
      "CREATE_MODULES",
      "GRADE_ASSIGNMENTS",
      "CREATE_QUIZZES",
      "GENERATE_ATTENDANCE_QR",
      "EXPORT_GRADEBOOK",
      "ENDORSE_FORUM_POSTS",
    ],
  },
  STUDENT: {
    label: "Mahasiswa",
    description: "Hak akses untuk mengikuti perkuliahan, mengakses materi & video, mengumpulkan tugas, mengikuti kuis, presensi, dan melihat transkrip.",
    permissions: [
      "VIEW_ENROLLED_COURSES",
      "ACCESS_MODULE_MATERIALS",
      "SUBMIT_ASSIGNMENTS",
      "TAKE_QUIZZES",
      "CHECKIN_ATTENDANCE",
      "VIEW_OWN_TRANSCRIPT",
      "POST_FORUM_QUESTIONS",
    ],
  },
};

// ── MASTER DATA: FACULTIES ──────────────────────────────────────────────
export const MOCK_FACULTIES: Faculty[] = [
  { id: "faculty-1", name: "Fakultas Teknologi Informasi", code: "FTI" },
  { id: "faculty-2", name: "Fakultas Ekonomi & Bisnis", code: "FEB" },
  { id: "faculty-3", name: "Fakultas Keguruan & Ilmu Pendidikan", code: "FKIP" },
];

// ── MASTER DATA: STUDY PROGRAMS ─────────────────────────────────────────
export const MOCK_STUDY_PROGRAMS: StudyProgram[] = [
  { id: "prodi-1", facultyId: "faculty-1", name: "Teknik Informatika", code: "TI", degree: "S1" },
  { id: "prodi-2", facultyId: "faculty-1", name: "Sistem Informasi", code: "SI", degree: "S1" },
  { id: "prodi-3", facultyId: "faculty-1", name: "Teknologi Informasi", code: "TIF", degree: "D3" },
  { id: "prodi-4", facultyId: "faculty-2", name: "Manajemen", code: "MN", degree: "S1" },
  { id: "prodi-5", facultyId: "faculty-2", name: "Akuntansi", code: "AK", degree: "S1" },
  { id: "prodi-6", facultyId: "faculty-2", name: "Ekonomi Pembangunan", code: "EP", degree: "S1" },
  { id: "prodi-7", facultyId: "faculty-3", name: "Pendidikan Guru Sekolah Dasar", code: "PGSD", degree: "S1" },
  { id: "prodi-8", facultyId: "faculty-3", name: "Pendidikan Bahasa Inggris", code: "PBI", degree: "S1" },
];

// ── MASTER DATA: MASTER COURSES (KATALOG MATAKULIAH) ────────────────────
export const MOCK_MASTER_COURSES: MasterCourse[] = [
  { id: "mk-1", code: "IF3101", name: "Pemrograman Web & Mobile", credits: 4, description: "Mempelajari teknik pengembangan aplikasi berbasis web dan mobile menggunakan framework modern seperti React, Next.js, dan React Native." },
  { id: "mk-2", code: "IF3202", name: "Basis Data Lanjutan", credits: 3, description: "Teknik desain basis data relasional dan non-relasional, normalisasi, indexing, query optimization, dan manajemen transaksi." },
  { id: "mk-3", code: "IF3303", name: "Kecerdasan Buatan", credits: 3, description: "Konsep dasar AI, machine learning, neural network, NLP, dan penerapannya dalam pemecahan masalah kompleks." },
  { id: "mk-4", code: "IF3404", name: "Jaringan Komputer", credits: 3, description: "Arsitektur jaringan, protokol TCP/IP, routing, switching, keamanan jaringan, dan administrasi server." },
  { id: "mk-5", code: "IF3505", name: "Rekayasa Perangkat Lunak", credits: 4, description: "Metodologi pengembangan perangkat lunak (Agile, Scrum), UML, analisis kebutuhan, pengujian, dan manajemen proyek." },
  { id: "mk-6", code: "IF3606", name: "Keamanan Sistem Informasi", credits: 3, description: "Prinsip-prinsip keamanan informasi, kriptografi, ethical hacking, dan implementasi kebijakan keamanan." },
  { id: "mk-7", code: "MN2101", name: "Manajemen Keuangan", credits: 3, description: "Konsep dasar manajemen keuangan perusahaan, analisis laporan keuangan, dan pengambilan keputusan investasi." },
  { id: "mk-8", code: "AK2201", name: "Akuntansi Dasar", credits: 3, description: "Pengantar akuntansi, siklus akuntansi, jurnal, buku besar, neraca saldo, dan penyusunan laporan keuangan." },
];

// ── USERS: HANYA AKUN ADMINISTRATOR SISTEM ──────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: "user-admin-1",
    name: "Dr. Ir. H. Bambang Hartono, M.T.",
    email: "admin@cic.ac.id",
    nim_nip: "197508152000031001",
    password: "admin123",
    defaultPassword: "admin123",
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "0812-3456-7890",
    faculty: "Fakultas Teknologi Informasi",
    studyProgram: "Teknik Informatika",
    status: "ACTIVE",
    permissions: ROLE_PERMISSIONS.ADMIN.permissions,
  },
];

// ── DATA PERKULIAHAN KOSONG (UNTUK DIISI OLEH ADMIN/DOSEN) ──────────────
export const MOCK_COURSES: Course[] = [];
export const MOCK_ASSIGNMENTS: Assignment[] = [];
export const MOCK_QUIZZES: Quiz[] = [];
export const MOCK_ATTENDANCE_SESSIONS: AttendanceSession[] = [];
export const MOCK_STUDENT_GRADES: GradeItem[] = [];
export const MOCK_FORUM_TOPICS: ForumTopic[] = [];

// ── AUDIT LOGS AWAL ─────────────────────────────────────────────────────
export const MOCK_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: "log-init-1",
    timestamp: new Date().toISOString(),
    userId: "user-admin-1",
    userName: "Dr. Ir. H. Bambang Hartono, M.T.",
    userRole: "ADMIN",
    action: "SYSTEM_INIT",
    category: "SYSTEM",
    ipAddress: "127.0.0.1",
    status: "SUCCESS",
    details: "Database LMS UCIC berhasil diinisialisasi bersih. Siap untuk input data pengguna (Mahasiswa & Dosen) oleh Administrator.",
  },
];

// ── STRUKTUR LAPORAN SEMESTER (EMPTY STATE) ─────────────────────────────
export interface SemesterOption {
  id: string;
  name: string;
  academicYear: string;
  isCurrent: boolean;
}

export const MOCK_SEMESTERS: SemesterOption[] = [
  { id: "sem-2026-ganjil", name: "Semester Ganjil 2026/2027", academicYear: "2026/2027", isCurrent: true },
  { id: "sem-2025-genap", name: "Semester Genap 2025/2026", academicYear: "2025/2026", isCurrent: false },
];

export const MOCK_STUDENT_SEMESTER_RECAPS: Record<string, StudentSemesterRecap> = {
  "sem-2026-ganjil": {
    semesterId: "sem-2026-ganjil",
    academicYear: "2026/2027",
    semesterName: "Semester Ganjil 2026/2027",
    isCompleted: false,
    totalSKS: 0,
    gpa: 0,
    cumulativeGpa: 0,
    attendancePercentage: 0,
    assignmentsCompletedPercentage: 0,
    quizzesCompletedPercentage: 0,
    totalStudyHours: 0,
    courses: [],
  },
  "sem-2025-genap": {
    semesterId: "sem-2025-genap",
    academicYear: "2025/2026",
    semesterName: "Semester Genap 2025/2026",
    isCompleted: false,
    totalSKS: 0,
    gpa: 0,
    cumulativeGpa: 0,
    attendancePercentage: 0,
    assignmentsCompletedPercentage: 0,
    quizzesCompletedPercentage: 0,
    totalStudyHours: 0,
    courses: [],
  },
};

export const MOCK_DOSEN_SEMESTER_REPORTS: Record<string, DosenSemesterReport> = {
  "sem-2026-ganjil": {
    semesterId: "sem-2026-ganjil",
    academicYear: "2026/2027",
    semesterName: "Semester Ganjil 2026/2027",
    dosenId: "user-dosen-1",
    dosenName: "Dosen Pengampu",
    dosenNip: "-",
    totalClasses: 0,
    totalCreditsTaught: 0,
    totalStudentsTaught: 0,
    meetingFulfillmentRate: 0,
    gradingCompletionRate: 0,
    averageStudentScore: 0,
    studentSatisfactionIndex: 0,
    classBreakdowns: [],
  },
  "sem-2025-genap": {
    semesterId: "sem-2025-genap",
    academicYear: "2025/2026",
    semesterName: "Semester Genap 2025/2026",
    dosenId: "user-dosen-1",
    dosenName: "Dosen Pengampu",
    dosenNip: "-",
    totalClasses: 0,
    totalCreditsTaught: 0,
    totalStudentsTaught: 0,
    meetingFulfillmentRate: 0,
    gradingCompletionRate: 0,
    averageStudentScore: 0,
    studentSatisfactionIndex: 0,
    classBreakdowns: [],
  },
};

export const MOCK_ADMIN_SEMESTER_ANALYTICS: Record<string, AdminSemesterAnalytics> = {
  "sem-2026-ganjil": {
    semesterId: "sem-2026-ganjil",
    academicYear: "2026/2027",
    semesterName: "Semester Ganjil 2026/2027",
    totalEnrolledStudents: 0,
    totalActiveLecturers: 0,
    totalCoursesRunning: 0,
    totalClassesParallel: 0,
    campusAverageGPA: 0,
    overallAttendanceRate: 0,
    totalAssignmentsSubmitted: 0,
    totalQuizzesConducted: 0,
    antiCheatViolationIncidents: 0,
    facultyStats: [
      {
        facultyName: "Fakultas Teknologi Informasi",
        totalStudents: 0,
        averageGPA: 0,
        passRate: 0,
        attendanceRate: 0,
      },
      {
        facultyName: "Fakultas Ekonomi & Bisnis",
        totalStudents: 0,
        averageGPA: 0,
        passRate: 0,
        attendanceRate: 0,
      },
      {
        facultyName: "Fakultas Keguruan & Ilmu Pendidikan",
        totalStudents: 0,
        averageGPA: 0,
        passRate: 0,
        attendanceRate: 0,
      },
    ],
    monthlyActivityTimeline: [],
  },
  "sem-2025-genap": {
    semesterId: "sem-2025-genap",
    academicYear: "2025/2026",
    semesterName: "Semester Genap 2025/2026",
    totalEnrolledStudents: 0,
    totalActiveLecturers: 0,
    totalCoursesRunning: 0,
    totalClassesParallel: 0,
    campusAverageGPA: 0,
    overallAttendanceRate: 0,
    totalAssignmentsSubmitted: 0,
    totalQuizzesConducted: 0,
    antiCheatViolationIncidents: 0,
    facultyStats: [
      {
        facultyName: "Fakultas Teknologi Informasi",
        totalStudents: 0,
        averageGPA: 0,
        passRate: 0,
        attendanceRate: 0,
      },
      {
        facultyName: "Fakultas Ekonomi & Bisnis",
        totalStudents: 0,
        averageGPA: 0,
        passRate: 0,
        attendanceRate: 0,
      },
      {
        facultyName: "Fakultas Keguruan & Ilmu Pendidikan",
        totalStudents: 0,
        averageGPA: 0,
        passRate: 0,
        attendanceRate: 0,
      },
    ],
    monthlyActivityTimeline: [],
  },
};
