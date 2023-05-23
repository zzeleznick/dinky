import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { asset, Head } from "$fresh/runtime.ts";
import Header from "../components/Header.tsx";
import CodeBlock from "../components/CodeBlock.tsx";
import LinkList from "../components/LinkList.tsx";
import { frontendApi, publishableKey } from "../lib/auth.ts";

import { getLinksForUser } from "../lib/api.ts";

import { CtxData, extractDataFromCtx } from "../lib/handler.ts";

const exampleLink = "https://jsonplaceholder.typicode.com/todos/1";

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
};

export default function Page({ data }: PageProps<CtxData>) {
  const {
    admin,
    avatar,
    user,
    targetUrl,
    links = [],
  } = data;
  const text = `curl -d '{"link": "${exampleLink}"}' ${
    targetUrl.replace(/\/+$/g, "")
  }`;

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
          <div class="py-6 flex flex-col gap-8">
            <div>Try running</div>
            <CodeBlock text={text} />
            <div>to get started</div>
          </div>
          <LinkList targetUrl={targetUrl} links={links} />
        </div>
      </body>
    </>
  );
}
