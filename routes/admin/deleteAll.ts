import { HandlerContext, Handlers } from "$fresh/server.ts";
import { __unsafe__drop_db } from "../../lib/api.ts";

export const handler: Handlers = {
  async POST(_req: Request, _ctx: HandlerContext) {
    const resp = await __unsafe__drop_db();
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  },
};
