import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req;

  if (url === "/api/ping" || url === "/api/") {
    return res.status(200).json({ ok: true, ts: Date.now() });
  }

  if (url?.startsWith("/api/trpc")) {
    // TODO: implement tRPC handler
    return res.status(200).json({ 
      result: { data: { ok: true, msg: "trpc endpoint ready", ts: Date.now() } }
    });
  }

  return res.status(404).json({ error: "Not Found" });
}
