// routes/_middleware.ts
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookie, jwtVerify } from "../lib/auth.ts";

interface State {
  data: string;
}

const PUBLIC_PATH_EXP = /(^\/_frsh)|(^\/(logo\.svg|favicon\.ico))/

const isPublic = (pathname: string) => {
    return PUBLIC_PATH_EXP.test(pathname)
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const { pathname } = new URL(req.url);
  const start = performance.now();
  if (isPublic(pathname)) {
    return await ctx.next();
  }
  const jwt = getCookie(req);
  try {
    await jwtVerify(jwt);
  } catch(err) {
    console.error(`JWT err: ${err}`)
  }
  ctx.state.data = jwt;
  const resp = await ctx.next();
  const diff = Math.floor(performance.now() - start);
  console.log(`Request for pathname: '${pathname}' url: ${req.url} took ${diff} ms | ${jwt}`);
  resp.headers.set("X-ZZ", "awesome");
  return resp;
}


    