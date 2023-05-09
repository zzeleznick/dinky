import {
    serve,
    type ConnInfo,
} from "https://deno.land/std@0.155.0/http/server.ts";

import { 
    randomString,
} from "./lib.ts";

const IPv4RegExpression = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
const RESET = false;

enum Key {
    OriginalLink = "original",
    Hostname = "hostname",
    Shortcode = "shortcode",
    Visitor = "visitor",
    VisitorSum = "visitors",
    VisitSum = "visits",
}

const DB = await Deno.openKv();
const Decoder = new TextDecoder();

const handleGet = async (rawUrl: string, ip: string) => {
    const url = new URL(rawUrl);
    const {hostname, pathname} = url;
    console.log(`hostname: ${hostname}, pathname: ${pathname}`);
    const shortcode = pathname.replace(/^\/+/g, '');
    // check for shortcode existence;
    const originalBox = await DB.get([Key.Shortcode, shortcode]);
    const original = originalBox.value?.value;
    if (!original) {
        console.warn(`Cannot resolve shortcode: '${shortcode}'`);
        return new Response(`Invalid shortcode: ${shortcode}`);
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
}

const handlePost = async (rawUrl: string, body: string) => {
    const url = new URL(rawUrl);
    const {hostname, pathname} = url;

    let link = '';
    console.log(`User posted: '${body}'`);
    try {
        const data = JSON.parse(body);
        link = data.link;
    } catch (err) {
        console.error(`Err: ${err}`);
        return new Response(`Unexpected error`);
    }

    link = `${link.toString().trim()}`
    if (!link) {
        return new Response(`No link!`);
    }

    const shortcode = randomString();
    const key = [Key.Shortcode, shortcode];
    const value = { value: link };

    const newShortcode = await DB.atomic()
        .check({ key, versionstamp: null }) // `null` versionstamps mean 'no value'
        .set(key, value)
        .commit();

    const hostnameKey = [Key.Hostname, hostname];
    const linkKey = [Key.OriginalLink, link];
    
    if (!newShortcode?.ok) {
        console.error(`Duplicate Shortcode: ${shortcode}`);
        return new Response(`Duplicate Shortcode Error!`);
    }
    
    await DB.atomic().sum(hostnameKey, 1n).commit();
    await DB.atomic().sum(linkKey, 1n).commit();

    return new Response(`Link: ${link}\nShortcode: ${shortcode}`);
}

serve(async (req: Request, connInfo: ConnInfo) => {
    const {hostname} = connInfo.remoteAddr as Deno.NetAddr;

    if (RESET) {
        await DB.delete([Key.OriginalLink]);
    }

    const {url, method} = req;
    const ipFlavor = IPv4RegExpression.test(hostname) ? "IP" : "IPV6";
    console.log(`url: ${url}\nmethod: ${method}\n${ipFlavor}: ${hostname}`);

    if (method === 'POST') {
        const buf = await req.arrayBuffer();
        const body = await Decoder.decode(buf);
        return handlePost(url, body);
    } else if (method === 'GET') {
        return handleGet(url, hostname);
    } else {
        return new Response(`Method: ${method} not supported`);
    }
    // MARK: EOF    
});
