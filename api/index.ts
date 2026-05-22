import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";

// Simple Node.js handler for Vercel
export default async function handler(
  req: { url?: string; method?: string; headers?: Record<string, string> },
  res: { statusCode?: number; setHeader?: (k: string, v: string) => void; end?: (data: string) => void }
) {
  try {
    // Build full URL
    const protocol = req.headers?.["x-forwarded-proto"] || "https";
    const host = req.headers?.["host"] || "localhost";
    const url = `${protocol}://${host}${req.url || "/"}`;

    // Create Request object from Node.js request
    const request = new Request(url, {
      method: req.method || "GET",
      headers: new Headers(req.headers as Record<string, string>),
    });

    // Handle tRPC requests
    if (req.url?.startsWith("/api/trpc")) {
      const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext,
      });

      // Send response
      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        res.setHeader?.(key, value);
      });
      const body = await response.text();
      res.end?.(body);
      return;
    }

    // Simple ping for health check
    if (req.url === "/api/ping" || req.url === "/api/") {
      res.statusCode = 200;
      res.setHeader?.("Content-Type", "application/json");
      res.end?.(JSON.stringify({ ok: true, ts: Date.now() }));
      return;
    }

    // 404
    res.statusCode = 404;
    res.setHeader?.("Content-Type", "application/json");
    res.end?.(JSON.stringify({ error: "Not Found" }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader?.("Content-Type", "application/json");
    res.end?.(JSON.stringify({ error: err.message || "Internal Server Error" }));
  }
}
