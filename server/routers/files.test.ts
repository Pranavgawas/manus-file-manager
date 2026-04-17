import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { filesRouter } from "./files";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("files router", () => {
  describe("upload procedure", () => {
    it("should reject unauthorized requests", async () => {
      const ctx = createAuthContext();
      ctx.user = null as any;
      const caller = filesRouter.createCaller(ctx);

      await expect(
        caller.upload({
          filename: "test.txt",
          mimeType: "text/plain",
          size: 100,
          data: Buffer.from("test content").toString("base64"),
        })
      ).rejects.toThrow(TRPCError);
    });

    it("should validate input parameters", async () => {
      const ctx = createAuthContext();
      const caller = filesRouter.createCaller(ctx);

      // Test with empty filename
      await expect(
        caller.upload({
          filename: "",
          mimeType: "text/plain",
          size: 100,
          data: "dGVzdA==",
        })
      ).rejects.toThrow();

      // Test with invalid size
      await expect(
        caller.upload({
          filename: "test.txt",
          mimeType: "text/plain",
          size: -1,
          data: "dGVzdA==",
        })
      ).rejects.toThrow();
    });
  });

  describe("list procedure", () => {
    it("should reject unauthorized requests", async () => {
      const ctx = createAuthContext();
      ctx.user = null as any;
      const caller = filesRouter.createCaller(ctx);

      await expect(
        caller.list({
          fileType: "all",
        })
      ).rejects.toThrow(TRPCError);
    });

    it("should accept valid filter parameters", async () => {
      const ctx = createAuthContext();
      const caller = filesRouter.createCaller(ctx);

      // Should not throw
      await expect(
        caller.list({
          fileType: "image",
          search: "test",
        })
      ).resolves.toBeDefined();
    });
  });

  describe("delete procedure", () => {
    it("should reject unauthorized requests", async () => {
      const ctx = createAuthContext();
      ctx.user = null as any;
      const caller = filesRouter.createCaller(ctx);

      await expect(
        caller.delete({
          fileId: 1,
        })
      ).rejects.toThrow(TRPCError);
    });

    it("should validate fileId input", async () => {
      const ctx = createAuthContext();
      const caller = filesRouter.createCaller(ctx);

      // Should handle non-existent file gracefully
      await expect(
        caller.delete({
          fileId: 99999,
        })
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("getById procedure", () => {
    it("should reject unauthorized requests", async () => {
      const ctx = createAuthContext();
      ctx.user = null as any;
      const caller = filesRouter.createCaller(ctx);

      await expect(
        caller.getById({
          fileId: 1,
        })
      ).rejects.toThrow(TRPCError);
    });

    it("should handle non-existent files", async () => {
      const ctx = createAuthContext();
      const caller = filesRouter.createCaller(ctx);

      await expect(
        caller.getById({
          fileId: 99999,
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});
