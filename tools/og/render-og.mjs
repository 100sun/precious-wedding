// Renders the link-preview image images/og-envelope.png (1200x630) from the
// real intro markup and CSS in its sealed state, so it always matches the site.
// Usage (from the repo root): node tools/og/render-og.mjs
// Needs Node 22+ and Google Chrome (set CHROME=/path/to/chrome to override).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const OUT = path.join(ROOT, "images", "og-envelope.png");
const CHROME =
  process.env.CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

// minimal static server for the repo
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  const f = path.join(ROOT, path.normalize(p));
  if (!f.startsWith(ROOT)) return res.writeHead(403).end();
  fs.readFile(f, (err, data) => {
    if (err) return res.writeHead(404).end();
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(f)] || "application/octet-stream",
    });
    res.end(data);
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/`;

const port = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(
  path.join(fs.realpathSync("/tmp"), "og-chrome-"),
);
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--hide-scrollbars",
    "about:blank",
  ],
  { stdio: "ignore" },
);
const done = (code) => {
  chrome.kill("SIGKILL");
  server.close();
  try {
    fs.rmSync(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
  } catch {} // Chrome may still hold files; the temp profile is harmless
  process.exit(code);
};
setTimeout(() => {
  console.error("timed out");
  done(2);
}, 60000);

let wsUrl;
for (let i = 0; i < 75 && !wsUrl; i++) {
  await new Promise((r) => setTimeout(r, 200));
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1200,
  height: 630,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
});
await send("Page.navigate", { url: base });
await sleep(1500);

// sealed state only: hide Skip / hint, enlarge the envelope, add the caption
const css = `
  .intro { padding: 0 !important; gap: 34px !important; justify-content: center !important; }
  .intro__skip, .intro__hint { display: none !important; }
  .envelope { width: 600px !important; transform: none !important; }
  .envelope__seal { --seal: 132px !important; }
  .og-caption { font-family: "Jost", sans-serif; font-size: 17px; letter-spacing: .32em;
    text-transform: uppercase; color: #6b6257; margin: 0; }
`;
await send("Runtime.evaluate", {
  expression: `(() => {
    const s = document.createElement("style");
    s.textContent = ${JSON.stringify(css)};
    document.head.appendChild(s);
    const p = document.createElement("p");
    p.className = "og-caption";
    p.textContent = "Sofia & Blake · Save the Date · 08.05.2027";
    document.getElementById("intro").appendChild(p);
    return document.fonts.ready.then(() => true);
  })()`,
  awaitPromise: true,
});
await sleep(800);
const shot = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(OUT, Buffer.from(shot.result.data, "base64"));
console.log("saved", path.relative(ROOT, OUT));
done(0);
