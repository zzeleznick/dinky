// routes/admin/_middleware.ts
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { CtxWithAuth, ensureAdminMiddleware } from "../../lib/auth.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<CtxWithAuth>,
) {
  const { pathname } = new URL(req.url);
  const resp = await ensureAdminMiddleware(req, ctx);
  console.log(`Admin pathname: '${pathname}', url: ${req.url}`);
  return resp;
}
