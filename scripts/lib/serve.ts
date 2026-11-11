// Serves dist/ on a random local port for the browser checks (PLAN 1.3: map-check, lighthouse).
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join, resolve } from "node:path";

export const ROOT = resolve(import.meta.dirname, "..", "..");
export const DIST = join(ROOT, "dist");

const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };

export async function serveDist(): Promise<{ origin: string; server: Server }> {
  if (!existsSync(join(DIST, "index.html"))) throw new Error("dist/ is missing; run pnpm build first");
  const server = createServer((req, res) => {
    let p = decodeURIComponent((req.url ?? "/").split("?")[0]!);
    if (p.endsWith("/")) p += "index.html";
    const f = resolve(DIST, `.${p}`);
    if (!f.startsWith(DIST) || !existsSync(f) || statSync(f).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    // Long cache for hashed assets, like Cloudflare's static assets serve them.
    const cache = p.startsWith("/_astro/") ? "public, max-age=31536000, immutable" : "no-cache";
    res.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream", "cache-control": cache });
    createReadStream(f).pipe(res);
  });
  await new Promise<void>((r) => server.listen(0, "localhost", r));
  return { origin: `http://localhost:${(server.address() as { port: number }).port}`, server };
}
