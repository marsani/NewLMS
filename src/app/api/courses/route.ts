import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/courses — list kursus
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    let courses;

    if (role === "DOSEN" && userId) {
      // Dosen: courses where they are instructor or in team teaching
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ id: userId }, { nim_nip: userId }],
        },
        select: { id: true, nim_nip: true, name: true },
      });

      const orConditions: any[] = [{ instructorId: userId }];
      if (user?.id) {
        orConditions.push({ instructorId: user.id });
        orConditions.push({ teamTeaching: { some: { dosenId: user.id } } });
      }
      if (user?.nim_nip) {
        orConditions.push({ instructorNip: user.nim_nip });
        orConditions.push({ teamTeaching: { some: { dosenNip: user.nim_nip } } });
      }
      if (user?.name) {
        orConditions.push({ instructorName: user.name });
      }

      courses = await prisma.course.findMany({
        where: { OR: orConditions },
        include: {
          teamTeaching: true,
          modules: {
            include: { items: { orderBy: { orderIndex: "asc" } } },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });
    } else {
      // ADMIN or ALL: list all courses
      courses = await prisma.course.findMany({
        include: {
          teamTeaching: true,
          modules: {
            include: { items: { orderBy: { orderIndex: "asc" } } },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { code: "asc" },
      });
    }

    // Parse JSON fields in teamTeaching
    const parsed = courses.map((c) => ({
      ...c,
      teamTeaching: c.teamTeaching.map((tt) => {
        let meetings: number[] = [];
        try {
          meetings = JSON.parse(tt.assignedMeetings || "[]");
        } catch (e) {
          meetings = [];
        }
        return {
          ...tt,
          assignedMeetings: meetings,
        };
      }),
    }));

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Error GET /api/courses:", e);
    return NextResponse.json({ error: "Gagal mengambil data kursus." }, { status: 500 });
  }
}

// POST /api/courses — buat kursus baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      actorId,
      teamTeaching: teamData,
      modules: modulesData,
      assignments: _assignments,
      quizzes: _quizzes,
      attendanceSessions: _attendanceSessions,
      forumTopics: _forumTopics,
      grades: _grades,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      id: customId,
      ...rawCourseData
    } = body;

    // Check duplicate code
    if (rawCourseData.code) {
      const existing = await prisma.course.findUnique({ where: { code: rawCourseData.code } });
      if (existing) {
        return NextResponse.json({ error: `Kode matakuliah "${rawCourseData.code}" sudah terdaftar.` }, { status: 409 });
      }
    }

    // Resolve instructor user if available
    let resolvedInstructorId = rawCourseData.instructorId;
    if (resolvedInstructorId) {
      const instructorUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: resolvedInstructorId },
            ...(rawCourseData.instructorNip ? [{ nim_nip: rawCourseData.instructorNip }] : []),
            ...(rawCourseData.instructorName ? [{ name: rawCourseData.instructorName }] : []),
          ],
        },
      });
      if (instructorUser) {
        resolvedInstructorId = instructorUser.id;
        rawCourseData.instructorName = instructorUser.name;
        rawCourseData.instructorNip = instructorUser.nim_nip;
        if (instructorUser.avatar) rawCourseData.instructorAvatar = instructorUser.avatar;
      }
    }

    // Build safe scalar fields for Course model
    const safeData: any = {
      code: rawCourseData.code || `MK-${Date.now()}`,
      name: rawCourseData.name || "Matakuliah Baru",
      description: rawCourseData.description || "",
      credits: Number(rawCourseData.credits) || 3,
      coverImage: rawCourseData.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      faculty: rawCourseData.faculty || "Fakultas Teknologi Informasi",
      studyProgram: rawCourseData.studyProgram || "Teknik Informatika",
      academicYear: rawCourseData.academicYear || "2026/2027",
      semester: rawCourseData.semester || "Ganjil (Semester 5)",
      instructorId: resolvedInstructorId || null,
      instructorName: rawCourseData.instructorName || "Dosen Pengampu",
      instructorAvatar: rawCourseData.instructorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      instructorNip: rawCourseData.instructorNip || "-",
      deliveryMode: rawCourseData.deliveryMode || "HYBRID",
      room: rawCourseData.room || "Lab Rekayasa Perangkat Lunak",
      scheduleDay: rawCourseData.scheduleDay || "Senin",
      scheduleTime: rawCourseData.scheduleTime || "08:00 - 10:30 WIB",
      meetingLink: rawCourseData.meetingLink || "https://meet.google.com/abc-defg-hij",
      progressPercent: Number(rawCourseData.progressPercent) || 0,
      totalStudents: Number(rawCourseData.totalStudents) || 35,
    };

    if (customId && !customId.startsWith("course-")) {
      safeData.id = customId;
    }

    const course = await prisma.course.create({
      data: safeData,
      include: { teamTeaching: true, modules: { include: { items: true } } },
    });

    // Handle team teaching members safely
    if (teamData && Array.isArray(teamData)) {
      const processedDosenIds = new Set<string>();

      for (const tt of teamData) {
        // Resolve valid Dosen User in DB
        let validUser = null;
        if (tt.dosenId) {
          validUser = await prisma.user.findUnique({ where: { id: tt.dosenId } });
        }
        if (!validUser && tt.dosenNip && tt.dosenNip !== "-") {
          validUser = await prisma.user.findUnique({ where: { nim_nip: tt.dosenNip } });
        }
        if (!validUser && tt.dosenEmail) {
          validUser = await prisma.user.findUnique({ where: { email: tt.dosenEmail } });
        }
        if (!validUser && tt.dosenName) {
          validUser = await prisma.user.findFirst({
            where: {
              name: { equals: tt.dosenName.trim() },
              role: "DOSEN",
            },
          });
        }
        if (!validUser && tt.dosenName) {
          validUser = await prisma.user.findFirst({
            where: {
              name: { contains: tt.dosenName.trim() },
              role: "DOSEN",
            },
          });
        }

        // If Dosen user does not exist in DB yet, create user record automatically
        if (!validUser && tt.dosenName) {
          const cleanEmailName = tt.dosenName.toLowerCase().replace(/[^a-z0-9]/g, "") || "dosen";
          const uniqueEmail = `${cleanEmailName}.${Math.floor(1000 + Math.random() * 9000)}@cic.ac.id`;
          const fallbackNip = tt.dosenNip && tt.dosenNip !== "-" ? tt.dosenNip : `${Math.floor(10000000 + Math.random() * 90000000)}`;

          try {
            validUser = await prisma.user.create({
              data: {
                name: tt.dosenName,
                email: uniqueEmail,
                nim_nip: fallbackNip,
                role: "DOSEN",
                password: "dosen123",
                defaultPassword: "dosen123",
                avatar: tt.dosenAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                faculty: course.faculty || "Fakultas Teknologi Informasi",
                studyProgram: course.studyProgram || "Teknik Informatika",
                status: "ACTIVE",
              },
            });
          } catch (createErr) {
            console.error("Gagal auto-create dosen untuk course baru:", createErr);
          }
        }

        if (validUser && !processedDosenIds.has(validUser.id)) {
          processedDosenIds.add(validUser.id);

          const meetingsStr = Array.isArray(tt.assignedMeetings)
            ? JSON.stringify(tt.assignedMeetings)
            : tt.assignedMeetings || "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]";

          await prisma.teamTeachingMember.upsert({
            where: { courseId_dosenId: { courseId: course.id, dosenId: validUser.id } },
            update: {
              dosenName: validUser.name || tt.dosenName,
              dosenNip: validUser.nim_nip || tt.dosenNip,
              dosenAvatar: validUser.avatar || tt.dosenAvatar,
              role: tt.role || (processedDosenIds.size === 1 ? "KOORDINATOR" : "ANGGOTA"),
              assignedMeetings: meetingsStr,
            },
            create: {
              courseId: course.id,
              dosenId: validUser.id,
              dosenName: validUser.name || tt.dosenName,
              dosenNip: validUser.nim_nip || tt.dosenNip,
              dosenAvatar: validUser.avatar || tt.dosenAvatar,
              role: tt.role || (processedDosenIds.size === 1 ? "KOORDINATOR" : "ANGGOTA"),
              assignedMeetings: meetingsStr,
            },
          });
        }
      }
    }

    // Handle initial modules if provided
    if (modulesData && Array.isArray(modulesData)) {
      for (let mIdx = 0; mIdx < modulesData.length; mIdx++) {
        const mod = modulesData[mIdx];
        const safeWeek = !isNaN(Number(mod.weekNumber)) && Number(mod.weekNumber) > 0 ? Number(mod.weekNumber) : (mIdx + 1);
        const safeModOrder = !isNaN(Number(mod.orderIndex)) ? Number(mod.orderIndex) : mIdx;

        const newMod = await prisma.module.create({
          data: {
            course: { connect: { id: course.id } },
            title: mod.title || `Modul Pekan ${safeWeek}`,
            description: mod.description || null,
            weekNumber: safeWeek,
            orderIndex: safeModOrder,
            isPublished: mod.isPublished !== undefined ? Boolean(mod.isPublished) : true,
            unlockDate: mod.unlockDate || null,
            assignedDosenId: mod.assignedDosenId || null,
            assignedDosenName: mod.assignedDosenName || null,
            assignedDosenNip: mod.assignedDosenNip || null,
          },
        });

        if (mod.items && Array.isArray(mod.items)) {
          for (let iIdx = 0; iIdx < mod.items.length; iIdx++) {
            const item = mod.items[iIdx];
            const safeItemOrder = !isNaN(Number(item.orderIndex)) ? Number(item.orderIndex) : iIdx;
            const safeDuration = item.durationMinutes && !isNaN(Number(item.durationMinutes)) ? Number(item.durationMinutes) : null;

            await prisma.moduleItem.create({
              data: {
                module: { connect: { id: newMod.id } },
                title: item.title || "Materi Pembelajaran",
                type: item.type || "DOCUMENT",
                description: item.description || null,
                contentUrl: item.contentUrl || null,
                textContent: item.textContent || null,
                durationMinutes: safeDuration,
                isMandatory: Boolean(item.isMandatory ?? false),
                isCompleted: Boolean(item.isCompleted ?? false),
                orderIndex: safeItemOrder,
                assignmentId: item.assignmentId || null,
                quizId: item.quizId || null,
              },
            });
          }
        }
      }
    }

    if (actorId) {
      const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { name: true, role: true } });
      await prisma.systemAuditLog.create({
        data: {
          userId: actorId,
          userName: actor?.name || "Admin",
          userRole: actor?.role || "ADMIN",
          action: "COURSE_CREATE",
          category: "COURSE",
          status: "SUCCESS",
          details: `Matakuliah baru "${course.name}" (${course.code}) berhasil dibuat.`,
        },
      }).catch(() => {});
    }

    // Re-fetch with full relations
    const finalCourse = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        teamTeaching: true,
        modules: {
          include: { items: { orderBy: { orderIndex: "asc" } } },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    const parsed = {
      ...finalCourse,
      teamTeaching: (finalCourse?.teamTeaching || []).map((tt) => {
        let meetings: number[] = [];
        try {
          meetings = JSON.parse(tt.assignedMeetings || "[]");
        } catch (e) {
          meetings = [];
        }
        return { ...tt, assignedMeetings: meetings };
      }),
    };

    return NextResponse.json(parsed, { status: 201 });
  } catch (e: any) {
    console.error("Error POST /api/courses:", e);
    return NextResponse.json({ error: e?.message || "Gagal membuat kursus." }, { status: 500 });
  }
}
