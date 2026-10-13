import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { facultyId, name, code, degree } = body;

    const existing = await prisma.studyProgram.findFirst({
      where: { OR: [{ id }, { code }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program studi tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.studyProgram.update({
      where: { id: existing.id },
      data: {
        ...(facultyId ? { facultyId } : {}),
        ...(name ? { name: name.trim() } : {}),
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(degree ? { degree } : {}),
      },
      include: { faculty: true },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("Error PUT /api/study-programs/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal memperbarui program studi." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const existing = await prisma.studyProgram.findFirst({
      where: { OR: [{ id }, { code: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program studi tidak ditemukan." }, { status: 404 });
    }

    await prisma.studyProgram.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "Program studi berhasil dihapus." });
  } catch (e: any) {
    console.error("Error DELETE /api/study-programs/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal menghapus program studi." }, { status: 500 });
  }
}
