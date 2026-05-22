import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { getRequestListener } from "@hono/node-server";
import type { IncomingMessage, ServerResponse } from "http";

const app = new Hono().basePath("/api");

app.all("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/*", (c) => c.json({ error: "Not Found" }, 404));

// Vercel Node.js handler
export default (req: IncomingMessage, res: ServerResponse) => {
  const listener = getRequestListener(app.fetch);
  return listener(req, res);
};
