import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/master-courses/[id] — update master matakuliah
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { code, name, credits, description } = body;

    const existing = await prisma.masterCourse.findFirst({
      where: {
        OR: [{ id }, { code }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Master matakuliah tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.masterCourse.update({
      where: { id: existing.id },
      data: {
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(name ? { name: name.trim() } : {}),
        ...(credits !== undefined ? { credits: Number(credits) } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("Error PUT /api/master-courses/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal memperbarui master matakuliah." }, { status: 500 });
  }
}

// DELETE /api/master-courses/[id] — hapus master matakuliah
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const existing = await prisma.masterCourse.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Master matakuliah tidak ditemukan." }, { status: 404 });
    }

    await prisma.masterCourse.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "Master matakuliah berhasil dihapus." });
  } catch (e: any) {
    console.error("Error DELETE /api/master-courses/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal menghapus master matakuliah." }, { status: 500 });
  }
}
