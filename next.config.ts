import type { NextConfig } from "next";

/*
 * Content-Security-Policy, sent REPORT-ONLY for now.
 *
 * Report-Only because three things on this site would very likely break
 * under an enforced policy, and none of them are worth finding out about
 * from a teacher mid-lesson:
 *
 *  - The printed reports (homeroom, savings, the daily checks) are built
 *    with `window.open("", "_blank")` + `document.write`. An about:blank
 *    document inherits the opener's CSP, so those generated pages are
 *    governed by this header even though they are not routes. They pull a
 *    stylesheet from Google Fonts and carry inline <style>.
 *  - /games/law-daily is a same-origin iframe whose document loads Google
 *    Fonts and the Tailwind CDN runtime, which compiles CSS in the browser
 *    and injects it inline.
 *  - AdSense fans out to a set of Google hosts that is not knowable from
 *    this repository, and it rewrites that set over time.
 *
 * Report-Only means violations are reported and nothing is blocked, so the
 * real list can be collected from browsers before anything is enforced.
 *
 * Note on what this can and cannot buy: Next inlines its hydration
 * bootstrap, and nonces would mean rendering every page dynamically, which
 * would give up static generation for all 113 routes. So `script-src` has
 * to keep 'unsafe-inline', and this policy's value is in constraining WHERE
 * resources may come from, not in stopping inline script injection.
 */
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is load-bearing here — see the note above.
  "script-src 'self' 'unsafe-inline' https://*.googlesyndication.com https://*.googletagmanager.com https://*.google-analytics.com https://*.doubleclick.net https://*.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Ad creatives come from hosts no list here can keep up with.
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co https://*.google-analytics.com https://*.googletagmanager.com https://*.doubleclick.net https://*.googlesyndication.com",
  // 'self' covers the law-daily game; the rest are AdSense's ad frames.
  "frame-src 'self' https://*.doubleclick.net https://*.googlesyndication.com https://*.google.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

/*
 * Deny the device features this site never uses, and keep the two it does.
 * `microphone` is the noise meter (navigator.mediaDevices.getUserMedia), and
 * `fullscreen` plus `autoplay` are the game stages, including the law-daily
 * iframe, whose allow="fullscreen; autoplay" cannot grant more than the
 * page itself has.
 *
 * Strict-Transport-Security is deliberately absent: Vercel already sends it
 * for the production domain, and a wrong includeSubDomains or preload here
 * is remembered by browsers and painful to walk back.
 *
 * Only features the browser actually recognises are listed. An unknown one
 * is not free: Chromium logs "Unrecognized feature" for every page load, so
 * ambient-light-sensor, battery and bluetooth were dropped after they turned
 * up as warnings in testing. They bought nothing and would have put three
 * warnings in front of anyone who opens the console.
 */
const permissionsPolicy = [
  "microphone=(self)",
  "fullscreen=(self)",
  "autoplay=(self)",
  "accelerometer=()",
  "camera=()",
  "display-capture=()",
  "geolocation=()",
  "gyroscope=()",
  "idle-detection=()",
  "magnetometer=()",
  "midi=()",
  "payment=()",
  "serial=()",
  "usb=()",
  "xr-spatial-tracking=()",
].join(", ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site frames its own game from the same origin, so SAMEORIGIN, not
  // DENY. `frame-ancestors 'self'` above says the same thing to newer
  // browsers; this stays for the ones that only read the old header.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: permissionsPolicy },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return [
      {
        source: "/blog/khuncool-teacher-tools",
        destination: "/blog/10-free-teaching-tools",
        permanent: true,
      },
      {
        source: "/blog/free-online-teaching-media",
        destination: "/blog/10-free-teaching-tools",
        permanent: true,
      },
      {
        source: "/tools/duck-race",
        destination: "/duck-race",
        permanent: true,
      },
      /*
       * Folded into the tool page. Search Console showed every query this
       * article ranked for was a head term the tool page also targets
       * (เป็ดสุ่ม, สุ่มเป็ด, แข่งเป็ด) — 33 clicks over three months against
       * the tool page's 2,350, and Google was splitting "สุ่มเป็ด" across
       * three of our URLs instead of ranking one of them well.
       */
      {
        source: "/blog/duck-race",
        destination: "/duck-race",
        permanent: true,
      },
      {
        source: "/tools/wheel",
        destination: "/random-name-picker",
        permanent: true,
      },
      {
        source: "/tools/scoreboard",
        destination: "/group-scoreboard",
        permanent: true,
      },
      {
        source: "/tools/noise-meter",
        destination: "/classroom-noise-meter",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
