import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rawId = decodeURIComponent(params.id || "").trim();
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          ...(rawId ? [{ id: rawId }] : []),
          ...(rawId ? [{ code: rawId }] : []),
          ...(rawId ? [{ code: rawId.toUpperCase() }] : []),
          ...(rawId ? [{ code: rawId.toLowerCase() }] : []),
        ],
      },
      include: {
        teamTeaching: true,
        modules: {
          include: { items: { orderBy: { orderIndex: "asc" } } },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    const parsed = {
      ...course,
      teamTeaching: course.teamTeaching.map((tt) => {
        let meetings: number[] = [];
        try {
          meetings = JSON.parse(tt.assignedMeetings || "[]");
        } catch {
          meetings = [];
        }
        return { ...tt, assignedMeetings: meetings };
      }),
    };

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("Error GET /api/courses/[id]:", e);
    return NextResponse.json({ error: "Gagal mengambil data matakuliah." }, { status: 500 });
  }
}

// PUT /api/courses/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
      id: bodyId,
      courseId: bodyCourseId,
      ...rawCourseData
    } = body;

    const idOrCode = decodeURIComponent(params.id || "").trim();
    const fallbackCode = (body.code || rawCourseData.code || "").trim();
    const fallbackId = (bodyId || bodyCourseId || "").trim();

    // Check course exists by ID or by Code or by body fields (with case variants)
    let existingCourse = await prisma.course.findFirst({
      where: {
        OR: [
          ...(idOrCode ? [{ id: idOrCode }] : []),
          ...(idOrCode ? [{ code: idOrCode }] : []),
          ...(idOrCode ? [{ code: idOrCode.toUpperCase() }] : []),
          ...(idOrCode ? [{ code: idOrCode.toLowerCase() }] : []),
          ...(fallbackCode ? [{ code: fallbackCode }] : []),
          ...(fallbackCode ? [{ code: fallbackCode.toUpperCase() }] : []),
          ...(fallbackCode ? [{ code: fallbackCode.toLowerCase() }] : []),
          ...(fallbackId ? [{ id: fallbackId }] : []),
        ],
      },
    });

    if (!existingCourse) {
      // If course genuinely doesn't exist, create it so local client course is persisted
      if (rawCourseData.name || fallbackCode || idOrCode) {
        existingCourse = await prisma.course.create({
          data: {
            code: fallbackCode || idOrCode || `MK-${Date.now()}`,
            name: rawCourseData.name || body.name || "Matakuliah Baru",
            description: rawCourseData.description || "",
            credits: Number(rawCourseData.credits) || 3,
            coverImage: rawCourseData.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
            faculty: rawCourseData.faculty || "Fakultas Teknologi Informasi",
            studyProgram: rawCourseData.studyProgram || "Teknik Informatika",
            academicYear: rawCourseData.academicYear || "2026/2027",
            semester: rawCourseData.semester || "Ganjil (Semester 5)",
            instructorId: rawCourseData.instructorId || null,
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
          },
        });
      } else {
        return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
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
    const safeData: any = {};
    if (rawCourseData.code !== undefined) safeData.code = rawCourseData.code;
    if (rawCourseData.name !== undefined) safeData.name = rawCourseData.name;
    if (rawCourseData.description !== undefined) safeData.description = rawCourseData.description;
    if (rawCourseData.credits !== undefined) safeData.credits = Number(rawCourseData.credits);
    if (rawCourseData.coverImage !== undefined) safeData.coverImage = rawCourseData.coverImage;
    if (rawCourseData.faculty !== undefined) safeData.faculty = rawCourseData.faculty;
    if (rawCourseData.studyProgram !== undefined) safeData.studyProgram = rawCourseData.studyProgram;
    if (rawCourseData.academicYear !== undefined) safeData.academicYear = rawCourseData.academicYear;
    if (rawCourseData.semester !== undefined) safeData.semester = rawCourseData.semester;
    if (resolvedInstructorId !== undefined) safeData.instructorId = resolvedInstructorId;
    if (rawCourseData.instructorName !== undefined) safeData.instructorName = rawCourseData.instructorName;
    if (rawCourseData.instructorAvatar !== undefined) safeData.instructorAvatar = rawCourseData.instructorAvatar;
    if (rawCourseData.instructorNip !== undefined) safeData.instructorNip = rawCourseData.instructorNip;
    if (rawCourseData.deliveryMode !== undefined) safeData.deliveryMode = rawCourseData.deliveryMode;
    if (rawCourseData.room !== undefined) safeData.room = rawCourseData.room;
    if (rawCourseData.scheduleDay !== undefined) safeData.scheduleDay = rawCourseData.scheduleDay;
    if (rawCourseData.scheduleTime !== undefined) safeData.scheduleTime = rawCourseData.scheduleTime;
    if (rawCourseData.meetingLink !== undefined) safeData.meetingLink = rawCourseData.meetingLink;
    if (rawCourseData.progressPercent !== undefined) safeData.progressPercent = Number(rawCourseData.progressPercent);
    if (rawCourseData.totalStudents !== undefined) safeData.totalStudents = Number(rawCourseData.totalStudents);

    const updated = await prisma.course.update({
      where: { id: existingCourse.id },
      data: safeData,
    });

    // ── SYNC TEAM TEACHING ──────────────────────────────────────────────────
    if (teamData && Array.isArray(teamData)) {
      await prisma.teamTeachingMember.deleteMany({ where: { courseId: existingCourse.id } });

      const processedDosenIds = new Set<string>();

      for (const tt of teamData) {
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

        // Auto-create Dosen if not present
        if (!validUser && tt.dosenName) {
          const cleanEmailName = tt.dosenName.toLowerCase().replace(/[^a-z0-9]/g, "") || "dosen";
          const uniqueEmail = `${cleanEmailName}.${Math.floor(1000 + Math.random() * 9000)}@cic.ac.id`;
          const uniqueNip = tt.dosenNip && tt.dosenNip !== "-" ? tt.dosenNip : `${Math.floor(10000000 + Math.random() * 90000000)}`;

          try {
            validUser = await prisma.user.create({
              data: {
                name: tt.dosenName,
                email: uniqueEmail,
                nim_nip: uniqueNip,
                role: "DOSEN",
                password: "dosen123",
                defaultPassword: "dosen123",
                avatar: tt.dosenAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                faculty: existingCourse.faculty || "Fakultas Teknologi Informasi",
                studyProgram: existingCourse.studyProgram || "Teknik Informatika",
                status: "ACTIVE",
              },
            });
          } catch (createErr) {
            console.error("Gagal auto-create dosen untuk team teaching:", createErr);
          }
        }

        if (validUser && !processedDosenIds.has(validUser.id)) {
          processedDosenIds.add(validUser.id);

          const meetingsStr = Array.isArray(tt.assignedMeetings)
            ? JSON.stringify(tt.assignedMeetings)
            : tt.assignedMeetings || "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]";

          await prisma.teamTeachingMember.create({
            data: {
              courseId: existingCourse.id,
              dosenId: validUser.id,
              dosenName: validUser.name || tt.dosenName,
              dosenNip: validUser.nim_nip || tt.dosenNip,
              dosenAvatar: validUser.avatar || tt.dosenAvatar,
              role: tt.role || (processedDosenIds.size === 1 ? "KOORDINATOR" : "ANGGOTA"),
              assignedMeetings: meetingsStr,
            },
          }).catch((err) => console.log("Error create team teaching member:", err));
        }
      }

      // Sync lead instructor in Course model to the KOORDINATOR
      const koordinatorMember = teamData.find((tt: any) => tt.role === "KOORDINATOR") || teamData[0];
      if (koordinatorMember) {
        const leadUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(koordinatorMember.dosenId ? [{ id: koordinatorMember.dosenId }] : []),
              ...(koordinatorMember.dosenNip && koordinatorMember.dosenNip !== "-" ? [{ nim_nip: koordinatorMember.dosenNip }] : []),
              ...(koordinatorMember.dosenName ? [{ name: koordinatorMember.dosenName }] : []),
            ],
          },
        });
        if (leadUser) {
          await prisma.course.update({
            where: { id: existingCourse.id },
            data: {
              instructorId: leadUser.id,
              instructorName: leadUser.name,
              instructorNip: leadUser.nim_nip,
              instructorAvatar: leadUser.avatar,
            },
          });
        }
      }
    }

    // ── SYNC MODULES & ITEMS ────────────────────────────────────────────────
    if (modulesData && Array.isArray(modulesData)) {
      const keptModuleIds = new Set<string>();

      for (let mIdx = 0; mIdx < modulesData.length; mIdx++) {
        const mod = modulesData[mIdx];
        const isClientTempId = !mod.id || String(mod.id).startsWith("mod-");

        let existingMod = null;
        if (!isClientTempId) {
          existingMod = await prisma.module.findFirst({
            where: { id: mod.id, courseId: existingCourse.id },
            include: { items: true },
          });
        }
        if (!existingMod && mod.weekNumber) {
          existingMod = await prisma.module.findFirst({
            where: {
              courseId: existingCourse.id,
              weekNumber: Number(mod.weekNumber),
              id: { notIn: Array.from(keptModuleIds) },
            },
            include: { items: true },
          });
        }

        const safeWeek = !isNaN(Number(mod.weekNumber)) && Number(mod.weekNumber) > 0 ? Number(mod.weekNumber) : (mIdx + 1);
        const safeModOrder = !isNaN(Number(mod.orderIndex)) ? Number(mod.orderIndex) : mIdx;

        const modPayload = {
          title: mod.title || `Modul Pekan ${safeWeek}`,
          description: mod.description || null,
          weekNumber: safeWeek,
          orderIndex: safeModOrder,
          isPublished: mod.isPublished !== undefined ? Boolean(mod.isPublished) : true,
          unlockDate: mod.unlockDate || null,
          assignedDosenId: mod.assignedDosenId || null,
          assignedDosenName: mod.assignedDosenName || null,
          assignedDosenNip: mod.assignedDosenNip || null,
        };

        let targetModuleRecord;
        if (existingMod) {
          targetModuleRecord = await prisma.module.update({
            where: { id: existingMod.id },
            data: modPayload,
          });
        } else {
          targetModuleRecord = await prisma.module.create({
            data: {
              ...modPayload,
              course: { connect: { id: existingCourse.id } },
            },
          });
        }

        keptModuleIds.add(targetModuleRecord.id);

        // Sync items for this module
        if (mod.items && Array.isArray(mod.items)) {
          const keptItemIds = new Set<string>();

          for (let iIdx = 0; iIdx < mod.items.length; iIdx++) {
            const item = mod.items[iIdx];
            const isItemTempId = !item.id || String(item.id).startsWith("item-");

            let existingItem = null;
            if (!isItemTempId) {
              existingItem = await prisma.moduleItem.findFirst({
                where: { id: item.id, moduleId: targetModuleRecord.id },
              });
            }
            if (!existingItem && item.title) {
              existingItem = await prisma.moduleItem.findFirst({
                where: {
                  moduleId: targetModuleRecord.id,
                  title: item.title,
                  id: { notIn: Array.from(keptItemIds) },
                },
              });
            }

            const safeItemOrder = !isNaN(Number(item.orderIndex)) ? Number(item.orderIndex) : iIdx;
            const safeDuration = item.durationMinutes && !isNaN(Number(item.durationMinutes)) ? Number(item.durationMinutes) : null;

            const itemPayload = {
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
            };

            let targetItemRecord;
            if (existingItem) {
              targetItemRecord = await prisma.moduleItem.update({
                where: { id: existingItem.id },
                data: itemPayload,
              });
            } else {
              targetItemRecord = await prisma.moduleItem.create({
                data: {
                  ...itemPayload,
                  module: { connect: { id: targetModuleRecord.id } },
                },
              });
            }

            keptItemIds.add(targetItemRecord.id);
          }

          // Delete items in this module that were removed
          await prisma.moduleItem.deleteMany({
            where: {
              moduleId: targetModuleRecord.id,
              id: { notIn: Array.from(keptItemIds) },
            },
          });
        }
      }

      // Safe deletion of removed modules and their items
      const modulesToDelete = await prisma.module.findMany({
        where: {
          courseId: existingCourse.id,
          id: { notIn: Array.from(keptModuleIds) },
        },
        select: { id: true },
      });
      if (modulesToDelete.length > 0) {
        const toDelIds = modulesToDelete.map((m) => m.id);
        await prisma.moduleItem.deleteMany({
          where: { moduleId: { in: toDelIds } },
        });
        await prisma.module.deleteMany({
          where: { id: { in: toDelIds } },
        });
      }
    }

    if (actorId) {
      const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { name: true, role: true } });
      await prisma.systemAuditLog.create({
        data: {
          userId: actorId,
          userName: actor?.name || "Admin",
          userRole: actor?.role || "ADMIN",
          action: "COURSE_UPDATE",
          category: "COURSE",
          status: "SUCCESS",
          details: `Matakuliah "${updated.name}" (${updated.code}) diperbarui.`,
        },
      }).catch(() => {});
    }

    const finalCourse = await prisma.course.findUnique({
      where: { id: existingCourse.id },
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
    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("Error PUT /api/courses/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal memperbarui kursus." }, { status: 500 });
  }
}

// DELETE /api/courses/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { actorId } = await req.json().catch(() => ({}));
    const rawId = decodeURIComponent(params.id || "").trim();
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          ...(rawId ? [{ id: rawId }] : []),
          ...(rawId ? [{ code: rawId }] : []),
          ...(rawId ? [{ code: rawId.toUpperCase() }] : []),
          ...(rawId ? [{ code: rawId.toLowerCase() }] : []),
        ],
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    await prisma.course.delete({ where: { id: course.id } });

    if (actorId) {
      const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { name: true, role: true } });
      await prisma.systemAuditLog.create({
        data: {
          userId: actorId,
          userName: actor?.name || "Admin",
          userRole: actor?.role || "ADMIN",
          action: "COURSE_DELETE",
          category: "COURSE",
          status: "WARNING",
          details: `Matakuliah "${course.name}" (${course.code}) dihapus.`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: `Matakuliah "${course.name}" berhasil dihapus.` });
  } catch (e: any) {
    console.error("Error DELETE /api/courses/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal menghapus kursus." }, { status: 500 });
  }
}
