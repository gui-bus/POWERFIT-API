import { fromNodeHeaders } from "better-auth/node";
import { createUploadthing, type FileRouter } from "uploadthing/fastify";
import { UploadThingError } from "uploadthing/server";

import { auth } from "./auth.js";
import { prisma } from "./db.js";

const f = createUploadthing();

export const uploadRouter = {
  // Rota para foto de perfil
  profileImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // 1. Tenta pegar a sessão pelo Better Auth
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      let userId: string | undefined = session?.user.id;

      // 2. Fallback direto no banco de dados (mais robusto para cross-origin)
      if (!userId && req.headers.authorization) {
        const token = req.headers.authorization.replace("Bearer ", "");
        
        const dbSession = await prisma.session.findUnique({
          where: { token },
          select: { userId: true, expiresAt: true }
        });

        if (dbSession && dbSession.expiresAt > new Date()) {
          userId = dbSession.userId;
        }
      }

      if (!userId) {
        console.error("Uploadthing: Falha total na autenticação. Token:", req.headers.authorization);
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Sessão inválida ou expirada. Faça login novamente.",
        });
      }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { id: metadata.userId },
        data: { image: file.url },
      });

      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Rota para fotos de treino (feed)
  workoutImage: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // 1. Tenta pegar a sessão pelo Better Auth
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      let userId: string | undefined = session?.user.id;

      // 2. Fallback direto no banco de dados (mais robusto para cross-origin)
      if (!userId && req.headers.authorization) {
        const token = req.headers.authorization.replace("Bearer ", "");
        
        const dbSession = await prisma.session.findUnique({
          where: { token },
          select: { userId: true, expiresAt: true }
        });

        if (dbSession && dbSession.expiresAt > new Date()) {
          userId = dbSession.userId;
        }
      }

      if (!userId) {
        console.error("Uploadthing (Workout): Falha total na autenticação. Token:", req.headers.authorization);
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Sessão inválida ou expirada. Faça login novamente.",
        });
      }

      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
