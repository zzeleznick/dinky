// routes/_middleware.ts
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookie, jwtVerify, EmptyTokenError } from "../lib/auth.ts";


interface State {
  user?: string;
}

const ASSET_PATH_EXP = /(^\/_frsh)|(^\/(logo\.svg|favicon\.ico))/

const isAssetPath = (pathname: string) => {
  return ASSET_PATH_EXP.test(pathname)
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const { pathname } = new URL(req.url);
  const start = performance.now();
  if (isAssetPath(pathname)) {
    return await ctx.next();
  }
  const jwt = getCookie(req);
  let user: undefined | string;
  try {
    const payload = await jwtVerify(jwt);
    user = payload.sub
  } catch(err) {
    if (err instanceof EmptyTokenError) {
      // pass
    } else {
      console.error(`JWT err: ${err}`)
    }
  }
  ctx.state.user = user;
  const resp = await ctx.next();
  const diff = Math.floor(performance.now() - start);
  console.log(`Request for pathname: '${pathname}' url: ${req.url} took ${diff} ms | ${user}`);
  resp.headers.set("X-ZZ", "awesome");
  return resp;
}


    