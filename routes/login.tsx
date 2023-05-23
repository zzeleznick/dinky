import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import SignIn from "../islands/SignIn.tsx";

import { frontendApi, publishableKey } from "../lib/auth.ts";

interface LoginProps {
  path: string;
  redirectUrl?: string;
}

export const handler = (req: Request, ctx: HandlerContext) => {
  console.log(`login route with url ${req.url}`);
  const { pathname, searchParams } = new URL(req.url);
  const redirectUrl = searchParams && searchParams.get("redirect_url");
  return ctx.render({ redirectUrl, path: pathname });
};

export default function Page({ data }: PageProps<LoginProps>) {
  const { path, redirectUrl } = data;
  return (
    <>
      <Head>
        <title>🦕 Dinky Login</title>
      </Head>
      <body>
        <div className="flex flex-row min-h-screen bg-gray-200 items-center justify-center">
          <SignIn
            path={path}
            redirectUrl={redirectUrl}
            publicKey={publishableKey}
            frontendApi={frontendApi}
            showOnLoad={true}
          />
        </div>
      </body>
    </>
  );
}
