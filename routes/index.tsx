import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import Counter from "../islands/Counter.tsx";
import {
  Key,
  DB,
  randomString,
} from "../lib.ts";

interface Data {
  hostname: string;
  port?: number;
}

const Decoder = new TextDecoder();
const exampleLink = 'https://jsonplaceholder.typicode.com/todos/1';

const buildOutUrl = (hostname: string, port?: number, shortcode = '') => {
  const protocol = (hostname == "localhost" || hostname == "127.0.0.1") ? "http:" : "https:";
  port = port ? `:${port}` : '';
  shortcode = shortcode ? `/${shortcode}` : '';
  return `${protocol}//${hostname}${port}${shortcode}`
}

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
  return;
}

const shortcodeForUrl = async (targetUrl: URL, srcHostname: string, port?: number) => {
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

  const outUrl = buildOutUrl(srcHostname, port, shortcode);
  return new Response(`Original: ${href}\nShortcode: ${shortcode}\nOut: ${outUrl}\n`);
}

export const handler: Handlers<Data | null> = {
  async GET(req: Request, ctx: HandlerContext)  {
    const { hostname, port } = ctx.localAddr as Deno.NetAddr;
    return ctx.render({port, hostname});
  },
  async POST(req: Request, ctx: HandlerContext)  {
    const { hostname: srcHostname, port } = ctx.localAddr as Deno.NetAddr;
    const buf = await req.arrayBuffer();
    const body = await Decoder.decode(buf);
    const link = extractLink(body);
    if (!link) {
      return new Response('Malformed Request', { status: 400 });
    }
    return await shortcodeForUrl(link, srcHostname, port);
  },
};

export default function Page({ data }: PageProps<Data>) {
  const { hostname, port } = data;
  const targetUrl = buildOutUrl(hostname, port, '');
  const text = `curl -d '{"link": "${exampleLink}"}' ${targetUrl}`
  const codeBlock = <pre class="pb-4"><code> {text} </code></pre>
  return (
    <>
      <Head>
        <title>🦕 Dinky</title>
      </Head>
      <body>
        <div class="p-4 mx-auto max-w-screen-md">
          <img
            src="/logo.svg"
            class="w-32 h-32"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <p class="py-6">
            Try running {codeBlock} to get started
          </p>
          <Counter start={3} />
        </div>
      </body>
    </>
  );
}
