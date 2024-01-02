"use client";
import Image from "next/image";
import React from "react";
import PhoneImage from "../../../public/phone.png";
import { Button } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import Spotlight from "@/components/Spotlight";
import { TextGenerate } from "@/components/TextGenerate";
import { motion } from "framer-motion";
export default function Mobile() {
  const t = useTranslations("Mobile");

  return (
    <div>
      <Spotlight
        className="left-0 z-0 -top-40 md:left-60 md:-top-20"
        fill="white"
      />
      <section>
        <div className="max-w-screen-xl px-4 py-8 mx-auto sm:py-12 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:order-last lg:h-full">
              <motion.div
                initial={{ opacity: 0, x: 45 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ ease: "circOut", duration: 1 }}
              >
                <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2rem] h-[600px] w-[300px]">
                  <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                  <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                  <div className="rounded-[1.5rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-gray-800">
                    <Image
                      src={PhoneImage}
                      // width={275}
                      // height={580}
                      fill
                      alt="mobile-app"
                      className="rounded-[1.5rem]"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="text-center lg:py-24">
              <div>
                <TextGenerate
                  text={t("title")}
                  textClasses={"text-3xl font-bold sm:text-4xl"}
                />
              </div>

              <div className="mt-4">
                {" "}
                <TextGenerate
                  text={t("description")}
                  speed={0.2}
                  textClasses={"text-gray-400"}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ease: "circOut", duration: 0.8 }}
              >
                <Button
                  isDisabled
                  href="#"
                  color="secondary"
                  className="px-12 py-3 mt-8 "
                >
                  {t("btn")}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
