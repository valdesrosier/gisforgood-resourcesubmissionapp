import { resolve4, resolve6 } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP } from "node:net";

const pageByteLimit = 2 * 1024 * 1024;
const blockedIPv4 = new BlockList();
const blockedIPv6 = new BlockList();

for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
] as Array<[string, number]>)
  blockedIPv4.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["::ffff:0:0", 96],
  ["100::", 64],
  ["2001:db8::", 32],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as Array<[string, number]>)
  blockedIPv6.addSubnet(address, prefix, "ipv6");

interface PublicResponse {
  ok: boolean;
  status: number;
  location?: string;
  text(): Promise<string>;
}

async function publicAddress(
  url: URL,
): Promise<{ address: string; family: 4 | 6 }> {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const family = isIP(hostname);
  const addresses = family
    ? [hostname]
    : [
        ...(await resolve4(hostname).catch(() => [])),
        ...(await resolve6(hostname).catch(() => [])),
      ];
  if (addresses.length === 0) throw new Error("URL hostname did not resolve");
  for (const address of addresses) {
    const addressFamily = isIP(address);
    if (addressFamily !== 4 && addressFamily !== 6)
      throw new Error("URL resolved to an invalid address");
    const blockList = addressFamily === 4 ? blockedIPv4 : blockedIPv6;
    if (blockList.check(address, addressFamily === 4 ? "ipv4" : "ipv6")) {
      throw new Error("URL resolves to a non-public address");
    }
  }
  const address = addresses[0];
  return { address, family: isIP(address) as 4 | 6 };
}

function requestPinned(
  url: URL,
  address: string,
  family: 4 | 6,
): Promise<PublicResponse> {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? httpsRequest : httpRequest;
    const request = transport(
      url,
      {
        headers: {
          "User-Agent": "GIS4Good-ResourceBot/0.1",
          "Accept-Encoding": "identity",
        },
        lookup: (_hostname, options, callback) => {
          if (typeof options === "object" && options.all) {
            callback(null, [{ address, family }]);
            return;
          }
          callback(null, address, family);
        },
        servername: url.hostname.replace(/^\[|\]$/g, ""),
        timeout: 15_000,
      },
      (response) => {
        const chunks: Buffer[] = [];
        let size = 0;
        response.on("data", (chunk) => {
          const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += bytes.length;
          if (size > pageByteLimit)
            response.destroy(new Error("page is too large"));
          else chunks.push(bytes);
        });
        response.on("error", reject);
        response.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          const status = response.statusCode || 500;
          resolve({
            ok: status >= 200 && status < 300,
            status,
            location: response.headers.location,
            text: async () => body,
          });
        });
      },
    );
    request.on("timeout", () =>
      request.destroy(new Error("page request timed out")),
    );
    request.on("error", reject);
    request.end();
  });
}

async function validateURL(value: string): Promise<URL> {
  const url = new URL(value);
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    !url.hostname
  ) {
    throw new Error("URL must be public http(s)");
  }
  return url;
}

export async function fetchPublicPage(value: string): Promise<PublicResponse> {
  let url = await validateURL(value);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const { address, family } = await publicAddress(url);
    const response = await requestPinned(url, address, family);
    if (response.status < 300 || response.status >= 400 || !response.location)
      return response;
    url = await validateURL(new URL(response.location, url).toString());
  }
  throw new Error("too many redirects");
}
