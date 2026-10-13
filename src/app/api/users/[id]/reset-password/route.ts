import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/users/[id]/reset-password — reset password ke default
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { actorId } = await req.json().catch(() => ({}));

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

    if (!user.defaultPassword) {
      return NextResponse.json({ error: "Password default belum ditetapkan untuk akun ini." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { password: user.defaultPassword },
    });

    if (actorId) {
      const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { name: true, role: true } });
      await prisma.systemAuditLog.create({
        data: {
          userId: actorId, userName: actor?.name || "Admin", userRole: actor?.role || "ADMIN",
          action: "USER_PASSWORD_RESET", category: "AUTH", status: "WARNING",
          details: `Password akun ${user.name} (${user.nim_nip}) di-reset ke password default oleh Admin.`,
        },
      });
    }

    return NextResponse.json({ success: true, message: `Password ${user.name} berhasil di-reset ke password default.` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal reset password." }, { status: 500 });
  }
}
