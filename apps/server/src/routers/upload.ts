import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { uploads } from "../db/schema/uploads";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const deleteFileFromDisk = async (filePath: string) => {
  try {
    const fullPath = path.join(process.cwd(), "uploads", filePath);
    await fs.unlink(fullPath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    console.warn(`Failed to delete file: ${filePath}`, error);
  }
};

export const uploadRouter = router({
  uploadImage: publicProcedure
    .input(z.object({
      file: z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        data: z.string(),
      }),
      category: z.enum(["blog", "meta", "general"]).default("general"),
    }))
    .mutation(async ({ input }) => {
      const { file, category } = input;

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Unsupported file type. Please use JPG, PNG, WebP, or GIF.");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File too large. Maximum size is 5MB.");
      }

      const ext = path.extname(file.name);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      
      const uploadDir = path.join(process.cwd(), "uploads", category);
      await mkdir(uploadDir, { recursive: true });
      
      const filepath = path.join(uploadDir, filename);
      const buffer = Buffer.from(file.data, "base64");
      await writeFile(filepath, buffer);

      const relativePath = `${category}/${filename}`;
      const url = `/api/uploads/${relativePath}`;

      await db.insert(uploads).values({
        id: nanoid(),
        filename,
        originalName: file.name,
        mimetype: file.type,
        size: file.size,
        path: relativePath,
        url,
        category,
      });

      return {
        url,
        filename,
        originalName: file.name,
      };
    }),

  deleteImage: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const results = await db.select().from(uploads).where(eq(uploads.id, input.id));
      
      if (!results[0]) {
        throw new Error("File not found");
      }

      await deleteFileFromDisk(results[0].path);

      return db.delete(uploads).where(eq(uploads.id, input.id));
    }),

  getUploads: publicProcedure
    .input(z.object({
      category: z.enum(["blog", "meta", "general"]).optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      if (input.category) {
        return await db.select().from(uploads)
          .where(eq(uploads.category, input.category))
          .limit(input.limit)
          .orderBy(uploads.createdAt);
      }
      
      return await db.select().from(uploads)
        .limit(input.limit)
        .orderBy(uploads.createdAt);
    }),

  deleteImageByUrl: publicProcedure
    .input(z.object({
      url: z.string(),
    }))
    .mutation(async ({ input }) => {
      const results = await db.select().from(uploads).where(eq(uploads.url, input.url));
      
      if (!results[0]) {
        console.warn("File not found in database:", input.url);
        return { success: false };
      }

      await deleteFileFromDisk(results[0].path);

      await db.delete(uploads).where(eq(uploads.url, input.url));

      return { success: true };
    }),
}); 