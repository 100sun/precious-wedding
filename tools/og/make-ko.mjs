// Builds ko.html: the same page as index.html, but with Korean link-preview
// tags and Korean as the default language. Chat apps (KakaoTalk, iMessage)
// read the preview from the raw HTML without running JavaScript, so the
// Korean preview needs its own file. Share .../ko.html with Korean guests.
// Usage (from the repo root): node tools/og/make-ko.mjs [baseUrl]
// baseUrl defaults to the live site; the deploy passes the preview URL.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LIVE = "https://100sun.github.io/precious-wedding/";
const BASE = process.argv[2] || LIVE;

let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

function swap(re, value, label) {
  if (!re.test(html)) throw new Error("make-ko: could not find " + label);
  html = html.replace(re, value);
}
const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
function meta(key, value) {
  const re = new RegExp(
    `(<meta\\s+(?:property|name)="${key}"\\s+content=")[^"]*(")`,
  );
  swap(re, `$1${attr(value)}$2`, key);
}

swap(/<html lang="en">/, '<html lang="ko" data-default-lang="ko">', "<html>");
swap(/<title>[^<]*<\/title>/, "<title>선혜 &amp; 블레이크 결혼합니다</title>", "<title>");
meta(
  "description",
  "선혜 & 블레이크가 2027년 8월 5일 목요일, 캘리포니아 퍼시픽 팰리세이즈의 Bel-Air Bay Club에서 결혼합니다. 7월 1일까지 참석 여부를 알려 주세요.",
);
meta("og:url", BASE + "ko.html");
meta("og:title", "선혜 & 블레이크 · 결혼식에 초대합니다");
meta("og:description", "2027년 8월 5일 목요일 · Bel-Air Bay Club · 7월 1일까지 회신 부탁드립니다");
meta("og:image", BASE + "images/og-envelope-ko.png");
meta("twitter:image", BASE + "images/og-envelope-ko.png");
meta(
  "og:image:alt",
  "선혜 & 블레이크가 보낸 편지: 하늘색 왁스로 봉인된 아이보리 레이스 봉투",
);
// og:locale helps some apps pick the right language
swap(
  /(<meta property="og:type" content="website" \/>)/,
  '$1\n    <meta property="og:locale" content="ko_KR" />',
  "og:type",
);

fs.writeFileSync(path.join(ROOT, "ko.html"), html);
console.log("wrote ko.html for", BASE);
