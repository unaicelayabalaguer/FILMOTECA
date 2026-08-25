import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTmdbConfigured } from "@/lib/tmdb";

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());
  const tmdbConfigured = isTmdbConfigured();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      databaseConfigured,
      databaseReachable: true,
      tmdbConfigured,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        databaseConfigured,
        databaseReachable: false,
        tmdbConfigured,
        databaseError:
          error instanceof Error
            ? error.message.split("\n").slice(0, 2).join(" ")
            : "Unknown database error",
      },
      { status: 500 },
    );
  }
}
