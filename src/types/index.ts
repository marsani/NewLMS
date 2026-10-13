export type Role = "ADMIN" | "DOSEN" | "STUDENT";

export type Permission =
  // Admin Permissions
  | "MANAGE_USERS"
  | "MANAGE_FACULTIES"
  | "MANAGE_ALL_COURSES"
  | "VIEW_AUDIT_LOGS"
  | "CONFIGURE_SYSTEM"
  // Dosen Permissions
  | "MANAGE_OWN_COURSES"
  | "CREATE_MODULES"
  | "GRADE_ASSIGNMENTS"
  | "CREATE_QUIZZES"
  | "GENERATE_ATTENDANCE_QR"
  | "EXPORT_GRADEBOOK"
  | "ENDORSE_FORUM_POSTS"
  // Student Permissions
  | "VIEW_ENROLLED_COURSES"
  | "ACCESS_MODULE_MATERIALS"
  | "SUBMIT_ASSIGNMENTS"
  | "TAKE_QUIZZES"
  | "CHECKIN_ATTENDANCE"
  | "VIEW_OWN_TRANSCRIPT"
  | "POST_FORUM_QUESTIONS";

export type DeliveryMode = "ONLINE" | "OFFLINE" | "HYBRID";

export type ModuleItemType = "DOCUMENT" | "VIDEO_HLS" | "HYBRID_SESSION" | "ASSIGNMENT" | "QUIZ";

export type SubmissionStatus = "SUBMITTED" | "LATE" | "GRADED" | "RESUBMITTED";

export type AttendanceStatus = "PRESENT_ONLINE" | "PRESENT_OFFLINE" | "SICK" | "PERMISSION" | "ABSENT";

export type QuestionType = "MULTIPLE_CHOICE" | "ESSAY" | "SHORT_ANSWER";

export interface User {
  id: string;
  name: string;
  email: string;
  nim_nip: string;
  password?: string;
  defaultPassword?: string; // Password default yang ditetapkan admin saat buat akun
  role: Role;
  avatar: string;
  phone?: string;
  faculty?: string;
  studyProgram?: string;
  status: "ACTIVE" | "INACTIVE";
  permissions?: Permission[];
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
}

export interface StudyProgram {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  degree: "S1" | "S2" | "S3" | "D3" | "D4";
}

export interface MasterCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string;
}

export interface TeamTeachingMember {
  dosenId: string;
  dosenName: string;
  dosenNip: string;
  dosenAvatar: string;
  role: "KOORDINATOR" | "ANGGOTA";
  assignedMeetings: number[]; // e.g. [1, 2, 3, 4, 5, 6, 7, 8]
}

export const normalizeAssignedMeetings = (val: any): number[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((v) => Number(v)).filter((n) => !isNaN(n) && n > 0);
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => Number(v)).filter((n) => !isNaN(n) && n > 0);
      }
    } catch {
      return val
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);
    }
  }
  return [];
};

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number; // SKS
  coverImage: string;
  faculty: string;
  studyProgram: string;
  academicYear: string;
  semester: string;
  instructorId?: string;
  instructorName: string;
  instructorAvatar: string;
  instructorNip: string;
  deliveryMode: DeliveryMode;
  room: string;
  scheduleDay: string;
  scheduleTime: string;
  meetingLink?: string;
  progressPercent?: number; // for student
  totalStudents?: number; // for lecturer
  teamTeaching?: TeamTeachingMember[];
  modules: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  weekNumber: number;
  orderIndex: number;
  isPublished: boolean;
  unlockDate?: string;
  assignedDosenId?: string;
  assignedDosenName?: string;
  assignedDosenNip?: string;
  items: ModuleItem[];
}

export interface ModuleItem {
  id: string;
  moduleId: string;
  title: string;
  type: ModuleItemType;
  description?: string;
  contentUrl?: string; // PDF link, Video stream link, Zoom URL
  textContent?: string;
  durationMinutes?: number;
  isMandatory?: boolean;
  isCompleted?: boolean;
  orderIndex: number;
  assignmentId?: string;
  quizId?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  instructions: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  attachmentFileSize?: string;
  maxScore: number;
  deadline: string;
  allowLate: boolean;
  rubric?: { criteria: string; weightPercent: number; maxPoints: number }[];
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  studentAvatar: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  submissionNotes?: string;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  options?: QuestionOption[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number;
  isTabLockEnabled: boolean;
  deadline?: string;
  questions: Question[];
  totalQuestions: number;
  maxPoints: number;
  userAttempt?: QuizAttempt;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  startedAt: string;
  finishedAt?: string;
  score?: number;
  isCompleted: boolean;
  violationCount: number;
  answers: Record<string, string>; // questionId -> answer
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseName: string;
  sessionDate: string;
  weekNumber: number;
  topic: string;
  passcode: string;
  qrCodeToken: string;
  isOpen: boolean;
  expiresAt: string;
  deliveryMode: DeliveryMode;
  records: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  attendanceSessionId: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  studentAvatar: string;
  status: AttendanceStatus;
  checkInTime: string;
  notes?: string;
}

export interface GradeItem {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  attendanceScore: number;
  assignmentScore: number;
  quizScore: number;
  midtermScore: number;
  finalScore: number;
  totalScore: number;
  letterGrade: "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D" | "E";
  gradePoint: number;
  status: "LULUS" | "TIDAK LULUS" | "SEDANG BERJALAN";
}

export interface ForumTopic {
  id: string;
  courseId: string;
  courseName: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorAvatar: string;
  title: string;
  content: string;
  createdAt: string;
  repliesCount: number;
  upvotes: number;
  tags: string[];
  isPinned?: boolean;
  replies: ForumReply[];
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorAvatar: string;
  content: string;
  createdAt: string;
  isLecturerEndorsed?: boolean;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  category: "AUTH" | "COURSE" | "SUBMISSION" | "EXAM" | "SYSTEM";
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "FAILED";
  details: string;
}

export interface StudentSemesterRecap {
  semesterId: string;
  academicYear: string;
  semesterName: string;
  isCompleted: boolean;
  totalSKS: number;
  gpa: number; // IPS
  cumulativeGpa: number; // IPK
  attendancePercentage: number;
  assignmentsCompletedPercentage: number;
  quizzesCompletedPercentage: number;
  totalStudyHours: number;
  courses: {
    code: string;
    name: string;
    credits: number;
    instructor: string;
    attendanceRate: number;
    assignmentScore: number;
    quizScore: number;
    finalScore: number;
    letterGrade: string;
    gradePoint: number;
    status: "LULUS" | "TIDAK LULUS";
  }[];
}

export interface DosenSemesterReport {
  semesterId: string;
  academicYear: string;
  semesterName: string;
  dosenId: string;
  dosenName: string;
  dosenNip: string;
  totalClasses: number;
  totalCreditsTaught: number;
  totalStudentsTaught: number;
  meetingFulfillmentRate: number; // e.g. 100% (16/16)
  gradingCompletionRate: number; // e.g. 100%
  averageStudentScore: number;
  studentSatisfactionIndex: number; // e.g. 4.85 / 5.00
  classBreakdowns: {
    courseCode: string;
    courseName: string;
    className: string;
    credits: number;
    totalEnrolled: number;
    passRate: number;
    averageScore: number;
    gradeDistribution: {
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
    };
  }[];
}

export interface AdminSemesterAnalytics {
  semesterId: string;
  academicYear: string;
  semesterName: string;
  totalEnrolledStudents: number;
  totalActiveLecturers: number;
  totalCoursesRunning: number;
  totalClassesParallel: number;
  campusAverageGPA: number;
  overallAttendanceRate: number;
  totalAssignmentsSubmitted: number;
  totalQuizzesConducted: number;
  antiCheatViolationIncidents: number;
  facultyStats: {
    facultyName: string;
    totalStudents: number;
    averageGPA: number;
    passRate: number;
    attendanceRate: number;
  }[];
  monthlyActivityTimeline: {
    month: string;
    loginCount: number;
    materialsViewed: number;
    submissionsCount: number;
    quizzesCount: number;
  }[];
}

