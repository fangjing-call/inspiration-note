import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || "/";

  if (url === "/api/ping" || url === "/api/") {
    return res.status(200).json({ ok: true, ts: Date.now() });
  }

  if (url.startsWith("/api/trpc")) {
    try {
      // Convert Node.js req to Fetch API Request
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers["host"] || "localhost";
      const fetchUrl = `${protocol}://${host}${url}`;

      const body = req.method !== "GET" && req.method !== "HEAD"
        ? JSON.stringify(req.body)
        : undefined;

      const request = new Request(fetchUrl, {
        method: req.method,
        headers: new Headers(Object.entries(req.headers).map(([k, v]) => [k, String(v)])),
        body,
      });

      const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext,
      });

      // Convert Fetch API Response to Node.js res
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const responseBody = await response.text();
      return res.send(responseBody);
    } catch (err: any) {
      console.error("API Error:", err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        name: err.name,
      });
    }
  }

  return res.status(404).json({ error: "Not Found" });
}
