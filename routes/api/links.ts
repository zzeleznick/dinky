import { HandlerContext } from "$fresh/server.ts";
import { getLinksForUser } from "../../lib/api.ts";
import { extractDataFromCtx } from "../../lib/handler.ts";

export const handler = async (_req: Request, ctx: HandlerContext) => {
  const { user } = extractDataFromCtx(ctx);
  let links = [];
  if (user) {
    links = await getLinksForUser(user);
  }
  return Response.json({ links });
};
