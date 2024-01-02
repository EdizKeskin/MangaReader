import { authMiddleware } from "@clerk/nextjs";

import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "tr"],

  defaultLocale: "tr",
});

export default authMiddleware({
  beforeAuth: (req) => {
    return intlMiddleware(req);
  },

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
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
