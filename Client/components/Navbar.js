"use client";
import React, { useState, useTransition, useMemo, useCallback } from "react";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useClerk,
  useUser,
} from "@clerk/nextjs";
import {
  Navbar as NavbarNextUI,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Tooltip,
} from "@nextui-org/react";
import Autocomplete from "@/components/Autocomplete";
import { useRouter } from "next13-progressbar";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter as useIntlRouter } from "next-intl/client";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { websiteTitle } from "@/config";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const { signOut } = useClerk();
  const router = useRouter();
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const menuItems = useMemo(
    () => [
      { name: t("calendar"), href: "/calendar" },
      { name: t("categories"), href: "/category" },
      { name: t("bookmarks"), href: "/bookmarks" },
      { name: t("announcements"), href: "/announcements" },
      { name: t("faq"), href: "/faq" },
      { name: t("mobile"), href: "/mobile" },
    ],
    [t]
  );

  const changeLocale = useCallback(() => {
    if (locale === "en") {
      startTransition(() => {
        intlRouter.replace(pathname, { locale: "tr" });
      });
    } else {
      startTransition(() => {
        intlRouter.replace(pathname, { locale: "en" });
      });
    }
  }, [locale, pathname, intlRouter]);

  const handleHomeClick = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleMenuItemClick = useCallback(
    (href) => {
      router.push(href);
      setIsMenuOpen(false);
    },
    [router]
  );

  const handleAdminClick = useCallback(() => {
    router.push("/admin");
  }, [router]);

  const handleLoginClick = useCallback(() => {
    router.push("/login");
  }, [router]);

  const handleRegisterClick = useCallback(() => {
    router.push("/register");
  }, [router]);

  const handleSignOut = useCallback(() => {
    signOut();
    setIsMenuOpen(false);
  }, [signOut]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  const isActiveRoute = useCallback(
    (href) => {
      return (
        href === pathname ||
        href + "en" === pathname ||
        "/en" + href === pathname
      );
    },
    [pathname]
  );

  const isAdmin = useMemo(() => {
    return user?.publicMetadata?.isAdmin === true;
  }, [user?.publicMetadata?.isAdmin]);

  return (
    <NavbarNextUI
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      shouldHideOnScroll
      maxWidth="2xl"
      className="border-b backdrop-blur-md bg-black/10 dark:bg-black/20 border-white/10 dark:border-white/5"
      style={{
        backdropFilter: "blur(20px)",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
      }}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="text-white transition-colors duration-200 lg:hidden hover:text-purple-400"
        />
        <NavbarBrand>
          <div
            className="font-bold text-transparent transition-all duration-300 transform cursor-pointer bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text hover:from-purple-300 hover:via-pink-400 hover:to-purple-500 hover:scale-105"
            onClick={handleHomeClick}
          >
            {websiteTitle}
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-2 lg:flex" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={`${item.name}-${index}`}>
            <Button
              color="secondary"
              variant={isActiveRoute(item.href) ? "flat" : "light"}
              onPress={() => handleMenuItemClick(item.href)}
              className={`
                relative overflow-hidden group
                ${
                  isActiveRoute(item.href)
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 shadow-lg shadow-purple-500/25"
                    : "text-gray-300 hover:text-white"
                }
                backdrop-blur-sm border-0
                transition-all duration-300 ease-out
                hover:shadow-lg hover:shadow-purple-500/25

              `}
            >
              <span className="relative z-10">{item.name}</span>
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-purple-600/0 via-purple-500/20 to-pink-500/0 group-hover:opacity-100" />
            </Button>
          </NavbarItem>
        ))}
        <NavbarItem>
          <div className="relative">
            <Autocomplete
              value={search}
              onChange={handleSearchChange}
              placeholder={t("search")}
              className="backdrop-blur-sm"
            />
            <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
          </div>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden md:block">
          <Button
            onClick={changeLocale}
            isIconOnly
            className="text-white transition-all duration-300 border-0 bg-gradient-to-r from-gray-700/50 to-gray-600/50 backdrop-blur-sm hover:from-purple-600/50 hover:to-pink-600/50 hover:scale-110 active:scale-95"
            disabled={isPending}
          >
            {isPending ? "..." : locale === "en" ? "TR" : "EN"}
          </Button>
        </NavbarItem>

        {isAdmin && (
          <SignedIn>
            <NavbarItem>
              <Tooltip
                content={t("adminPanel")}
                className="text-white border backdrop-blur-md bg-black/80 border-white/10"
              >
                <Button
                  color="warning"
                  onClick={handleAdminClick}
                  isIconOnly
                  className="text-orange-300 transition-all duration-300 border-0 shadow-lg bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm hover:from-orange-500/40 hover:to-yellow-500/40 hover:scale-110 active:scale-95 shadow-orange-500/25"
                >
                  <MdOutlineAdminPanelSettings size="1.3em" />
                </Button>
              </Tooltip>
            </NavbarItem>
          </SignedIn>
        )}

        <SignedIn>
          <NavbarItem>
            <div className="relative">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      "hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-110",
                  },
                }}
              />
            </div>
          </NavbarItem>
        </SignedIn>

        <SignedOut>
          <NavbarItem>
            <Button
              onClick={handleLoginClick}
              variant="light"
              className="text-gray-300 transition-all duration-300 border-0 hover:text-white hover:bg-white/10 "
            >
              {t("login")}
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button
              color="secondary"
              onClick={handleRegisterClick}
              variant="flat"
              className="text-white transition-all duration-300 border-0 shadow-lg bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25"
            >
              {t("register")}
            </Button>
          </NavbarItem>
        </SignedOut>
      </NavbarContent>

      <NavbarMenu className="border-r backdrop-blur-xl bg-black/30 border-white/10">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              color={isActiveRoute(item.href) ? "secondary" : "foreground"}
              className={`
                w-full cursor-pointer p-3 rounded-lg transition-all duration-300
                ${
                  isActiveRoute(item.href)
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }

              `}
              onClick={() => handleMenuItemClick(item.href)}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}

        {isAdmin && (
          <NavbarMenuItem>
            <Link
              color="warning"
              className="w-full p-3 text-orange-300 transition-all duration-300 rounded-lg cursor-pointer hover:text-orange-200 hover:bg-orange-500/10 "
              onClick={handleAdminClick}
              size="lg"
            >
              {t("adminPanel")}
            </Link>
          </NavbarMenuItem>
        )}

        {user && (
          <NavbarMenuItem>
            <Link
              color="danger"
              className="w-full p-3 text-red-300 transition-all duration-300 rounded-lg cursor-pointer hover:text-red-200 hover:bg-red-500/10 "
              onClick={handleSignOut}
              size="lg"
            >
              {t("logout")}
            </Link>
          </NavbarMenuItem>
        )}

        <NavbarMenuItem className="mt-6">
          <div className="relative">
            <Autocomplete
              value={search}
              onChange={handleSearchChange}
              placeholder={t("search")}
              className="backdrop-blur-sm"
            />
            <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
          </div>
        </NavbarMenuItem>

        <NavbarMenuItem className="mt-4">
          <Button
            onClick={changeLocale}
            isIconOnly
            className="text-white transition-all duration-300 border-0 bg-gradient-to-r from-gray-700/50 to-gray-600/50 backdrop-blur-sm hover:from-purple-600/50 hover:to-pink-600/50 hover:scale-110 active:scale-95"
            disabled={isPending}
          >
            {isPending ? "..." : locale === "en" ? "TR" : "EN"}
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </NavbarNextUI>
  );
}
