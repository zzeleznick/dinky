import {
    Server,
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

let PORT = 8000;
const DB = await Deno.openKv();
const Decoder = new TextDecoder();
const exampleLink = 'https://jsonplaceholder.typicode.com/todos/1';

const buildOutUrl = (protocol: string, hostname: string, shortcode = '') => {
    const port = hostname === 'localhost' ? `:${PORT}` : '';
    const suffix = shortcode ? `/${shortcode}` : '';
    return `${protocol}//${hostname}${port}${suffix}`
}

const buildWelcomeMessage = (protocol: string, hostname: string) => {
    const targetUrl = buildOutUrl(protocol, hostname);
    const codeBlock = `
<code> curl -d '{"link": "${exampleLink}"}' ${targetUrl} </code>
    `.trim();
    return `
<html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>🦕 Dinky</title>
    </head>
<body>
    <h1>Welcome to Dinky</h1>
    <p>Try running ${codeBlock} to get started</p>
</body>
</html>
    `.trim();
}

const handleGet = async (rawUrl: string, ip: string) => {
    const url = new URL(rawUrl);
    const {protocol, hostname, pathname} = url;
    console.log(`protocol: ${protocol}, hostname: ${hostname}, pathname: ${pathname}`);
    const shortcode = pathname.replace(/^\/+/g, '').trim();
    if (!shortcode) {
        const res = buildWelcomeMessage(protocol, hostname);
        return new Response(res);
    }
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
    const {protocol, hostname, pathname} = url;

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

    const outUrl = buildOutUrl(protocol, hostname, shortcode);

    return new Response(`Original: ${link}\nShortcode: ${shortcode}\nOut: ${outUrl}\n`);
}

const handler = async (req: Request, connInfo: ConnInfo) => {
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
}

const server = new Server({ handler });
const listener = Deno.listen({ port: PORT });
console.log(`server listening on http://localhost:${PORT}`);
await server.serve(listener);
