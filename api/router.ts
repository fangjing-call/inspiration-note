import { createRouter, publicQuery } from "./middleware";
import { authRouter } from "./routers/auth";
import { taskRouter } from "./routers/task";
import { initDb } from "./_init-db";

export const appRouter = createRouter({
  ping: publicQuery.query(async () => {
    await initDb();
    return { ok: true, ts: Date.now() };
  }),
  auth: authRouter,
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
