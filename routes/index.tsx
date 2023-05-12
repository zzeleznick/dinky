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
  Key,
  DB,
  randomString,
} from "../lib.ts";

interface Data {
  targetUrl: string;
}

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

const shortcodeForUrl = async (targetUrl: URL, srcUrl: URL) => {
  const { href, hostname: targetHostname } = targetUrl;
  const shortcode = randomString();
  const key = [Key.Shortcode, shortcode];
  const value = { value: href };

  const newShortcode = await DB.atomic()
      .check({ key, versionstamp: null }) // `null` versionstamps mean 'no value'
      .set(key, value)
      .commit();

  const hostnameKey = [Key.Hostname, targetHostname];
  const linkKey = [Key.OriginalLink, href];

  if (!newShortcode?.ok) {
    console.error(`Duplicate Shortcode: ${shortcode}`);
    return new Response(`Duplicate Shortcode Error!`, {status: 500});
  }

  await DB.atomic().sum(hostnameKey, 1n).commit();
  await DB.atomic().sum(linkKey, 1n).commit();
  const outUrl = `${srcUrl.href.replace(/\/+$/g, '')}/${shortcode}`;
  return new Response(`Original: ${href}\nShortcode: ${shortcode}\nOut: ${outUrl}\n`);
}
export const handler: Handlers<Data | null> = {
  async GET(req: Request, ctx: HandlerContext)  {
    const { href: targetUrl } = new URL(req.url);
    return ctx.render({targetUrl});
  },
  async POST(req: Request, _ctx: HandlerContext)  {
    // const { hostname: srcHostname, port } = ctx.localAddr as Deno.NetAddr;
    const srcUrl = new URL(req.url);
    const buf = await req.arrayBuffer();
    const body = Decoder.decode(buf);
    const link = extractLink(body);
    if (!link) {
      return new Response('Malformed Request', { status: 400 });
    }
    return await shortcodeForUrl(link, srcUrl);
  },
};

export default function Page({ data }: PageProps<Data>) {
  const { targetUrl } = data;
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
  return (
    <>
      <Head>
        <title>🦕 Dinky</title>
        <link rel="stylesheet" href={asset("/styles/globals.css")} />
      </Head>
      <body>
        <Header frontendApi={frontendApi} publicKey={publishableKey} />
        <div class="p-4 mx-auto max-w-screen-md">
          <img
            src="/logo.svg"
            class="w-32 h-32"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <div class="py-6 flex flex-col gap-8">
            <div>Try running</div>
            {codeBlock} 
            <div>to get started</div>
          </div>
          <div class="py-6">Or click on the button below!</div>
          <div class="flex items-center justify-center h-8">
            <CreateLink targetUrl={targetUrl}/>
          </div>
        </div>
      </body>
    </>
  );
}
