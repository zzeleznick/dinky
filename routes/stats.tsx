import { HandlerContext } from "$fresh/server.ts";

export const handler = (_req: Request, ctx: HandlerContext): Response => {
  const user = ctx.state?.user;
  console.log(`user: ${user}`);
  return new Response(`stats page for user: ${user}`);
};
