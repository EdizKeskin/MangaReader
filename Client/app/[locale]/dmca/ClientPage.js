"use client";
import React, { useTransition, useCallback } from "react";
import Footer from "@/components/Footer";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next-intl/client";
import { Button } from "@nextui-org/react";

export default function DMCAPage() {
  const t = useTranslations("DMCA");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const changeLocale = useCallback(() => {
    if (locale === "en") {
      startTransition(() => {
        router.replace(pathname, { locale: "tr" });
      });
    } else {
      startTransition(() => {
        router.replace(pathname, { locale: "en" });
      });
    }
  }, [locale, pathname, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <div className="container max-w-4xl px-4 py-16 mx-auto">
        {/* Language Toggle Button */}
        <div className="flex justify-end mb-6">
          <Button
            color="primary"
            variant="ghost"
            onClick={changeLocale}
            disabled={isPending}
            className="text-white border-white/20 hover:bg-white/10"
          >
            {isPending ? "..." : locale === "en" ? "TR" : "EN"}
          </Button>
        </div>

        <div className="p-8 border shadow-xl bg-gray-800/50 backdrop-blur-sm rounded-xl border-gray-700/50">
          <h1 className="mb-8 text-4xl font-bold text-center text-white">
            {t("title")}
          </h1>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                {t("copyrightNotification")}
              </h2>
              <p className="leading-relaxed">{t("copyrightText")}</p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                {t("filingNotice")}
              </h2>
              <p className="mb-4 leading-relaxed">{t("filingText")}</p>

              <div className="p-6 border rounded-lg bg-gray-700/30 border-gray-600/30">
                <h3 className="mb-4 text-xl font-medium text-white">
                  {t("requiredInfo")}
                </h3>
                <ul className="space-y-3 list-disc list-inside">
                  <li>{t("workIdentification")}</li>
                  <li>{t("materialIdentification")}</li>
                  <li>{t("contactInfo")}</li>
                  <li>{t("accuracyStatement")}</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                {t("contactInfoTitle")}
              </h2>
              <div className="p-6 border rounded-lg bg-gray-700/30 border-gray-600/30">
                <p className="mb-2">
                  <strong className="text-white">{t("email")}</strong>
                  <a
                    href="mailto:monomangaa@gmail.com"
                    className="ml-2 text-blue-400 hover:text-blue-300"
                  >
                    monomangaa@gmail.com
                  </a>
                </p>
                <p className="mt-4 text-sm text-gray-400">
                  {t("dmcaDisclaimer")}
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                {t("responseTime")}
              </h2>
              <p className="leading-relaxed">{t("responseText")}</p>
            </section>

            <div className="pt-8 mt-12 text-center border-t border-gray-600/30">
              <p className="text-sm text-gray-400">{t("lastUpdated")}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
