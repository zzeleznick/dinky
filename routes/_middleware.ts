// routes/_middleware.ts
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { addUserToReqCtx, ensureLoggedInMiddleware, CtxWithAuth } from "../lib/auth.ts";

const ASSET_PATH_EXP = /(^\/_frsh)|(^\/styles)|(^\/(logo\.svg|favicon\.ico))/
const PROTECTED_PATH_EXP = /(^\/stats)/

const isAssetPath = (pathname: string) => {
  return ASSET_PATH_EXP.test(pathname)
}

const isProtectedPath = (pathname: string) => {
  return PROTECTED_PATH_EXP.test(pathname)
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<CtxWithAuth>,
) {
  const { pathname } = new URL(req.url);
  const start = performance.now();
  // MARK: skip auth for asset paths
  if (isAssetPath(pathname)) {
    return await ctx.next();
  }
  // MARK: add user if present
  await addUserToReqCtx(req, ctx);
  // MARK: validate request for protected paths
  let resp;
  if (isProtectedPath(pathname)) {
    resp = await ensureLoggedInMiddleware(req, ctx)
    resp.headers.set("X-Dinky-Authed", "true");
  } else { // skip auth check
    resp = await ctx.next();
  }
  const diff = Math.floor(performance.now() - start);
  console.log(`Request for pathname: '${pathname}' url: ${req.url} took ${diff} ms`);
  resp.headers.set("X-Dinky", "Linky");
  return resp;
}

    