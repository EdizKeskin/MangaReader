"use client";
import React, { useState, useTransition } from "react";
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

  const menuItems = [
    { name: t("calendar"), href: "/calendar" },
    { name: t("categories"), href: "/category" },
    { name: t("bookmarks"), href: "/bookmarks" },
    { name: t("announcements"), href: "/announcements" },
    { name: t("faq"), href: "/faq" },
    { name: t("mobile"), href: "/mobile" },
  ];

  const changeLocale = () => {
    if (locale === "en") {
      startTransition(() => {
        intlRouter.replace(pathname, { locale: "tr" });
      });
    } else {
      startTransition(() => {
        intlRouter.replace(pathname, { locale: "en" });
      });
    }
  };

  return (
    <NavbarNextUI
      onMenuOpenChange={setIsMenuOpen}
      shouldHideOnScroll
      maxWidth="2xl"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="lg:hidden"
        />
        <NavbarBrand>
          <p
            className="font-bold cursor-pointer text-secondary"
            onClick={() => router.push("/")}
          >
            {websiteTitle}
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-4 lg:flex" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={`${item}-${index}`}>
            <Button
              color="secondary"
              variant={
                item.href === pathname ||
                item.href + "en" === pathname ||
                "/en" + item.href === pathname
                  ? "flat"
                  : "ligt"
              }
              onPress={() => router.push(item.href)}
            >
              {item.name}
            </Button>
          </NavbarItem>
        ))}
        <NavbarItem>
          <Autocomplete
            value={search}
            onChange={(e) => setSearch(e)}
            placeholder={t("search")}
          />
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden md:block">
          <Button onClick={changeLocale} isIconOnly>
            {locale === "en" ? "TR" : "EN"}
          </Button>
        </NavbarItem>
        {user?.publicMetadata?.isAdmin === true ? (
          <SignedIn>
            <NavbarItem>
              <Tooltip content={t("adminPanel")}>
                <Button
                  color={"default"}
                  onClick={() => router.push("/admin")}
                  isIconOnly
                >
                  <MdOutlineAdminPanelSettings size={"1.3em"} />
                </Button>
              </Tooltip>
            </NavbarItem>
          </SignedIn>
        ) : null}
        <SignedIn>
          <NavbarItem>
            <UserButton afterSignOutUrl="/" />
          </NavbarItem>
        </SignedIn>
        <SignedOut>
          <NavbarItem>
            <Button onClick={() => router.push("/login")} variant="light">
              {t("login")}
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button
              as={Link}
              color="secondary"
              onClick={() => router.push("/register")}
              variant="flat"
            >
              {t("register")}
            </Button>
          </NavbarItem>
        </SignedOut>
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              color={
                item.href === pathname ||
                item.href + "en" === pathname ||
                "/en" + item.href === pathname
                  ? "secondary"
                  : "foreground"
              }
              className="w-full cursor-pointer"
              onClick={() => router.push(item.href)}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}

        {user?.publicMetadata?.isAdmin === true ? (
          <NavbarMenuItem>
            <Link
              color="warning"
              className="w-full cursor-pointer"
              onClick={() => router.push("/admin")}
              size="lg"
            >
              {t("adminPanel")}
            </Link>
          </NavbarMenuItem>
        ) : null}

        {user && (
          <NavbarMenuItem>
            <Link
              color="danger"
              className="w-full cursor-pointer"
              onClick={() => signOut()}
              size="lg"
            >
              {t("logout")}
            </Link>
          </NavbarMenuItem>
        )}
        <NavbarMenuItem className="mt-4">
          <Autocomplete
            value={search}
            onChange={(e) => setSearch(e)}
            placeholder={t("search")}
          />
        </NavbarMenuItem>
        <NavbarMenuItem className="mt-4">
          <Button onClick={changeLocale} isIconOnly>
            {locale === "en" ? "TR" : "EN"}
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </NavbarNextUI>
  );
}
