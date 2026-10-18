import type { Publication } from "@prisma/client";
import { parseStringArray } from "@/lib/serializers";

export type PublicationBody = {
  title?: string;
  issueNumber?: string;
  publicationDate?: string;
  author?: string;
  genre?: string;
  type?: string;
  language?: string;
  coverImage?: string | null;
  photos?: string[];
};

export function publicationData(body: PublicationBody) {
  return {
    title: body.title?.trim() ?? "",
    issueNumber: body.issueNumber?.trim() || null,
    publicationDate: body.publicationDate ? new Date(body.publicationDate) : null,
    author: body.author?.trim() || null,
    genre: body.genre?.trim() || null,
    type: body.type?.trim() || "Revista",
    language: body.language?.trim() || null,
    coverImage: normalizeImage(body.coverImage),
    photosJson: JSON.stringify(normalizePhotos(body.photos)),
  };
}

export function serializePublication(item: Publication) {
  const { userId: _userId, photosJson, ...publication } = item;
  return {
    ...publication,
    publicationDate: item.publicationDate?.toISOString() ?? null,
    photos: parseStringArray(photosJson),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function normalizeImage(image: string | null | undefined) {
  return image?.startsWith("data:image/") ? image : null;
}

function normalizePhotos(photos: string[] | undefined) {
  return (photos ?? []).filter((photo) => photo.startsWith("data:image/")).slice(0, 6);
}
