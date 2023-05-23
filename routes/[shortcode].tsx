import { HandlerContext } from "$fresh/server.ts";
import { redirectForShortcode } from "../lib/api.ts";

export const handler = async (req: Request, ctx: HandlerContext) => {
  const { url: rawUrl } = req;
  const url = new URL(rawUrl);
  const { origin, pathname } = url;
  const shortcode = pathname.replace(/^\/+/g, "").trim();
  if (!shortcode) {
    return Response.redirect(origin, 302);
  }
  const { hostname: remoteIp } = ctx.remoteAddr as Deno.NetAddr;
  return await redirectForShortcode(shortcode, remoteIp);
};
