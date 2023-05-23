import { HandlerContext } from "$fresh/server.ts";
import { LinkDatumWithKey } from "./db.ts";

export interface CtxData {
  targetUrl: string;
  admin?: boolean;
  avatar?: string;
  user?: boolean;
  links?: LinkDatumWithKey[];
}

export const extractDataFromCtx = (ctx: HandlerContext) => {
  const admin = ctx.state?.admin as boolean | undefined;
  const user = ctx.state?.user as string | undefined;
  const avatar = ctx.state?.avatar as string | undefined;
  return {
    admin,
    avatar,
    user,
  };
};
