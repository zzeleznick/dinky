import { HandlerContext, PageProps } from "$fresh/server.ts";
import { asset, Head } from "$fresh/runtime.ts";
import { getAllLinks } from "../../lib/api.ts";
import { LinkDatumWithKey } from "../../lib/db.ts";
import {
  publishableKey,
  frontendApi,
} from "../../lib/auth.ts";
import Header from "../../components/Header.tsx";

interface Data {
  targetUrl: string;
  admin?: boolean;
  links?: LinkDatumWithKey[];
}

export const handler = async (req: Request, ctx: HandlerContext) => {
  const { origin: targetUrl } = new URL(req.url);
  const admin = ctx.state?.admin;
  const links = await getAllLinks();
  return ctx.render({admin, links, targetUrl});
};

export default function Page({ data }: PageProps<Data>) {
  const { admin, targetUrl, links = [] } = data;

  const linkList = links.map((v, i) => {
    const {
      key,
      value: href,
    } = v
    const shortcode = key?.[key.length - 1];
    const arrow = shortcode ? "→" : null;
    const linkOut = shortcode ? (
      <a href={`${targetUrl}/${shortcode}`} target="_blank" className="underline min-w-[42px]">
        {targetUrl}{"/"}{shortcode}
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
        <div class="font-bold text-lg md:text-2xl pb-2">All Links</div>
        <ol class="my-links">
          { linkList }
        </ol>
      </div>
    )
  } else {
    myLinks = (
      <div class="flex flex-col">
        <div class="font-bold text-lg md:text-2xl">No Links Yet!</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>🦕 Dinky Admin View</title>
        <link rel="stylesheet" href={asset("/styles/globals.css")} />
      </Head>
      <body>
      <Header admin={admin} frontendApi={frontendApi} publicKey={publishableKey} />
        <div class="p-4 mx-auto max-w-screen-md">
          { myLinks }
        </div>
      </body>
    </>
  );
}