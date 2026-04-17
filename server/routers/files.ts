import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createFile, deleteFile, getFileById, getUserFiles } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

/**
 * Determine file type category based on MIME type
 */
function getFileTypeCategory(mimeType: string): "image" | "video" | "text" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("text/") || mimeType === "application/json") return "text";
  return "other";
}

export const filesRouter = router({
  /**
   * Upload a file: receives base64 data, stores in S3, creates database record
   */
  upload: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(128),
        size: z.number().min(1).max(100 * 1024 * 1024), // 100MB max
        data: z.string(), // base64 encoded file data
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.data, "base64");

        // Upload to S3
        const { key, url } = await storagePut(
          `${ctx.user.id}/files/${Date.now()}-${input.filename}`,
          buffer,
          input.mimeType
        );

        // Determine file type category
        const fileType = getFileTypeCategory(input.mimeType);

        // Create database record
        const result = await createFile({
          userId: ctx.user.id,
          filename: input.filename,
          storageKey: key,
          mimeType: input.mimeType,
          size: input.size,
          fileType,
        });

        return {
          success: true,
          storageKey: key,
          url,
        };
      } catch (error) {
        console.error("[Files] Upload failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload file",
        });
      }
    }),

  /**
   * List all files for the current user with optional filtering and search
   */
  list: protectedProcedure
    .input(
      z.object({
        fileType: z.enum(["all", "image", "video", "text", "other"]).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const files = await getUserFiles(ctx.user.id, {
          fileType: input.fileType === "all" ? undefined : input.fileType,
          search: input.search,
        });

        return files;
      } catch (error) {
        console.error("[Files] List failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list files",
        });
      }
    }),

  /**
   * Delete a file by ID (removes from database and storage reference)
   */
  delete: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const success = await deleteFile(input.fileId, ctx.user.id);

        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found or unauthorized",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Files] Delete failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file",
        });
      }
    }),

  /**
   * Get a single file by ID (for preview/download)
   */
  getById: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const file = await getFileById(input.fileId, ctx.user.id);

        if (!file) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "File not found",
          });
        }

        return file;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Files] GetById failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get file",
        });
      }
    }),
});
