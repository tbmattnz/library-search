import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "docs");
const files = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/app.mjs", "app.mjs"],
  ["/search.mjs", "search.mjs"],
  ["/data.mjs", "data.mjs"],
  ["/style.css", "style.css"],
]);
export function makeServer() {
  return createServer(async (req, res) => {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    let path;
    try {
      path = new URL(req.url, "http://localhost").pathname;
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    const name = files.get(path);
    if (!name) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    try {
      const body = await readFile(join(root, name));
      res.writeHead(200, {
        "Content-Type": name.endsWith(".html")
          ? "text/html; charset=utf-8"
          : name.endsWith(".css")
            ? "text/css"
            : "text/javascript",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      res.writeHead(500);
      res.end("Unable to load demo");
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  makeServer().listen(4318, "127.0.0.1", () =>
    console.log("Library Search: http://127.0.0.1:4318"),
  );
}
