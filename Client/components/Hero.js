"use client";
import Image from "next/image";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";
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
    <>
      {/* Desktop Design - Unchanged */}
      {!isMobile && (
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
                    gideceklerine dair söz vermiştir. Ancak okulda geziye
                    gidecek olan bütün sınıflardan para toplandıktan sonra
                    toplanan para çalınır ! Şüpheliler Yuuichi’nin yakın
                    arkadaşları Sawaragi Shiho ve Shibe Makato’dur.Kısa bir süre
                    sonra Yuuichi ve 4 arkadaşı kaçırılır. Tuhaf bir odada,
                    önlerinde kısa süren bir animenin ana karakterini görürler.
                    İdda ettiğine göre, aralarından biri onları &quot;Arkadaşlık
                    Oyununa&quot; sokmuş ve 5 arkadaşın birlik olarak onun
                    borcunu ödemesi gerekiyormuş. Üstüne üstlük ödenmesi gereken
                    borç, bütün sınıflardan okul gezisi için toplanan 20 Milyon
                    Yendi. Yuuichi ve arkadaşları birbirlerine olan inançlarını
                    yok edecek bu korkunç oyunu tamamlamayı başarabilecekler mi
                    ?
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
                tamamlamayı başarabilecekler mi ? .
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
      )}

      {/* Mobile Design - Completely New */}
      {isMobile && (
        <div className="px-4 py-6 bg-black">
          <Card
            className="w-full -mb-10 overflow-hidden transition-all duration-500 border shadow-2xl cursor-pointer bg-zinc-900/90 border-zinc-700/50 backdrop-blur-sm rounded-2xl hover:border-purple-500/50 group"
            onPress={() => router.push("/manga/tomodachi-game")}
          >
            {/* Hero Image Section */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={HeroImage}
                alt="Tomodachi Game"
                width={800}
                height={400}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                priority
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>

              {/* Featured Badge */}
              <div className="absolute top-3 left-3">
                <Chip
                  size="sm"
                  variant="flat"
                  className="font-medium text-purple-300 border bg-purple-500/20 border-purple-500/30 backdrop-blur-sm"
                >
                  🔥 Öne Çıkan
                </Chip>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h1 className="mb-2 text-2xl font-bold text-white drop-shadow-lg">
                  Tomodachi Game
                </h1>
              </div>
            </div>

            {/* Content Section */}
            <CardBody className="p-5 space-y-4">
              {/* Genre Tags */}
              <div className="flex flex-wrap gap-2">
                <Chip
                  size="sm"
                  variant="flat"
                  className="text-xs bg-zinc-800 text-zinc-300"
                >
                  Psikolojik
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  className="text-xs bg-zinc-800 text-zinc-300"
                >
                  Gerilim
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  className="text-xs bg-zinc-800 text-zinc-300"
                >
                  Drama
                </Chip>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-zinc-300 line-clamp-4">
                  Katagiri Yuuichi, arkadaşların paradan daha önemli olduğuna
                  inanmaktadır. Ancak parasızlığında ne kadar zor olduğunun
                  bilincindedir. Yapacakları okul gezisi için sıkı bir şekilde
                  çalışıp para biriktirmektedir...
                </p>
              </div>

              {/* Stats Row */}
              {/* <div className="flex items-center justify-between py-3 border-t border-zinc-700/50">
                <div className="flex items-center space-x-4 text-xs text-zinc-400">
                  <div className="flex items-center space-x-1">
                    <span>⭐</span>
                    <span>8.7</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>📖</span>
                    <span>127 Bölüm</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>👥</span>
                    <span>54K Okuyucu</span>
                  </div>
                </div>
              </div> */}

              {/* Action Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600
                           text-white font-semibold py-3 rounded-xl transition-all duration-300
                           shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]"
                onClick={() => router.push("/manga/tomodachi-game")}
              >
                <span className="flex items-center space-x-2">
                  <span>📚</span>
                  <span>{t("gotoseries")}</span>
                </span>
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}

export default Hero;
