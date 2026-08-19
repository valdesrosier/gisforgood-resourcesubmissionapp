import { createReadStream, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import extract from './extract';
import screenshot from './screenshot';

const host = process.env.HOST || '127.0.0.1';
const port = Number.parseInt(process.env.PORT || '', 10);
const publicDirectory = resolve(__dirname, '../public');
const bodyLimit = 64 * 1024;
const requestBodyTimeout = 15_000;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port');
}

type FunctionHandler = (context: any, request: any) => void | Promise<any>;

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function applySecurityHeaders(response: ServerResponse): void {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

function sendJSON(response: ServerResponse, status: number, body: unknown): void {
  if (response.writableEnded) return;
  if (response.headersSent) {
    response.end();
    return;
  }
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

async function readJSON(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > bodyLimit) throw new Error('request body is too large');
    chunks.push(bytes);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function functionLogger(level: 'log' | 'warn' | 'error') {
  return (message: unknown) => console[level](typeof message === 'string' ? message : 'API operation failed');
}

async function invoke(handler: FunctionHandler, request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJSON(response, 405, { error: 'POST required.' });
    return;
  }
  const contentLength = Number.parseInt(request.headers['content-length'] || '', 10);
  if (Number.isFinite(contentLength) && contentLength > bodyLimit) {
    sendJSON(response, 413, { error: 'Request body is too large.' });
    return;
  }
  let body: unknown;
  try {
    body = await readJSON(request);
  } catch {
    sendJSON(response, 400, { error: 'A valid JSON body is required.' });
    return;
  }
  const log = Object.assign(functionLogger('log'), {
    warn: functionLogger('warn'),
    error: functionLogger('error'),
    info: functionLogger('log'),
  });
  const context: any = { log, res: undefined };
  await handler(context, { body });
  const result = context.res || { status: 500, body: { error: 'API handler returned no response.' } };
  for (const [name, value] of Object.entries(result.headers || {})) {
    response.setHeader(name, String(value));
  }
  sendJSON(response, result.status || 200, result.body);
}

function serveStatic(request: IncomingMessage, response: ServerResponse, pathname: string): void {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    response.end();
    return;
  }
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    response.statusCode = 400;
    response.end();
    return;
  }
  const candidate = resolve(publicDirectory, `.${decoded}`);
  const insidePublic = candidate === publicDirectory || candidate.startsWith(publicDirectory + sep);
  let file = insidePublic ? candidate : '';
  try {
    if (!file || !statSync(file).isFile()) file = '';
  } catch {
    file = '';
  }
  if (!file) file = resolve(publicDirectory, 'index.html');
  try {
    if (!statSync(file).isFile()) throw new Error('missing');
  } catch {
    response.statusCode = 404;
    response.end();
    return;
  }
  response.statusCode = 200;
  response.setHeader('Content-Type', contentTypes[extname(file).toLowerCase()] || 'application/octet-stream');
  response.setHeader('Cache-Control', file.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable');
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  const stream = createReadStream(file);
  stream.on('error', () => sendJSON(response, 500, { error: 'Request failed.' }));
  stream.pipe(response);
}

const server = createServer(async (request, response) => {
  applySecurityHeaders(response);
  const pathname = new URL(request.url || '/', 'http://localhost').pathname;
  try {
    if (pathname === '/_health') {
      response.statusCode = 204;
      response.end();
    } else if (pathname === '/api/extract') {
      await invoke(extract, request, response);
    } else if (pathname === '/api/screenshot') {
      await invoke(screenshot, request, response);
    } else {
      serveStatic(request, response, pathname);
    }
  } catch {
    sendJSON(response, 500, { error: 'Request failed.' });
  }
});

server.headersTimeout = 10_000;
server.requestTimeout = requestBodyTimeout;
server.timeout = 75_000;
server.keepAliveTimeout = 5_000;
server.maxRequestsPerSocket = 100;
server.listen(port, host);
process.on('SIGTERM', () => server.close());