import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const email = process.env.DEFAULT_USER_EMAIL ?? "yo@filmoteca.local";

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });
}
