/**
 * LMS UCIC - Database Seed Script
 * Mengosongkan seluruh data dan hanya menyisakan akun Administrator Utama.
 * Jalankan dengan: npx prisma db seed (atau npm run seed)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Mengosongkan data database LMS UCIC...");

  // Hapus data relasional
  await prisma.assignmentSubmission.deleteMany({}).catch(() => {});
  await prisma.quizAttempt.deleteMany({}).catch(() => {});
  await prisma.attendanceRecord.deleteMany({}).catch(() => {});
  await prisma.forumReply.deleteMany({}).catch(() => {});
  await prisma.forumTopic.deleteMany({}).catch(() => {});
  await prisma.moduleItem.deleteMany({}).catch(() => {});
  await prisma.module.deleteMany({}).catch(() => {});
  await prisma.teamTeachingMember.deleteMany({}).catch(() => {});
  await prisma.assignment.deleteMany({}).catch(() => {});
  await prisma.quiz.deleteMany({}).catch(() => {});
  await prisma.attendanceSession.deleteMany({}).catch(() => {});
  await prisma.gradeItem.deleteMany({}).catch(() => {});
  await prisma.course.deleteMany({}).catch(() => {});
  await prisma.systemAuditLog.deleteMany({}).catch(() => {});
  await prisma.user.deleteMany({}).catch(() => {});

  console.log("🌱 Membuat akun Administrator Sistem...");

  // Buat hanya 1 akun: Admin Sistem
  const admin = await prisma.user.upsert({
    where: { email: "admin@cic.ac.id" },
    update: {},
    create: {
      id: "user-admin-1",
      email: "admin@cic.ac.id",
      nim_nip: "197508152000031001",
      name: "Dr. Ir. H. Bambang Hartono, M.T.",
      password: "admin123",
      defaultPassword: "admin123",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      phone: "0812-3456-7890",
      faculty: "Fakultas Teknologi Informasi",
      studyProgram: "Teknik Informatika",
      status: "ACTIVE",
    },
  });

  // Buat log audit sistem awal
  await prisma.systemAuditLog.create({
    data: {
      userId: admin.id,
      userName: admin.name,
      userRole: "ADMIN",
      action: "DATABASE_CLEARED",
      category: "SYSTEM",
      status: "SUCCESS",
      details: "Database LMS UCIC berhasil dikosongkan. Siap untuk input data pengguna (Mahasiswa & Dosen) oleh Administrator.",
    },
  });

  console.log("\n🎉 Database LMS UCIC telah dikosongkan dan siap digunakan!");
  console.log(`👤 Admin: ${admin.name}`);
  console.log(`📧 Email: ${admin.email}`);
  console.log(`🔑 Password: admin123\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
