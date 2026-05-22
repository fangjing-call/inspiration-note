import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { tasks } from "@db/schema";
import { eq, and, isNull, isNotNull, desc } from "drizzle-orm";
import { initDb } from "../_init-db";

export const taskRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    await initDb();
    const db = getDb();
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, ctx.userId))
      .orderBy(desc(tasks.createdAt));
    return result;
  }),

  create: authedQuery
    .input(z.object({ content: z.string().min(1).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      await initDb();
      const db = getDb();
      const result = await db
        .insert(tasks)
        .values({
          userId: ctx.userId,
          content: input.content,
          completed: false,
        })
        .returning();
      return result[0];
    }),

  toggleComplete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await initDb();
      const db = getDb();
      const existing = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId)))
        .limit(1);

      if (existing.length === 0) {
        return null;
      }

      const newCompleted = !existing[0].completed;
      await db
        .update(tasks)
        .set({ completed: newCompleted })
        .where(eq(tasks.id, input.id));

      return { ...existing[0], completed: newCompleted };
    }),

  update: authedQuery
    .input(z.object({ id: z.number(), content: z.string().min(1).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      await initDb();
      const db = getDb();
      await db
        .update(tasks)
        .set({ content: input.content })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId)));
      return { id: input.id, content: input.content };
    }),

  softDelete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await initDb();
      const db = getDb();
      await db
        .update(tasks)
        .set({ deletedAt: new Date() })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId)));
      return { success: true };
    }),

  restore: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await initDb();
      const db = getDb();
      await db
        .update(tasks)
        .set({ deletedAt: null })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.userId)));
      return { success: true };
    }),

  clearCompleted: authedQuery.mutation(async ({ ctx }) => {
    await initDb();
    const db = getDb();
    await db
      .update(tasks)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(tasks.userId, ctx.userId),
          eq(tasks.completed, true),
          isNull(tasks.deletedAt)
        )
      );
    return { success: true };
  }),

  clearTrash: authedQuery.mutation(async ({ ctx }) => {
    await initDb();
    const db = getDb();
    await db
      .delete(tasks)
      .where(and(eq(tasks.userId, ctx.userId), isNotNull(tasks.deletedAt)));
    return { success: true };
  }),
});
