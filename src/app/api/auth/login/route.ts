import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: "NIM/NIP/Email dan password wajib diisi." }, { status: 400 });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId },
          { nim_nip: cleanId },
        ],
        status: "ACTIVE",
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "NIM / NIP / Email tidak terdaftar dalam sistem LMS-UCIC." }, { status: 401 });
    }

    if (user.password !== password) {
      // Log failed attempt
      await prisma.systemAuditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: "AUTH_FAILED",
          category: "AUTH",
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          status: "FAILED",
          details: `Percobaan login gagal untuk akun ${user.name}. Kata sandi salah.`,
        },
      });
      return NextResponse.json({ success: false, message: "Kata sandi yang Anda masukkan salah. Periksa kembali!" }, { status: 401 });
    }

    // Log successful login
    await prisma.systemAuditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "AUTH_LOGIN",
        category: "AUTH",
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        status: "SUCCESS",
        details: `Login berhasil sebagai ${user.role} (${user.name}) dengan verifikasi Captcha.`,
      },
    });

    // Return user data (without password)
    const { password: _pwd, defaultPassword: _def, ...safeUser } = user;
    return NextResponse.json({ success: true, message: `Selamat datang kembali, ${user.name}!`, user: safeUser });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Server error saat login." }, { status: 500 });
  }
}
