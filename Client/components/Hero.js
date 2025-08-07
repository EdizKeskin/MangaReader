"use client";
import Image from "next/image";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import { useRouter } from "next13-progressbar";
import { useTranslations } from "next-intl";
import HeroImage from "@/public/phantom.webp";
import HeroImage2 from "@/public/trash.webp";
import HeroImage3 from "@/public/osa.webp";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useState, useEffect } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

function Hero() {
  const router = useRouter();
  const t = useTranslations("Hero");
  const { width } = useWindowSize();
  const [currentSlide, setCurrentSlide] = useState(0);

  const isMobile = width < 640;

  // Carousel data - 3 farklı item
  const carouselItems = [
    {
      id: 1,
      title: "Phantom Busters",
      description:
        "Lise birinci sınıf öğrencisi Eugene Korekishi, hiçbir ruhani gücü olmayan ve hayaletlere inanmayan bir onur öğrencisidir! Ancak lise hayatı, hayaletleri yiyerek kovduğunu söyleyen asi bir çocuk olan Mogari Shishikuno ile tanışınca beklenmedik bir şekilde değişir!",
      image: HeroImage,
      link: "/manga/phantom-busters",
      genres: ["Aksiyon", "Komedi", "Doğaüstü"],
      featured: true,
    },
    {
      id: 2,
      title: "What Do You Call This Trash",
      description:
        "Aşık olduğum kız, ağabeyimin eski sevgilisi. Yapışkan, inatçı ve zayıf noktalarımı kullanan aşağılık bir kız. Ama onunla olan ilişkimi bir türlü bitiremiyorum.",
      image: HeroImage2,
      link: "/manga/kono-gomi-wo-nanto-yobu",
      genres: ["Dram", "Seinen", "Okul Hayatı"],
      featured: false,
    },
    {
      id: 3,
      title: "Osananananajimi",
      description:
        "Momose Yuuichi ve Fujino Sumi, çocukluklarından beri birlikte büyümüş iki yakın arkadaştır. Şimdi aynı lisede okuyorlar ama ergenliğe girdiklerinden beri aralarındaki o eski samimiyet kalmamış gibi. Birbirlerini çok iyi tanısalar da aralarında sanki bir resmiyet duygusu var. İşte aralarındaki bu hassas ilişki, bir gün Sumi aniden Yuuichi’nin evine gelene kadar böyle devam eder...",
      image: HeroImage3,
      link: "/manga/osananananajimi",
      genres: ["Komedi", "Okul Hayatı", "Romantizm"],
      featured: false,
    },
  ];

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 8000); // 8 saniyede bir değişir

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentItem = carouselItems[currentSlide];

  return (
    <>
      {/* Desktop Design - Carousel */}
      {!isMobile && (
        <div className="relative xl:h-[65vh] xh-[40vh] xl:-mt-[60px] bg-black">
          <div className="w-full h-full">
            <div className="relative flex w-full xl:w-3/4 xl:left-1/4">
              <Image
                src={currentItem.image}
                alt={currentItem.title}
                width={3840}
                height={2160}
                className="object-cover w-full h-full transition-opacity duration-1000"
                priority
              />
              <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-r from-black from-30% lg:from-10% to-transparent"></div>
              <div className="h-[30vh] w-full absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent"></div>

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute z-20 h-full p-2 text-white transition-all duration-300 transform -translate-y-1/2 rounded-full left-24 top-1/2 hover:bg-black/50 hover:text-white "
                aria-label="Previous slide"
              >
                <IoChevronBack className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 z-20 h-full p-2 text-black transition-all duration-300 transform -translate-y-1/2 rounded-full top-1/2 hover:bg-black/50 hover:text-white backdrop-blur-sm"
                aria-label="Next slide"
              >
                <IoChevronForward className="w-6 h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute z-20 flex space-x-2 transform -translate-x-1/2 bottom-20 left-1/2">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 z-10 flex flex-col justify-end max-w-xl px-5 gap-y-4 lg:pl-16">
            <h2 className="text-4xl transition-all duration-1000 lg:text-7xl text-slate-50">
              {currentItem.title}
            </h2>
            <div className="text-base transition-all duration-1000 text-slate-300 line-clamp-2">
              {currentItem.description}
            </div>
            <Button
              size="large"
              className="w-1/2 transition-all duration-300"
              onClick={() => router.push(currentItem.link)}
            >
              {t("gotoseries")}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Design - Carousel */}
      {isMobile && (
        <div className="px-4 py-6 bg-black">
          <div className="relative">
            <Card
              className="w-full -mb-10 overflow-hidden transition-all duration-500 border shadow-2xl cursor-pointer bg-zinc-900/90 border-zinc-700/50 backdrop-blur-sm rounded-2xl hover:border-purple-500/50 group"
              onPress={() => router.push(currentItem.link)}
            >
              {/* Hero Image Section */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={currentItem.image}
                  alt={currentItem.title}
                  width={800}
                  height={400}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  priority
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>

                {/* Featured Badge */}
                {currentItem.featured && (
                  <div className="absolute top-3 left-3">
                    <Chip
                      size="sm"
                      variant="flat"
                      className="font-medium text-purple-300 border bg-purple-500/20 border-purple-500/30 backdrop-blur-sm"
                    >
                      🔥 Öne Çıkan
                    </Chip>
                  </div>
                )}

                {/* Navigation Buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  className="absolute z-20 p-1 text-white transition-all duration-300 transform -translate-y-1/2 rounded-full left-2 top-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                  aria-label="Previous slide"
                >
                  <IoChevronBack className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  className="absolute z-20 p-1 text-white transition-all duration-300 transform -translate-y-1/2 rounded-full right-2 top-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                  aria-label="Next slide"
                >
                  <IoChevronForward className="w-4 h-4" />
                </button>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h1 className="mb-2 text-2xl font-bold text-white transition-all duration-1000 drop-shadow-lg">
                    {currentItem.title}
                  </h1>
                </div>
              </div>

              {/* Content Section */}
              <CardBody className="p-5 space-y-4">
                {/* Genre Tags */}
                <div className="flex flex-wrap gap-2">
                  {currentItem.genres.map((genre, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      variant="flat"
                      className="text-xs bg-zinc-800 text-zinc-300"
                    >
                      {genre}
                    </Chip>
                  ))}
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed transition-all duration-1000 text-zinc-300 line-clamp-4">
                    {currentItem.description}
                  </p>
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center pt-2 space-x-2">
                  {carouselItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSlide(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "bg-purple-500 scale-125"
                          : "bg-zinc-600 hover:bg-zinc-500"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600
                             text-white font-semibold py-3 rounded-xl transition-all duration-300
                             shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]"
                  onClick={() => router.push(currentItem.link)}
                >
                  <span className="flex items-center space-x-2">
                    <span>📚</span>
                    <span>{t("gotoseries")}</span>
                  </span>
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

export default Hero;
