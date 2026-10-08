import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const apiOrigin = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
).origin;
const socketOrigin = new URL(
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000",
).origin;
const socketConnectUrl = new URL(socketOrigin);
socketConnectUrl.protocol =
  socketConnectUrl.protocol === "https:" ? "wss:" : "ws:";
const socketConnectOrigin = socketConnectUrl.origin;
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.fbcdn.net https://platform-lookaside.fbsbx.com",
      "font-src 'self'",
      `connect-src 'self' ${apiOrigin} ${socketOrigin} ${socketConnectOrigin}`,
      "frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
];
if (process.env.NODE_ENV === "production")
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
