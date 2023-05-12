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
  links?: string[];
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

const shortcodeForUrl = async (targetUrl: URL, srcUrl: URL, user: string) => {
  const { href, hostname: targetHostname } = targetUrl;
  const shortcode = randomString();
  const createdTs = (new Date()).getTime();
  const primaryKey = [Key.Shortcode, shortcode];
  const byUserKey = [Key.ShortcodeByUser, user, shortcode];
  const value = { value: href, user, shortcode, createdTs };

  const newShortcode = await DB.atomic()
      .check({ key: primaryKey, versionstamp: null }) // `null` versionstamps mean 'no value'
      .set(primaryKey, value)
      .set(byUserKey, value)
      .commit();

  const hostnameKey = [Key.Hostname, targetHostname];
  const linkKey = [Key.OriginalLink, href];

  if (!newShortcode?.ok) {
    console.error(`Duplicate Shortcode: ${shortcode}`);
    return new Response(`Duplicate Shortcode Error!`, {status: 500});
  }

  await DB.atomic().sum(hostnameKey, 1n).commit();
  await DB.atomic().sum(linkKey, 1n).commit();
  const fullUrl = `${srcUrl.href.replace(/\/+$/g, '')}/${shortcode}`;
  const resp =  {
    original: href,
    shortcode,
    fullUrl,
  }
  return new Response(JSON.stringify(resp), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}

const getLinksForUser = async (user: string) => {
  const iter = DB.list({ prefix: [Key.ShortcodeByUser, user] });
  const links = [];
  for await (const { value, key } of iter) {
    links.push({key, ...value});
  }
  return links;
}

export const handler: Handlers<Data | null> = {
  async GET(req: Request, ctx: HandlerContext)  {
    const { href: targetUrl } = new URL(req.url);
    const user = ctx.state?.user;
    let links = [];
    if (user) {
      links = await getLinksForUser(user);
    }
    console.log(`Links: ${JSON.stringify(links)}`);
    return ctx.render({targetUrl, links});
  },
  async POST(req: Request, ctx: HandlerContext)  {
    const { hostname: remoteIp } = ctx.remoteAddr as Deno.NetAddr;
    const user = ctx.state?.user || remoteIp;
    const srcUrl = new URL(req.url);
    const buf = await req.arrayBuffer();
    const body = Decoder.decode(buf);
    const link = extractLink(body);
    if (!link) {
      return new Response('Malformed Request', { status: 400 });
    }
    return await shortcodeForUrl(link, srcUrl, user);
  },
};

export default function Page({ data }: PageProps<Data>) {
  const { targetUrl, links } = data;
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
        <Header frontendApi={frontendApi} publicKey={publishableKey} />
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
