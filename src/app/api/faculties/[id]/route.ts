import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, code } = body;

    const existing = await prisma.faculty.findFirst({
      where: { OR: [{ id }, { code }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Fakultas tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.faculty.update({
      where: { id: existing.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(code ? { code: code.trim().toUpperCase() } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("Error PUT /api/faculties/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal memperbarui fakultas." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const existing = await prisma.faculty.findFirst({
      where: { OR: [{ id }, { code: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Fakultas tidak ditemukan." }, { status: 404 });
    }

    await prisma.faculty.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true, message: "Fakultas berhasil dihapus." });
  } catch (e: any) {
    console.error("Error DELETE /api/faculties/[id]:", e);
    return NextResponse.json({ error: e?.message || "Gagal menghapus fakultas." }, { status: 500 });
  }
}
