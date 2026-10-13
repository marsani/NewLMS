import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_STUDY_PROGRAMS } from "@/data/mockData";

export async function GET() {
  try {
    let prodis = await prisma.studyProgram.findMany({
      include: { faculty: true },
      orderBy: { name: "asc" },
    });

    if (prodis.length === 0 && MOCK_STUDY_PROGRAMS.length > 0) {
      for (const p of MOCK_STUDY_PROGRAMS) {
        // Ensure faculty exists
        const fac = await prisma.faculty.findUnique({ where: { id: p.facultyId } });
        if (fac) {
          await prisma.studyProgram.upsert({
            where: { code: p.code },
            update: {},
            create: {
              id: p.id,
              facultyId: p.facultyId,
              name: p.name,
              code: p.code,
              degree: p.degree,
            },
          }).catch(() => {});
        }
      }
      prodis = await prisma.studyProgram.findMany({
        include: { faculty: true },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json(prodis);
  } catch (e: any) {
    console.error("Error GET /api/study-programs:", e);
    return NextResponse.json({ error: "Gagal mengambil data program studi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { facultyId, name, code, degree, id: customId } = body;

    if (!facultyId || !name || !code) {
      return NextResponse.json({ error: "Fakultas, Nama Prodi, dan Kode Prodi wajib diisi." }, { status: 400 });
    }

    const newProdi = await prisma.studyProgram.create({
      data: {
        ...(customId && !customId.startsWith("prodi-") ? { id: customId } : {}),
        facultyId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        degree: degree || "S1",
      },
      include: { faculty: true },
    });

    return NextResponse.json(newProdi, { status: 201 });
  } catch (e: any) {
    console.error("Error POST /api/study-programs:", e);
    return NextResponse.json({ error: e?.message || "Gagal membuat program studi." }, { status: 500 });
  }
}
