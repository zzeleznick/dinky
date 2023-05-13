import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { asset, Head } from "$fresh/runtime.ts";
import CopyButton from "../islands/CopyButton.tsx";
import CreateLink from "../islands/CreateLink.tsx";
import Header from "../components/Header.tsx";
import {
  publishableKey,
  frontendApi,
} from "../lib/auth.ts";

import {
  DuplicateShortcodeError,
  shortcodeForUrl,
  getLinksForUser,
} from "../lib/api.ts";

import { CtxData, extractDataFromCtx, } from "../lib/handler.ts";

const Decoder = new TextDecoder();
const exampleLink = 'https://jsonplaceholder.typicode.com/todos/1';

const extractLink = (body: string) => {
  let link = '';
  console.log(`User posted: '${body}'`);
  try {
    const data = JSON.parse(body);
    link = data.link;
  } catch (err) {
    console.error(`JSON parse error: ${err}`);
    return; 
  }

  link = `${link.toString().trim()}`
  if (!link) {
    console.warn(`No link!`);
    return; 
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(link);
    return targetUrl
  } catch (err) {
    console.error(`URL parse error: ${err}`);
    return;
  }
}

export const handler: Handlers = {
  async GET(req: Request, ctx: HandlerContext)  {
    const { href: targetUrl } = new URL(req.url);
    const {user, admin, avatar} = extractDataFromCtx(ctx);
    let links = [];
    if (user) {
      links = await getLinksForUser(user);
    }
    return ctx.render({admin, avatar, user, targetUrl, links});
  },
  async POST(req: Request, ctx: HandlerContext)  {
    const { hostname: remoteIp } = ctx.remoteAddr as Deno.NetAddr;
    const user = (ctx.state?.user as string) || remoteIp;
    const srcUrl = new URL(req.url);
    const buf = await req.arrayBuffer();
    const body = Decoder.decode(buf);
    const link = extractLink(body);
    if (!link) {
      return new Response('Malformed Request', { status: 400 });
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
      return new Response(`An unexpected error has occurred :(`, { status: 500 });
    }
  },
};

export default function Page({ data }: PageProps<CtxData>) {
  const {
    admin,
    avatar,
    user,
    targetUrl,
    links = []
  } = data;
  const text = `curl -d '{"link": "${exampleLink}"}' ${targetUrl.replace(/\/+$/g, '')}`
  const codeBlock = (
    <div>
      <div class="h-8 w-full bg-gray-200 flex justify-end">
        <CopyButton className="px-4" content={text} />
      </div>
       <pre class="px-2 py-4 relative break-all md:break-normal whitespace-pre-line bg-gray-100">
        <code class="text-xs md:text-sm">{text}</code>
      </pre>
    </div>
  )
  const linkList = links.map((v, i) => {
    const {
      shortcode,
      value: href,
    } = v
    const arrow = shortcode ? "→" : null;
    const linkOut = shortcode ? (
      <a href={`${targetUrl}${shortcode}`} target="_blank" className="underline min-w-[42px]">
        {targetUrl}{shortcode}
      </a>
    ) : null;
    return (
      <li class="flex flex-row gap-2" key={i}>
        <span className="min-w-[20px]">{i+1}{"."}</span>
        <a href={href} target="_blank">
          {href}
        </a>
        { arrow }
        { linkOut }
      </li>
    );
  })

  let myLinks = null;
  if (linkList.length) {
    myLinks = (
      <div class="flex flex-col">
        <div class="text-lg pb-2">My Links</div>
        <ol class="my-links">
          { linkList }
        </ol>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>🦕 Dinky</title>
        <link rel="stylesheet" href={asset("/styles/globals.css")} />
      </Head>
      <body>
        <Header admin={admin} avatar={avatar} user={user} frontendApi={frontendApi} publicKey={publishableKey} />
        <div class="p-4 mx-auto max-w-screen-md">
          <img
            src="/logo.svg"
            class="w-32 h-32"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <h1 class="text-xl md:text-2xl font-bold">Dinky Linky</h1>
          <div class="py-6 flex flex-col gap-8">
            <div>Try running</div>
            {codeBlock} 
            <div>to get started</div>
          </div>
          <div class="py-6">Or click on the button below!</div>
          <div class="flex items-center justify-center h-8">
            <CreateLink targetUrl={targetUrl}/>
          </div>
          { myLinks }
        </div>
      </body>
    </>
  );
}
