import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { serializeLibraryMovie } from "@/lib/serializers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      watchedAt?: string;
      rating?: number;
      review?: string;
    };

    if (!body.watchedAt || typeof body.rating !== "number") {
      return NextResponse.json({ message: "Faltan datos del visionado." }, { status: 400 });
    }

    const user = await getCurrentUser();
    const item = await prisma.userMovie.findFirst({
      where: { id, userId: user.id },
    });

    if (!item) {
      return NextResponse.json({ message: "No hemos encontrado esa película." }, { status: 404 });
    }

    await prisma.watchHistory.create({
      data: {
        userMovieId: id,
        watchedAt: new Date(body.watchedAt),
        rating: body.rating,
        review: body.review?.trim() || null,
      },
    });

    const updated = await prisma.userMovie.findUniqueOrThrow({
      where: { id },
      include: {
        movie: true,
        watchHistory: { orderBy: { watchedAt: "desc" } },
      },
    });

    return NextResponse.json({ item: serializeLibraryMovie(updated) }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "No hemos podido añadir el visionado." }, { status: 500 });
  }
}
