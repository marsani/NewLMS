import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/users/[id]/change-password — user ganti password sendiri
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Password lama dan baru wajib diisi." }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

    if (user.password !== currentPassword) {
      return NextResponse.json({ error: "Password saat ini tidak sesuai. Periksa kembali!" }, { status: 401 });
    }

    await prisma.user.update({ where: { id }, data: { password: newPassword } });

    await prisma.systemAuditLog.create({
      data: {
        userId: id, userName: user.name, userRole: user.role,
        action: "USER_PASSWORD_CHANGE", category: "AUTH", status: "SUCCESS",
        details: `${user.name} berhasil mengganti password akun secara mandiri.`,
      },
    });

    return NextResponse.json({ success: true, message: "Password berhasil diperbarui. Gunakan password baru Anda saat login berikutnya." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal mengganti password." }, { status: 500 });
  }
}
