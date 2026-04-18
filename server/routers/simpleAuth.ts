import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { sdk } from "../_core/sdk";
import { ENV } from "../_core/env";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import * as db from "../db";

/**
 * Simple username/password authentication router.
 * Credentials are stored in APP_USERNAME and APP_PASSWORD env vars.
 * On success, issues the same JWT session cookie as the OAuth flow.
 */
export const simpleAuthRouter = router({
  /**
   * Login with username and password
   */
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check credentials against env-configured values
      const isValidUsername = input.username === ENV.appUsername;
      const isValidPassword = input.password === ENV.appPassword;

      if (!isValidUsername || !isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      // Use a deterministic synthetic openId for the local owner
      const ownerOpenId = ENV.ownerOpenId || "local-owner";

      // Ensure user exists in DB
      await db.upsertUser({
        openId: ownerOpenId,
        name: ENV.appUsername,
        email: null,
        loginMethod: "password",
        role: "admin",
        lastSignedIn: new Date(),
      });

      // Create session token (same JWT used by OAuth flow)
      const sessionToken = await sdk.createSessionToken(ownerOpenId, {
        name: ENV.appUsername,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, username: ENV.appUsername };
    }),

  /**
   * Logout — clears the session cookie
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  /**
   * Get current session user (same as auth.me)
   */
  me: publicProcedure.query((opts) => opts.ctx.user),
});
