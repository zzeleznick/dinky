import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { asset, Head } from "$fresh/runtime.ts";
import Header from "../components/Header.tsx";
import DynamicLinkList from "../islands/DynamicLinkList.tsx";
import { frontendApi, publishableKey } from "../lib/auth.ts";

import {
  DuplicateShortcodeError,
  extractLink,
  getLinksForUser,
  shortcodeForUrl,
} from "../lib/api.ts";

import { CtxData, extractDataFromCtx } from "../lib/handler.ts";

const Decoder = new TextDecoder();

export const handler: Handlers = {
  async GET(req: Request, ctx: HandlerContext) {
    const { href: targetUrl } = new URL(req.url);
    const { user, admin, avatar } = extractDataFromCtx(ctx);
    let links = [];
    if (user) {
      links = await getLinksForUser(user);
    }
    return ctx.render({ admin, avatar, user, targetUrl, links });
  },
  async POST(req: Request, ctx: HandlerContext) {
    const { hostname: remoteIp } = ctx.remoteAddr as Deno.NetAddr;
    const user = (ctx.state?.user as string) || remoteIp;
    const srcUrl = new URL(req.url);
    const buf = await req.arrayBuffer();
    const body = Decoder.decode(buf);
    const link = extractLink(body);
    if (!link) {
      return new Response("Malformed Request", { status: 400 });
    }
    try {
      const resp = await shortcodeForUrl(link, srcUrl, user);
      return new Response(JSON.stringify(resp), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    } catch (err) {
      if (err instanceof DuplicateShortcodeError) {
        return new Response(`Duplicate Shortcode Error!`, { status: 500 });
      }
      console.error(`Unexpected error: ${err}`);
      return new Response(`An unexpected error has occurred :(`, {
        status: 500,
      });
    }
  },
};

export default function Page({ data }: PageProps<CtxData>) {
  const {
    admin,
    avatar,
    user,
    targetUrl,
    links = [],
  } = data;

  return (
    <>
      <Head>
        <title>🦕 Dinky</title>
        <link rel="stylesheet" href={asset("/styles/globals.css")} />
      </Head>
      <body>
        <Header
          admin={admin}
          avatar={avatar}
          user={user}
          frontendApi={frontendApi}
          publicKey={publishableKey}
        />
        <div class="p-4 mx-auto min-w-[320px] max-w-screen-md">
          <img
            src="/logo.svg"
            class="w-32 h-32"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <h1 class="text-xl md:text-2xl font-bold">Dinky Linky</h1>
          <DynamicLinkList targetUrl={targetUrl} links={links} />
        </div>
      </body>
    </>
  );
}
