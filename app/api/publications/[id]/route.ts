import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { publicationData, serializePublication, type PublicationBody } from "@/lib/publications";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  try {
    const body = await request.json() as PublicationBody;
    if (!body.title?.trim() || !body.type?.trim()) {
      return NextResponse.json({ message: "El título y el tipo son obligatorios." }, { status: 400 });
    }
    const user = await getCurrentUser();
    const current = await prisma.publication.findFirst({ where: { id, userId: user.id } });
    if (!current) return NextResponse.json({ message: "No hemos encontrado esa publicación." }, { status: 404 });
    const item = await prisma.publication.update({ where: { id }, data: publicationData(body) });
    return NextResponse.json({ item: serializePublication(item) });
  } catch {
    return NextResponse.json({ message: "No hemos podido actualizar la publicación." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  try {
    const user = await getCurrentUser();
    const current = await prisma.publication.findFirst({ where: { id, userId: user.id } });
    if (!current) return NextResponse.json({ message: "No hemos encontrado esa publicación." }, { status: 404 });
    await prisma.publication.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "No hemos podido eliminar la publicación." }, { status: 500 });
  }
}
