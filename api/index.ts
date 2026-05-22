import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";

// Vercel API route - handles /api/* requests
// Vercel strips /api prefix, so /api/trpc/* becomes /trpc/*
export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Handle tRPC requests
  if (url.pathname.startsWith("/trpc")) {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext,
    });
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
