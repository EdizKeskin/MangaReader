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
              <h2 className="text-4xl lg:text-7xl text-slate-50">
                Tomodachi Game
              </h2>
              <div className="text-base text-slate-300 line-clamp-2">
                Katagiri Yuuichi, arkadaşların paradan daha önemli olduğuna
                inanmaktadır. Ancak parasızlığında ne kadar zor olduğunun
                bilincindedir. Yapacakları okul gezisi için sıkı bir şekilde
                çalışıp para biriktirmektedir, çünkü arkadaşlarına beraber
                gideceklerine dair söz vermiştir. Ancak okulda geziye gidecek
                olan bütün sınıflardan para toplandıktan sonra toplanan para
                çalınır ! Şüpheliler Yuuichi’nin yakın arkadaşları Sawaragi
                Shiho ve Shibe Makato’dur.Kısa bir süre sonra Yuuichi ve 4
                arkadaşı kaçırılır. Tuhaf bir odada, önlerinde kısa süren bir
                animenin ana karakterini görürler. İdda ettiğine göre,
                aralarından biri onları &quot;Arkadaşlık Oyununa&quot; sokmuş ve
                5 arkadaşın birlik olarak onun borcunu ödemesi gerekiyormuş.
                Üstüne üstlük ödenmesi gereken borç, bütün sınıflardan okul
                gezisi için toplanan 20 Milyon Yendi. Yuuichi ve arkadaşları
                birbirlerine olan inançlarını yok edecek bu korkunç oyunu
                tamamlamayı başarabilecekler mi ?
              </div>
              <Button
                size="large"
                className="w-1/2"
                onClick={() => router.push("/manga/tomodachi-game")}
              >
                {t("gotoseries")}
              </Button>
            </div>
          )}
        </div>
      </div>
      {!isMobile && (
        <div className="absolute bottom-0 z-10 flex flex-col justify-end max-w-xl px-5 gap-y-4 lg:pl-16">
          <h2 className="text-4xl lg:text-7xl text-slate-50">Tomodachi Game</h2>
          <div className="text-base text-slate-300 line-clamp-2">
            Katagiri Yuuichi, arkadaşların paradan daha önemli olduğuna
            inanmaktadır. Ancak parasızlığında ne kadar zor olduğunun
            bilincindedir. Yapacakları okul gezisi için sıkı bir şekilde çalışıp
            para biriktirmektedir, çünkü arkadaşlarına beraber gideceklerine
            dair söz vermiştir. Ancak okulda geziye gidecek olan bütün
            sınıflardan para toplandıktan sonra toplanan para çalınır !
            Şüpheliler Yuuichi’nin yakın arkadaşları Sawaragi Shiho ve Shibe
            Makato’dur.Kısa bir süre sonra Yuuichi ve 4 arkadaşı kaçırılır.
            Tuhaf bir odada, önlerinde kısa süren bir animenin ana karakterini
            görürler. İdda ettiğine göre, aralarından biri onları
            &quot;Arkadaşlık Oyununa&quot; sokmuş ve 5 arkadaşın birlik olarak
            onun borcunu ödemesi gerekiyormuş. Üstüne üstlük ödenmesi gereken
            borç, bütün sınıflardan okul gezisi için toplanan 20 Milyon Yendi.
            Yuuichi ve arkadaşları birbirlerine olan inançlarını yok edecek bu
            korkunç oyunu tamamlamayı başarabilecekler mi ? .
          </div>
          <Button
            size="large"
            className="w-1/2"
            onClick={() => router.push("/manga/tomodachi-game")}
          >
            {t("gotoseries")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default Hero;
