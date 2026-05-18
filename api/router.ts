import { createRouter, publicQuery } from "./middleware";
import { authRouter } from "./routers/auth";
import { taskRouter } from "./routers/task";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
