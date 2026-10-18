import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { publicationData, serializePublication, type PublicationBody } from "@/lib/publications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const genre = searchParams.get("genre")?.trim();
  const type = searchParams.get("type")?.trim();
  const language = searchParams.get("language")?.trim();
  const author = searchParams.get("author")?.trim();
  const sort = searchParams.get("sort") ?? "recent";

  try {
    const user = await getCurrentUser();
    const where: Prisma.PublicationWhereInput = {
      userId: user.id,
      ...(genre ? { genre } : {}),
      ...(type ? { type } : {}),
      ...(language ? { language } : {}),
      ...(author ? { author } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { issueNumber: { contains: search, mode: "insensitive" } },
              { author: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, allItems] = await Promise.all([
      prisma.publication.findMany({ where }),
      prisma.publication.findMany({ where: { userId: user.id } }),
    ]);

    items.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "date") return (b.publicationDate?.getTime() ?? 0) - (a.publicationDate?.getTime() ?? 0);
      if (sort === "number") return (a.issueNumber ?? "").localeCompare(b.issueNumber ?? "", undefined, { numeric: true });
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

    return NextResponse.json({
      items: items.map(serializePublication),
      filterOptions: {
        genres: unique(allItems.map((item) => item.genre)),
        types: unique(allItems.map((item) => item.type)),
        languages: unique(allItems.map((item) => item.language)),
        authors: unique(allItems.map((item) => item.author)),
      },
    });
  } catch {
    return NextResponse.json({ message: "No hemos podido cargar la revisteca." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PublicationBody;
    if (!body.title?.trim() || !body.type?.trim()) {
      return NextResponse.json({ message: "El título y el tipo son obligatorios." }, { status: 400 });
    }

    const user = await getCurrentUser();
    const item = await prisma.publication.create({
      data: {
        userId: user.id,
        ...publicationData(body),
      },
    });
    return NextResponse.json({ item: serializePublication(item) }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "No hemos podido guardar la publicación." }, { status: 500 });
  }
}

function unique(values: Array<string | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b));
}
