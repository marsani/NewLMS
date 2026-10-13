import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_FACULTIES } from "@/data/mockData";

export async function GET() {
  try {
    let faculties = await prisma.faculty.findMany({
      orderBy: { name: "asc" },
    });

    if (faculties.length === 0 && MOCK_FACULTIES.length > 0) {
      for (const f of MOCK_FACULTIES) {
        await prisma.faculty.upsert({
          where: { code: f.code },
          update: {},
          create: {
            id: f.id,
            name: f.name,
            code: f.code,
          },
        }).catch(() => { });
      }
      faculties = await prisma.faculty.findMany({
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json(faculties);
  } catch (e: any) {
    console.error("Error GET /api/faculties:", e);
    return NextResponse.json({ error: "Gagal mengambil data fakultas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, id: customId } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Nama dan Kode Fakultas wajib diisi." }, { status: 400 });
    }

    const newFaculty = await prisma.faculty.create({
      data: {
        ...(customId && !customId.startsWith("faculty-") ? { id: customId } : {}),
        name: name.trim(),
        code: code.trim().toUpperCase(),
      },
    });

    return NextResponse.json(newFaculty, { status: 201 });
  } catch (e: any) {
    console.error("Error POST /api/faculties:", e);
    return NextResponse.json({ error: e?.message || "Gagal membuat fakultas." }, { status: 500 });
  }
}
