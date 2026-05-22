// Ultra-minimal test - no imports, no async
export default function handler(request: Request): Response {
  const url = new URL(request.url);
  
  if (url.pathname === "/api/ping" || url.pathname === "/api/") {
    return new Response(JSON.stringify({ ok: true, time: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname.startsWith("/api/trpc")) {
    // Don't import anything - just return a test response
    return new Response(
      JSON.stringify({ 
        result: { data: { ok: true, ts: Date.now() } }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
