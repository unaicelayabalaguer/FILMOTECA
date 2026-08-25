import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { serializeLibraryMovie } from "@/lib/serializers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const user = await getCurrentUser();
    const item = await prisma.userMovie.findFirst({
      where: { id, userId: user.id },
      include: {
        movie: true,
        watchHistory: { orderBy: { watchedAt: "desc" } },
      },
    });

    if (!item) {
      return NextResponse.json({ message: "No hemos encontrado esa película." }, { status: 404 });
    }

    return NextResponse.json({ item: serializeLibraryMovie(item) });
  } catch {
    return NextResponse.json(
      { message: "No hemos podido cargar la ficha de la película." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      favorite?: boolean;
      watchedAt?: string;
      rating?: number;
      review?: string;
    };

    const user = await getCurrentUser();
    const item = await prisma.userMovie.findFirst({
      where: { id, userId: user.id },
      include: {
        watchHistory: { orderBy: { watchedAt: "desc" }, take: 1 },
      },
    });

    if (!item) {
      return NextResponse.json({ message: "No hemos encontrado esa película." }, { status: 404 });
    }

    if (typeof body.favorite === "boolean") {
      await prisma.userMovie.update({
        where: { id },
        data: { favorite: body.favorite },
      });
    }

    const latestWatch = item.watchHistory[0];
    if (latestWatch && (body.watchedAt || typeof body.rating === "number" || body.review !== undefined)) {
      await prisma.watchHistory.update({
        where: { id: latestWatch.id },
        data: {
          watchedAt: body.watchedAt ? new Date(body.watchedAt) : undefined,
          rating: typeof body.rating === "number" ? body.rating : undefined,
          review: body.review?.trim() || null,
        },
      });
    }

    const updated = await prisma.userMovie.findUniqueOrThrow({
      where: { id },
      include: {
        movie: true,
        watchHistory: { orderBy: { watchedAt: "desc" } },
      },
    });

    return NextResponse.json({ item: serializeLibraryMovie(updated) });
  } catch {
    return NextResponse.json({ message: "No hemos podido actualizar la película." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const user = await getCurrentUser();
    const item = await prisma.userMovie.findFirst({
      where: { id, userId: user.id },
    });

    if (!item) {
      return NextResponse.json({ message: "No hemos encontrado esa película." }, { status: 404 });
    }

    await prisma.userMovie.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "No hemos podido eliminar la película." }, { status: 500 });
  }
}
