import type { MiddlewareHandlerContext } from "$fresh/server.ts";
import Clerk from "@clerk/clerk-js";
import * as jose from 'jose';

import { getCookies } from "std/http/cookie.ts";
import { redirect } from "./http.ts";

import { TokenError } from "./error.ts";

export const publishableKey = Deno.env.get("CLERK_PUBLISHABLE_KEY")!;
export const clerk = new Clerk(publishableKey);
export const frontendApi = clerk.frontendApi;

const ADMIN_ID = Deno.env.get("CLERK_ADMIN_ID")!;
const CLERK_KID = Deno.env.get("CLERK_KID")!;
const CLERK_N = Deno.env.get("CLERK_N")!;

const LocalWellKnownKeys = [
  {
    "alg": "RS256",
    "e": "AQAB",
    "kid": CLERK_KID,
    "kty": "RSA",
    "n": CLERK_N,
    "use": "sig"
  },
]

interface JWTClaimValidationFailed {
  code: string;
}


export class TokenExpiredError extends TokenError {
  constructor(msg: string) {
    super(msg);
    this.name = 'TokenExpiredError';
  }
}

export class EmptyTokenError extends TokenError {
  constructor(msg: string) {
    super(msg);
    this.name = 'EmptyTokenError';
  }
}

export class MissingPublicKeyError extends TokenError {
  constructor(msg: string) {
    super(msg);
    this.name = 'MissingPublicKeyError';
  }
}

export class PublicKeyMismatchError extends TokenError {
  constructor(msg: string) {
    super(msg);
    this.name = 'PublicKeyMismatchError';
  }
}

export class TokenSignatureError extends TokenError {
  constructor(msg: string) {
    super(msg);
    this.name = 'TokenSignatureError';
  }
}

export class UnknownTokenError extends TokenError {
  constructor(msg: string) {
    super(msg);
    this.name = 'UnknownTokenError';
  }
}

export const getCookie = (req: Request, name = "__session") => {
  const cookie = getCookies(req.headers)[name] ?? "";
  return decodeURIComponent(cookie);
}

export const jwtVerify = async (jwt: string) => {
  const publicKey = await jose.importJWK(LocalWellKnownKeys?.[0], "RS256");
  if (!jwt) {
    throw new EmptyTokenError('Please log in')
  }
  try {
    const decoded = await jose.jwtVerify(jwt, publicKey, {});
    const { payload } = decoded;
    console.log(`Payload: ${JSON.stringify(payload)}`);
    return payload;
  } catch (err) {
    if ((err as JWTClaimValidationFailed).code == "ERR_JWT_EXPIRED") {
      console.warn(`warn: JWT is expired`);
      throw new TokenExpiredError('Try logging in again')
    } else if ((err as JWTClaimValidationFailed).code == "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
      console.error(`JWT failed signature validation`);
      throw new TokenSignatureError('Try logging in again')
    } else {
      console.error(`JWT failed validation`, err);
      throw new UnknownTokenError('Try logging in again')
    }
  }
}

export interface CtxWithAuth {
  user?: string;
}

export const addUserToReqCtx = async (
  req: Request,
  ctx: MiddlewareHandlerContext<CtxWithAuth>,
) => {
  const jwt = getCookie(req);
  let user: undefined | string;
  try {
    const payload = await jwtVerify(jwt);
    user = payload.sub
  } catch (err) {
    if (err instanceof EmptyTokenError) {
      // pass
    } else if (err instanceof TokenExpiredError) {
     // pass
    } else {
      console.error(`JWT err: ${err}`)
    }
  }
  ctx.state.user = user;
}

export const ensureLoggedInMiddleware = async (
  req: Request,
  ctx: MiddlewareHandlerContext<CtxWithAuth>,
) => {

  if (!ctx.state.user) {
    return redirect(`/login?redirect_url=${encodeURIComponent(req.url)}`);
  }

  return await ctx.next();
}

export const ensureAdminMiddleware = async (
  req: Request,
  ctx: MiddlewareHandlerContext<CtxWithAuth>,
) => {

  console.log('ensureAdminMiddleware', ctx.state.user, ADMIN_ID);

  if (!(ADMIN_ID && ctx.state.user === ADMIN_ID)) {
    return redirect(`/login?redirect_url=${encodeURIComponent(req.url)}`);
  }

  return await ctx.next();
}