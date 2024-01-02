"use client";
import { Button } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next13-progressbar";

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations("NotFound");
  return (
    <>
      <div className="z-20 px-6 py-10 text-center ">
        <Image
          src="/not-found.png"
          width={400}
          height={400}
          alt="404"
          className="max-w-[500px] mx-[auto] mb-6 w-full"
        />
        <h1 className="mt-3 mb-2">{t("title")}</h1>
        <p className="mb-6"></p>
        <Link href="/">
          <Button onClick={() => router.push("/")}>{t("goHome")}</Button>
        </Link>
      </div>
      <div className="z-0 not-found-gradient" />
    </>
  );
}
