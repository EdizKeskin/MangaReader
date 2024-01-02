"use client";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useRouter } from "next13-progressbar";
import { useTranslations } from "next-intl";
import HeroImage from "@/public/hero.webp";
import { useWindowSize } from "@/hooks/useWindowSize";

function Hero() {
  const router = useRouter();
  const t = useTranslations("Hero");
  const { width } = useWindowSize();

  const isMobile = width < 640;

  return (
    <div className="relative xl:h-[65vh] xh-[40vh] xl:-mt-[60px] bg-black">
      <div className="w-full h-full">
        <div className="relative flex w-full xl:w-3/4 xl:left-1/4">
          <Image
            src={HeroImage}
            alt=""
            width={3840}
            height={2160}
            className="w-full h-full"
            priority
          />
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-r from-black from-30% lg:from-10% to-transparent"></div>
          <div className="h-[30vh] w-full absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent"></div>
          {isMobile && (
            <div className="absolute bottom-0 z-10 flex flex-col justify-end h-full max-w-xl px-5 gap-y-4 lg:pl-16">
              <h1 className="text-4xl lg:text-7xl text-slate-50">
                Jujutsu Kaisen
              </h1>
              <div className="text-base text-slate-300 line-clamp-2">
                Jujutsu Kaisen is a Japanese manga series written and
                illustrated by Gege Akutami, serialized in Shueisha&apos;s
                Weekly Shōnen Jump since March 2018. The individual chapters are
                collected and published by Shueisha, with thirteen tankōbon
                volumes released as of March 2021.
              </div>
              <Button
                size="large"
                className="w-1/2"
                onClick={() => router.push("/manga/jujutsu-kaisen")}
              >
                {t("gotoseries")}
              </Button>
            </div>
          )}
        </div>
      </div>
      {!isMobile && (
        <div className="absolute bottom-0 z-10 flex flex-col justify-end max-w-xl px-5 gap-y-4 lg:pl-16">
          <h1 className="text-4xl lg:text-7xl text-slate-50">Jujutsu Kaisen</h1>
          <div className="text-base text-slate-300 line-clamp-2">
            Jujutsu Kaisen is a Japanese manga series written and illustrated by
            Gege Akutami, serialized in Shueisha&apos;s Weekly Shōnen Jump since
            March 2018. The individual chapters are collected and published by
            Shueisha, with thirteen tankōbon volumes released as of March 2021.
          </div>
          <Button
            size="large"
            className="w-1/2"
            onClick={() => router.push("/manga/jujutsu-kaisen")}
          >
            {t("gotoseries")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default Hero;
