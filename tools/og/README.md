Regenerate the link preview `images/og-envelope.png` (1200x630, the sealed "You have mail from Sofia & Blake" opening from the live intro markup) with `node tools/og/render-og.mjs` from the repo root (Node 22+, Google Chrome; set `CHROME=` to override the browser path).

Regenerate the browser-tab and home-screen icons (favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png) from the wax seal in index.html with `node tools/og/render-icons.mjs`.
