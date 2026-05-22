import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { JWT_SECRET } from "../context";
import { initDb } from "../_init-db";

export const authRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6).max(100),
      })
    )
    .mutation(async ({ input }) => {
      await initDb();
      const db = getDb();

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "用户名已被注册",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      const result = await db
        .insert(users)
        .values({
          username: input.username,
          passwordHash,
        })
        .returning();

      const user = result[0];

      const token = await new SignJWT({ userId: user.id, username: user.username })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(JWT_SECRET);

      return { token, user: { id: user.id, username: user.username } };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      await initDb();
      const db = getDb();

      const found = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (found.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "用户名或密码错误",
        });
      }

      const user = found[0];
      const valid = await bcrypt.compare(input.password, user.passwordHash);

      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "用户名或密码错误",
        });
      }

      const token = await new SignJWT({ userId: user.id, username: user.username })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(JWT_SECRET);

      return { token, user: { id: user.id, username: user.username } };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    await initDb();
    if (!ctx.userId) {
      return null;
    }

    const db = getDb();
    const found = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);

    if (found.length === 0) {
      return null;
    }

    return { id: found[0].id, username: found[0].username };
  }),
});
