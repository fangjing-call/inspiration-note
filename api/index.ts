export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/ping" || url.pathname === "/api/") {
    return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname.startsWith("/api/trpc")) {
    try {
      const { fetchRequestHandler } = await import("@trpc/server/adapters/fetch");
      const { appRouter } = await import("./router");
      const { createContext } = await import("./context");
      return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext,
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ 
          error: "API Error", 
          message: err?.message || String(err),
          name: err?.name,
          stack: err?.stack?.split('\n').slice(0, 5)
        }, null, 2),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
