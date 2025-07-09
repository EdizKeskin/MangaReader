import { authMiddleware } from "@clerk/nextjs";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "tr"],

  defaultLocale: "tr",
});

// List of known social media bots
const BOT_USER_AGENTS = [
  "Discordbot",
  "WhatsApp",
  "Twitterbot",
  "facebookexternalhit",
  "Googlebot",
  "LinkedInBot",
  "Slackbot",
  "TelegramBot",
  "Applebot",
  "Bingbot",
  "YandexBot",
  "DuckDuckBot",
  "Baiduspider",
  "Sogou",
  "Exabot",
  "facebot",
  "ia_archiver",
];

export default function middleware(req) {
  const userAgent = req.headers.get("user-agent") || "";
  if (BOT_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
    // Sadece botlar için: Sadece intlMiddleware çalışsın, auth devre dışı
    return intlMiddleware(req);
  }
  // Diğer tüm istekler için auth + intl
  return authMiddleware({
    publicRoutes: [
      "/",
      "/en",
      "/:locale/login",
      "/:locale/register",
      "/:locale/manga",
      "/:locale/manga/:path*",
      "/:locale/manga/:path*/:path*",
      "/manga",
      "/manga/:path*",
      "/manga/:path*/:path*",
      "/:locale/sso-callback",
      "/sso-callback",
      "/category",
      "/:locale/category",
      "/bookmarks",
      "/:locale/bookmarks",
      "/announcements/:path*",
      "/:locale/announcements/:path*",
      "/discord",
      "/:locale/discord",
      "/calendar",
      "/:locale/calendar",
      "/faq",
      "/:locale/faq",
      "/mobile",
      "/:locale/mobile",
    ],

    beforeAuth: (req) => intlMiddleware(req),
  })(req);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
