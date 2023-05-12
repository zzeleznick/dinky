import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import SignIn from "../islands/SignIn.tsx";

import {
  publishableKey,
  frontendApi,
} from "../lib/auth.ts";

export const handler = (_req: Request, ctx: HandlerContext) => {
  return ctx.render({});
};

export default function Page({ data }: PageProps<unknown>) {
  return (
    <>
      <Head>
        <title>🦕 Dinky Login</title>
      </Head>
      <body>
        <div className="flex flex-row min-h-screen bg-gray-200 items-center justify-center">
          <SignIn publicKey={publishableKey} frontendApi={frontendApi} showOnLoad={true}/>
        </div>
      </body>
    </>
  );
}