"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Spotlight from "@/components/Spotlight";

// Custom Accordion Components
const Accordion = ({ children, variant = "splitted", className = "" }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleItemClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div
      className={`flex flex-col ${
        variant === "splitted" ? "gap-4" : ""
      } ${className}`}
    >
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          isOpen: openIndex === index,
          onToggle: () => handleItemClick(index),
        })
      )}
    </div>
  );
};

const AccordionItem = ({
  title,
  children,
  className = "",
  isOpen,
  onToggle,
}) => {
  return (
    <div
      className={`border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/50 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-500/30 hover:scale-[1.02] transform ${className}`}
    >
      <button
        className="flex items-center justify-between w-full px-6 py-4 text-left transition-all duration-300 bg-zinc-800/30 hover:bg-zinc-700/50 group"
        onClick={onToggle}
      >
        <span className="font-semibold transition-colors duration-300 text-zinc-100 group-hover:text-purple-300">
          {title}
        </span>
        <svg
          className={`w-5 h-5 text-zinc-400 group-hover:text-purple-400 transform transition-all duration-300 ${
            isOpen ? "rotate-180 text-purple-400 scale-110" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isOpen
            ? "max-h-96 opacity-100 transform translate-y-0"
            : "max-h-0 opacity-0 transform -translate-y-2"
        }`}
      >
        <div
          className={`px-6 py-4 text-zinc-300 bg-zinc-900/80 border-t border-zinc-700/50 leading-relaxed transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default function FAQ({ params }) {
  const locale = params.locale;
  const t = useTranslations("Faq");

  const questionsTr = [
    {
      question: "Siz Kimsiniz?",
      answer:
        "2021 Yılında faaliyete geçmiş bir çeviri grubuyuz. Mono Manga adı ile çoğunluklu manga olmak üzere (arada webtoon novel falan da) birçok seriyi elimizden geldiğince yapıyoruz.",
    },
    {
      question: "Kapanmamış Mıydınız? Sahte misiniz?",
      answer: "Yok aynıyız. Canımız istediği için geri açtık.",
    },
    {
      question: "Yeni bölüm ne zaman gelir?",
      answer: "'Takvim' kısmından serilerinizi takip edebilirsiniz.",
    },
    {
      question: "Site hakkında sorun yaşıyorum ne yapayım?",
      answer:
        "Sitede yaşamış olduğunuz aksaklıklar veya görmüş olduğunuz sorunlar hatta önerileriniz için discord adresimize gelerek 'Bilet' kısmından bizimle iletişime geçebilirsiniz.",
    },
    {
      question: "Katkıda bulunabilir miyim?",
      answer:
        "Sitemizden bölüm okuyarak, sitedeki sorunları bildirerek ve iyi birer okuyucu olarak yardımcı olabilirsiniz. Ayrıca sitenin geliştirilmesine katkıda bulunmak isterseniz, discord adresimizden bize ulaşabilirsiniz veya github üzerinden de katkıda bulunabilirsiniz.",
    },
  ];

  const questionsEn = [
    {
      question: "What is this site and why is it here?",
      answer:
        "I made the site entirely according to my own pleasure. All of the content on the site has been taken from other sites for example purposes. For more technical information or questions, you can contact me.",
    },
    {
      question: "There are certain errors on the site, why?",
      answer:
        "Because I am developing and trying to test it alone, there may be errors in certain places (especially spelling or translation errors). I would be happy if you report the errors to me.",
    },
    {
      question: "Can I contribute?",
      answer:
        "I will share the site as open source soon. In this way, you can contribute as you wish.",
    },
  ];

  return (
    <div className="">
      {/* Background Pattern */}
      <Spotlight
        className="left-0 z-0 hidden -top-40 md:left-60 md:-top-20 md:block"
        fill="white"
      />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-fixed"></div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-transparent md:text-6xl bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text">
            {t("title")}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-400">
            {locale === "tr"
              ? "Sık sorulan sorular ve cevaplar"
              : "Frequently asked questions and answers"}
          </p>
        </div>

        <div className="w-full max-w-4xl">
          <Accordion variant="splitted">
            {locale === "tr"
              ? questionsTr.map((question, index) => (
                  <AccordionItem
                    key={index}
                    title={question.question}
                    className="z-20"
                  >
                    {question.answer}
                  </AccordionItem>
                ))
              : questionsEn.map((question, index) => (
                  <AccordionItem
                    key={index}
                    title={question.question}
                    className="z-20"
                  >
                    {question.answer}
                  </AccordionItem>
                ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
