"use client";
import BackButton from "@/components/BackButton";
import PricingCard from "@/components/PricingCard";
import React from "react";

export default function Pricing() {
  const pro = {
    specs: [
      { title: "Bölümlere Erken Erişim" },
      { title: "30 gün süre" },
      { title: "Discord'da efsanevi bi rol" },
      { title: "Ekstra farkı yok bizi daha fazla destekliyon :D" },
    ],
    price: "30TL",
    title: "Pro",
  };
  const starter = {
    specs: [{ title: "Bölümlere Erken Erişim" }, { title: "30 gün" }],
    price: "10TL",
    title: "Starter",
  };
  return (
    <div className="m-10 ">
      <BackButton />
      <div>
        <div className="max-w-3xl px-4 py-8 mx-auto sm:px-6 sm:py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center md:gap-8">
            <PricingCard data={pro} bordered />
            <PricingCard data={starter} />
          </div>
        </div>
      </div>
    </div>
  );
}
