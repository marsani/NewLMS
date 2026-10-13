import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const cleanId = id.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { nim_nip: id }, { email: cleanId }],
      },
      select: {
        id: true,
        email: true,
        nim_nip: true,
        name: true,
        password: true,
        role: true,
        avatar: true,
        phone: true,
        faculty: true,
        studyProgram: true,
        status: true,
        defaultPassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e: any) {
    console.error("Error GET /api/users/[id]:", e);
    return NextResponse.json({ error: "Gagal mengambil data pengguna." }, { status: 500 });
  }
}

// PUT /api/users/[id] — update user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      name,
      email,
      nim_nip,
      password,
      defaultPassword,
      phone,
      faculty,
      studyProgram,
      status,
      avatar,
      role,
      actorId,
    } = body;

    const cleanId = id.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { nim_nip: id }, { email: cleanId }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Check duplicate email or nim_nip if being updated
    if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailDup = await prisma.user.findFirst({
        where: { email: email.toLowerCase(), NOT: { id: existing.id } },
      });
      if (emailDup) {
        return NextResponse.json({ error: `Email "${email}" sudah digunakan oleh akun lain.` }, { status: 409 });
      }
    }

    if (nim_nip && nim_nip !== existing.nim_nip) {
      const nipDup = await prisma.user.findFirst({
        where: { nim_nip, NOT: { id: existing.id } },
      });
      if (nipDup) {
        return NextResponse.json({ error: `NIM/NIP "${nim_nip}" sudah digunakan oleh akun lain.` }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email: email.toLowerCase() } : {}),
        ...(nim_nip ? { nim_nip } : {}),
        ...(password ? { password } : {}),
        ...(defaultPassword ? { defaultPassword } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(faculty !== undefined ? { faculty } : {}),
        ...(studyProgram !== undefined ? { studyProgram } : {}),
        ...(status ? { status } : {}),
        ...(avatar ? { avatar } : {}),
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        email: true,
        nim_nip: true,
        name: true,
        password: true,
        role: true,
        avatar: true,
        phone: true,
        faculty: true,
        studyProgram: true,
        status: true,
        defaultPassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Also update lecturer info in Course and Module if name or avatar or nip changed
    if (existing.role === "DOSEN" && (name || avatar || nim_nip)) {
      await prisma.course.updateMany({
        where: { instructorId: existing.id },
        data: {
          ...(name ? { instructorName: name } : {}),
          ...(avatar ? { instructorAvatar: avatar } : {}),
          ...(nim_nip ? { instructorNip: nim_nip } : {}),
        },
      }).catch(() => {});

      await prisma.teamTeachingMember.updateMany({
        where: { dosenId: existing.id },
        data: {
          ...(name ? { dosenName: name } : {}),
          ...(avatar ? { dosenAvatar: avatar } : {}),
          ...(nim_nip ? { dosenNip: nim_nip } : {}),
        },
      }).catch(() => {});
    }

    if (actorId) {
      const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { name: true, role: true } });
      await prisma.systemAuditLog.create({
        data: {
          userId: actorId,
          userName: actor?.name || "Admin",
          userRole: actor?.role || "ADMIN",
          action: "USER_UPDATE",
          category: "SYSTEM",
          status: "SUCCESS",
          details: `Akun ${existing.name} (${existing.nim_nip}) diperbarui.`,
        },
      }).catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("Error PUT /api/users/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal memperbarui pengguna." }, { status: 500 });
  }
}

// DELETE /api/users/[id] — hapus user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { actorId } = await req.json().catch(() => ({}));

    const cleanId = id.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { nim_nip: id }, { email: cleanId }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Clean up relations that might not cascade automatically
    await prisma.assignmentSubmission.updateMany({
      where: { gradedById: existing.id },
      data: { gradedById: null },
    }).catch(() => {});

    await prisma.course.updateMany({
      where: { instructorId: existing.id },
      data: { instructorId: null },
    }).catch(() => {});

    await prisma.module.updateMany({
      where: { assignedDosenId: existing.id },
      data: { assignedDosenId: null },
    }).catch(() => {});

    await prisma.systemAuditLog.deleteMany({
      where: { userId: existing.id },
    }).catch(() => {});

    await prisma.user.delete({ where: { id: existing.id } });

    if (actorId) {
      const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { name: true, role: true } });
      await prisma.systemAuditLog.create({
        data: {
          userId: actorId,
          userName: actor?.name || "Admin",
          userRole: actor?.role || "ADMIN",
          action: "USER_DELETE",
          category: "SYSTEM",
          status: "WARNING",
          details: `Akun ${existing.name} (${existing.nim_nip}, ${existing.role}) dihapus dari sistem.`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: `Akun ${existing.name} berhasil dihapus.` });
  } catch (e: any) {
    console.error("Error DELETE /api/users/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal menghapus pengguna." }, { status: 500 });
  }
}
