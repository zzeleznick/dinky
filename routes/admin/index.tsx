import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { asset, Head } from "$fresh/runtime.ts";
import { getAllLinks } from "../../lib/api.ts";
import {
  publishableKey,
  frontendApi,
} from "../../lib/auth.ts";
import Header from "../../components/Header.tsx";
import DeleteAll from "../../islands/DeleteAll.tsx";
import LinkList from "../../components/LinkList.tsx";
import { CtxData, extractDataFromCtx, } from "../../lib/handler.ts";


export const handler: Handlers = {
  async GET(req: Request, ctx: HandlerContext)  {
    const { origin: targetUrl } = new URL(req.url);
    const {admin, avatar} = extractDataFromCtx(ctx);
    const links = await getAllLinks();
    return ctx.render({admin, avatar, links, targetUrl});
  },
}

export default function Page({ data }: PageProps<CtxData>) {
  const { admin, avatar, targetUrl, links = [] } = data;
  const deletionEndpoint = `${targetUrl}/admin/deleteAll`;
  return (
    <>
      <Head>
        <title>🦕 Dinky Admin View</title>
        <link rel="stylesheet" href={asset("/styles/globals.css")} />
      </Head>
      <body>
        <Header admin={admin} avatar={avatar} frontendApi={frontendApi} publicKey={publishableKey} />
        <div class="p-4 mx-auto min-w-[320px] max-w-screen-md">
          <LinkList title={"All Links"} targetUrl={targetUrl} links={links} />
          <div class="font-bold text-lg md:text-2xl pt-12 pb-2">
            Admin Actions
          </div>
          <DeleteAll dryRun={false} targetUrl={deletionEndpoint}/>
        </div>
      </body>
    </>
  );
}