import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "inspo-note-secret-key-change-in-production"
);

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  userId?: number;
  username?: string;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const req = opts.req;
  const resHeaders = opts.resHeaders;

  // Try to extract user from JWT token
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
      return {
        req,
        resHeaders,
        userId: payload.userId as number,
        username: payload.username as string,
      };
    } catch {
      // Invalid token, continue as unauthenticated
    }
  }

  return { req, resHeaders };
}

export { JWT_SECRET };
