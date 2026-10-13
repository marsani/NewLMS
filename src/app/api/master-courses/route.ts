import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_MASTER_COURSES } from "@/data/mockData";

// GET /api/master-courses — list semua master matakuliah
export async function GET() {
  try {
    let masterCourses = await prisma.masterCourse.findMany({
      orderBy: { code: "asc" },
    });

    // Seed initial mock master courses if database is empty
    if (masterCourses.length === 0 && MOCK_MASTER_COURSES.length > 0) {
      for (const mc of MOCK_MASTER_COURSES) {
        await prisma.masterCourse.upsert({
          where: { code: mc.code },
          update: {},
          create: {
            id: mc.id,
            code: mc.code,
            name: mc.name,
            credits: mc.credits,
            description: mc.description,
          },
        }).catch(() => {});
      }
      masterCourses = await prisma.masterCourse.findMany({
        orderBy: { code: "asc" },
      });
    }

    return NextResponse.json(masterCourses);
  } catch (e: any) {
    console.error("Error GET /api/master-courses:", e);
    return NextResponse.json({ error: "Gagal mengambil data master matakuliah." }, { status: 500 });
  }
}

// POST /api/master-courses — buat master matakuliah baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, credits, description, id: customId } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "Kode dan Nama Matakuliah wajib diisi." }, { status: 400 });
    }

    // Check duplicate code
    const existing = await prisma.masterCourse.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Kode matakuliah "${code}" sudah terdaftar dalam kurikulum.` },
        { status: 409 }
      );
    }

    const newMaster = await prisma.masterCourse.create({
      data: {
        ...(customId && !customId.startsWith("mk-") ? { id: customId } : {}),
        code: code.trim().toUpperCase(),
        name: name.trim(),
        credits: Number(credits) || 3,
        description: description?.trim() || "",
      },
    });

    return NextResponse.json(newMaster, { status: 201 });
  } catch (e: any) {
    console.error("Error POST /api/master-courses:", e);
    return NextResponse.json({ error: e?.message || "Gagal membuat master matakuliah." }, { status: 500 });
  }
}
