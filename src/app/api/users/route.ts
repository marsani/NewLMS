import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users — daftar semua user
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true, email: true, nim_nip: true, name: true,
        password: true,
        role: true, avatar: true, phone: true, faculty: true,
        studyProgram: true, status: true, defaultPassword: true,
        createdAt: true, updatedAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal mengambil data pengguna." }, { status: 500 });
  }
}

// POST /api/users — buat user baru (Admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, nim_nip, role, password, defaultPassword, phone, faculty, studyProgram, avatar, actorId } = body;

    if (!name || !email || !nim_nip || !role || !password) {
      return NextResponse.json({ error: "Field wajib: name, email, nim_nip, role, password." }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { nim_nip }] } });
    if (existing) {
      return NextResponse.json({ error: "Email atau NIM/NIP sudah terdaftar di sistem." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        nim_nip,
        role,
        password: password,
        defaultPassword: defaultPassword || password,
        phone: phone || null,
        faculty: faculty || null,
        studyProgram: studyProgram || null,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
        status: "ACTIVE",
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

    // Audit log
    if (actorId) {
      const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { name: true, role: true } });
      await prisma.systemAuditLog.create({
        data: {
          userId: actorId,
          userName: actor?.name || "Admin",
          userRole: actor?.role || "ADMIN",
          action: "USER_CREATE",
          category: "SYSTEM",
          status: "SUCCESS",
          details: `Akun baru dibuat: ${name} (${role}, ${nim_nip}).`,
        },
      }).catch(() => {});
    }

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal membuat pengguna." }, { status: 500 });
  }
}
