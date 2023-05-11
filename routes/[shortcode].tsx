import { HandlerContext } from "$fresh/server.ts";
import {
  Key,
  DB,
} from "../lib.ts";

const redirectForShortcode = async (shortcode: string, ip: string) => {
  // check for shortcode existence;
  const originalBox = await DB.get([Key.Shortcode, shortcode]);
  const original = originalBox.value?.value;
  if (!original) {
      console.warn(`Cannot resolve shortcode: '${shortcode}'`);
      return new Response(`Invalid shortcode: ${shortcode}`, {status: 404});
  }
  const key = [Key.Visitor, shortcode, ip];
  const value = { value: 1n };
  const newVisitor = await DB.atomic()
      .check({ key, versionstamp: null }) // `null` versionstamps mean 'no value'
      .set(key, value)
      .commit();

  const totalUniqueKey = [Key.VisitorSum, shortcode];
  const totalVisitsKey = [Key.VisitSum, shortcode];

  if (newVisitor?.ok) {
    await DB.atomic().sum(totalUniqueKey, 1n).commit();
  }

  await DB.atomic().sum(totalVisitsKey, 1n).commit();

  return Response.redirect(original, 302);
}

export const handler = async (req: Request, ctx: HandlerContext) => {
  const { url: rawUrl } = req;
  const url = new URL(rawUrl);
  const { origin, pathname } = url;
  const shortcode = pathname.replace(/^\/+/g, '').trim();
  if (!shortcode) {
    return Response.redirect(origin, 302)
  }
  const { hostname: remoteIp } = ctx.remoteAddr as Deno.NetAddr;
  return await redirectForShortcode(shortcode, remoteIp); 
};
