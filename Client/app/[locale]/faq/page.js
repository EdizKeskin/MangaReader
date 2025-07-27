"use client";
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { useTranslations } from "next-intl";

export default function FAQ({ params }) {
  const locale = params.locale;
  const t = useTranslations("Faq");

  const questionsTr = [
    {
      question: "MonoManga hakkında",
      answer:
        "eklenecek",
    },
    {
      question: "Site hakkında",
      answer:
        "Siteyi tamamen sıfırdan yaptım bu yüzden bir çok hata ile karşılaşabilirsiniz. Hataları discord yada github üzerinden bildirebilirsiniz.",
    },
    {
      question: "Katkıda bulunabilir miyim?",
      answer:
        "Sitenın geliştirilmesi için katkıda bulunmak istiyorsanız discord üzerinden bana ulaşabilirsiniz(shrp4) veya github üzerinden pr açabilirsiniz. Sitedeki seriler için katkıda bulunmak istiyorsanız discord adresimize gelip detaylı bilgi alabilirsiniz.",
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
    <div className="flex flex-col items-center justify-center ">
      <h2 className="my-10 text-4xl font-bold">{t("title")}</h2>
      <div className="container ">
        <Accordion variant="splitted">
          {locale === "tr"
            ? questionsTr.map((question, index) => (
                <AccordionItem
                  key={index}
                  title={question.question}
                  className="z-20 mx-4 md:mx-0"
                >
                  {question.answer}
                </AccordionItem>
              ))
            : questionsEn.map((question, index) => (
                <AccordionItem
                  key={index}
                  title={question.question}
                  className="mx-4 md:mx-0"
                >
                  {question.answer}
                </AccordionItem>
              ))}
        </Accordion>
      </div>
    </div>
  );
}
