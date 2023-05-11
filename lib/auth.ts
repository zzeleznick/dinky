import type { MiddlewareHandlerContext } from "$fresh/server.ts";
import Clerk from "@clerk/clerk-js";
import * as jose from 'jose';

import { getCookies } from "std/http/cookie.ts";
import { redirect } from "./http.ts";

export const PK = Deno.env.get("CLERK_PUBLISHABLE_KEY")!;
export const clerk = new Clerk(PK);
export const frontendApi = clerk.frontendApi;

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

class TokenError extends Error {
  error_msg: string;
  status: number;
  constructor(msg: string) {
      super(msg);
      this.name = 'TokenError';
      this.error_msg = msg
      this.status = 401
  }
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
  } catch(err) {
    if((err as JWTClaimValidationFailed).code == "ERR_JWT_EXPIRED") {
      console.warn(`JWT is expired`);
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

export async function ensureLoggedInMiddleware(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  if (!ctx.state.session) {
    return redirect(`/login?redirect_url=${encodeURIComponent(req.url)}`);
  }

  return await ctx.next();
}