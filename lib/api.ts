import { randomString } from "../lib.ts";
import { DB, Key, LinkDatum } from "./db.ts";
import { BaseError } from "./error.ts";

export class DuplicateShortcodeError extends BaseError {
  constructor(msg: string) {
    super(msg);
    this.name = "DuplicateShortcodeError";
    this.status = 500;
  }
}

export class InvalidShortcode extends BaseError {
  constructor(msg: string) {
    super(msg);
    this.name = "InvalidShortcode";
    this.status = 404;
  }
}

export interface createShortcodeResponse {
  original: string;
  shortcode: string;
  fullUrl: string;
}

export const extractLink = (body: string) => {
  let link = "";
  console.log(`User posted: '${body}'`);
  try {
    const data = JSON.parse(body);
    link = data.link;
  } catch (err) {
    console.error(`JSON parse error: ${err}`);
    return;
  }

  link = `${link.toString().trim()}`;
  if (!link) {
    console.warn(`No link in request body!`);
    return;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(link);
    return targetUrl;
  } catch (err) {
    console.error(`URL parse error: ${err}`);
    return;
  }
};

export const shortcodeForUrl = async (
  targetUrl: URL,
  srcUrl: URL,
  user: string,
) => {
  const { href, hostname: targetHostname } = targetUrl;
  const shortcode = randomString();
  const createdTs = (new Date()).getTime();
  const primaryKey = [Key.Shortcode, shortcode];
  const byUserKey = [Key.ShortcodeByUser, user, shortcode];
  const value = { value: href, user, shortcode, createdTs } as LinkDatum;

  const newShortcode = await DB.atomic()
    .check({ key: primaryKey, versionstamp: null }) // `null` versionstamps mean 'no value'
    .set(primaryKey, value)
    .set(byUserKey, value)
    .commit();

  const hostnameKey = [Key.Hostname, targetHostname];
  const linkKey = [Key.OriginalLink, href];

  if (!newShortcode?.ok) {
    const msg = `Duplicate Shortcode: ${shortcode}`;
    console.error(msg);
    throw new DuplicateShortcodeError(msg);
  }

  await DB.atomic().sum(hostnameKey, 1n).commit();
  await DB.atomic().sum(linkKey, 1n).commit();
  const fullUrl = `${srcUrl.href.replace(/\/+$/g, "")}/${shortcode}`;
  return {
    original: href,
    shortcode,
    fullUrl,
  } as createShortcodeResponse;
};

export const getLinksWithKeys = async (keys: string[]) => {
  const iter = DB.list<LinkDatum>({ prefix: keys });
  const links = [];
  for await (const { value, key } of iter) {
    links.push({ key, ...value });
  }
  return links;
};

export const getLinksForUser = async (user: string) => {
  return await getLinksWithKeys([Key.ShortcodeByUser, user]);
};

export const getAllLinks = async () => {
  return await getLinksWithKeys([Key.ShortcodeByUser]);
};

export const redirectForShortcode = async (shortcode: string, ip: string) => {
  // check for shortcode existence;
  const originalBox = await DB.get([Key.Shortcode, shortcode]);
  const original = originalBox.value?.value;
  if (!original) {
    console.warn(`Cannot resolve shortcode: '${shortcode}'`);
    return new Response(`Invalid shortcode: ${shortcode}`, { status: 404 });
  }
  const key = [Key.Visitor, shortcode, ip];
  const value = { value: 1n };
  const newVisitor = await DB.atomic()
    .check({ key, versionstamp: null }) // `null` versionstamps mean 'no value'
    .set(key, value)
    .commit();

  const totalUniqueKey = [Key.VisitorSum, shortcode];
  const totalVisitsKey = [Key.VisitSum, shortcode];

  if (newVisitor?.ok) {
    await DB.atomic().sum(totalUniqueKey, 1n).commit();
  }

  await DB.atomic().sum(totalVisitsKey, 1n).commit();

  return Response.redirect(original, 302);
};

export const __unsafe__drop_db = async () => {
  let count = 0;
  let collections = 0;
  for (const k of Object.values(Key)) {
    if (typeof k !== "string") {
      continue;
    }
    console.log(`Fetching collection: ${k}`);
    collections++;
    const items = DB.list({ prefix: [k] });
    for await (const { key } of items) {
      console.log(`Deleting ${key}`);
      await DB.delete(key);
      count++;
    }
  }
  console.log(`Deleted ${count} elements across ${collections} collections`);
  return {
    count,
    collections,
  };
};
