// Builds the site icons from the wax seal drawn in index.html (the same
// paths, gradients and colors as the seal on the opening envelope):
//   favicon.svg            full seal, transparent background
//   favicon-32.png         32x32, transparent: same wax shape and colors, with
//                          the monogram enlarged and lightened and the fine
//                          laurel/palm/bead details dropped so it stays legible
//   apple-touch-icon.png   180x180 on ivory
//   icon-192.png, icon-512.png  manifest icons on ivory
// Usage (from the repo root): node tools/og/render-icons.mjs
// Needs Node 22+ and Google Chrome (set CHROME=/path/to/chrome to override).
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const CHROME =
  process.env.CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const IVORY = "#fbf8f2";

// --- 1. pull the seal artwork out of index.html and inline its colors ---
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
const sprite = html.match(
  /<svg class="sprite"[\s\S]*?<defs>([\s\S]*?)<\/defs>/,
)[1];
const defs = sprite.slice(0, sprite.indexOf("<symbol"));
const body = sprite.match(/<symbol id="waxSeal"[^>]*>([\s\S]*?)<\/symbol>/)[1];
const v = (name) =>
  css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})`))[1];
const C = {
  hi: v("wax-hi"),
  mid: v("wax-mid"),
  lo: v("wax-lo"),
  deep: v("wax-deep"),
};
const FONT = `font-family="Cormorant Garamond, Georgia, 'Times New Roman', serif" font-style="italic" font-weight="500"`;
const classes = {
  "wax-hi": `stop-color="${C.hi}"`,
  "wax-mid": `stop-color="${C.mid}"`,
  "wax-lo": `stop-color="${C.lo}"`,
  "wax-deep": `stop-color="${C.deep}"`,
  "wax-swell": `stroke="${C.hi}" opacity="0.35"`,
  "wax-shade": `stroke="${C.deep}" opacity="0.85"`,
  "wax-bead": `stroke="${C.hi}" opacity="0.9"`,
  "wax-leaf": `fill="${C.hi}" opacity="0.85"`,
  "wax-frond": "",
  "wax-frond__shadow": `stroke="${C.deep}" stroke-width="0.9" opacity="0.8"`,
  "wax-frond__light": `stroke="${C.hi}" stroke-width="0.9"`,
  "wax-mono": `${FONT} font-size="20" letter-spacing="0.5"`,
  "wax-mono__shadow": `fill="${C.deep}" opacity="0.9"`,
  "wax-mono__light": `fill="${C.hi}" opacity="0.9"`,
  "wax-mono__face": `fill="${C.mid}"`,
  "wax-gloss": `fill="#fff" opacity="0.22"`,
  "wax-glint": `fill="#fff" opacity="0.5"`,
};
const inline = (s) =>
  s
    .replace(/class="([^"]+)"/g, (m, c) => {
      if (!(c in classes)) throw new Error("unmapped class " + c);
      return classes[c];
    })
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n\s*\n/g, "\n");
const tidy = (s) => s.replace(/\s+/g, " ").replace(/> </g, "><").trim();
const seal = (art) =>
  tidy(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${inline(defs)}</defs>${inline(art)}</svg>`,
  );

const full = seal(body);
// small sizes: same wax shape, colors and monogram, minus hairline details
const small = seal(
  body
    .replace(/<g class="wax-leaf">[\s\S]*?<\/g>/, "")
    .replace(/<g class="wax-frond"[\s\S]*?<\/g>/, "")
    .replace(/<circle[^>]*class="wax-bead"[^>]*\/>/, "")
    .replace(
      /<g class="wax-mono"([^>]*)>[\s\S]*?<\/g>/,
      (m, attrs) =>
        `<g class="wax-mono"${attrs}><text x="51.2" y="62.2" fill="${C.deep}" font-size="31" stroke="${C.deep}" stroke-width="0.6">S&amp;B</text><text x="50" y="61" fill="#f3f8fc" font-size="31" stroke="#f3f8fc" stroke-width="0.6">S&amp;B</text></g>`,
    ),
)
  // inline font-size wins over the class default
  .replace(/font-size="20" letter-spacing="0.5"/, 'letter-spacing="0"');
fs.writeFileSync(path.join(ROOT, "favicon.svg"), full + "\n");
console.log("saved favicon.svg");

// --- 2. rasterize with headless Chrome (web font loaded, as on the site) ---
const port = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(
  path.join(fs.realpathSync("/tmp"), "icons-chrome-"),
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
  try {
    fs.rmSync(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
  } catch {}
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
await send("Page.enable");
await send("Emulation.setDefaultBackgroundColorOverride", {
  color: { r: 0, g: 0, b: 0, a: 0 },
});
const targets = [
  { file: "favicon-32.png", size: 32, svg: small, bg: "transparent", scale: 1 },
  { file: "apple-touch-icon.png", size: 180, svg: full, bg: IVORY, scale: 0.8 },
  { file: "icon-192.png", size: 192, svg: full, bg: IVORY, scale: 0.78 },
  { file: "icon-512.png", size: 512, svg: full, bg: IVORY, scale: 0.78 },
];
for (const t of targets) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: t.size,
    height: t.size,
    deviceScaleFactor: 1,
    mobile: false,
  });
  const page = `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&display=block" rel="stylesheet">
<style>html,body{margin:0;width:${t.size}px;height:${t.size}px;background:${t.bg};overflow:hidden}
body{display:flex;align-items:center;justify-content:center}
svg{width:${t.size * t.scale}px;height:${t.size * t.scale}px;display:block}</style></head>
<body>${t.svg}</body></html>`;
  await send("Page.navigate", {
    url: "data:text/html;base64," + Buffer.from(page).toString("base64"),
  });
  await new Promise((r) => setTimeout(r, 400));
  await send("Runtime.evaluate", {
    expression:
      "document.fonts.load('italic 500 20px \"Cormorant Garamond\"').then(() => document.fonts.ready).then(() => true)",
    awaitPromise: true,
  });
  await new Promise((r) => setTimeout(r, 300));
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: t.size, height: t.size, scale: 1 },
  });
  fs.writeFileSync(
    path.join(ROOT, t.file),
    Buffer.from(shot.result.data, "base64"),
  );
  console.log("saved", t.file);
}
done(0);
