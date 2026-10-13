import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/logout  
export async function POST(req: NextRequest) {
  try {
    const { userId, userName, userRole } = await req.json();
    if (userId && userId !== "system") {
      await prisma.systemAuditLog.create({
        data: {
          userId,
          userName: userName || "Unknown",
          userRole: userRole || "STUDENT",
          action: "AUTH_LOGOUT",
          category: "AUTH",
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          status: "SUCCESS",
          details: `${userName} logout dari sesi aktif.`,
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
