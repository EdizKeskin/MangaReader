"use client";
import { Button } from "@nextui-org/react";
import React from "react";

export default function PricingCard({ data, bordered }) {
  console.log(data);
  return (
    <div
      className={`p-6 border ${
        bordered
          ? "border-indigo-600 ring-indigo-600 ring-1 sm:order-last shadow-sm  rounded-2xl sm:px-8 lg:p-12"
          : "p-6 border border-gray-200 shadow-sm rounded-2xl sm:px-8 lg:p-12"
      } bg-zinc-800 shadow-lg`}
    >
      <div className="text-center">
        <h2 className="text-lg font-medium ">
          {data.title}
          <span className="sr-only">Plan</span>
        </h2>

        <p className="mt-2 sm:mt-4">
          <strong className="text-3xl font-bold sm:text-4xl">
            {data.price}
          </strong>

          <span className="text-sm font-medium text-gray-500">/ay</span>
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {data.specs.map((item, i) => (
          <li className="flex items-center gap-1" key={i}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 text-indigo-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>

            <span className="text-gray-400">{item.title}</span>
          </li>
        ))}
      </ul>

      <Button className="w-full mt-6" color="secondary" isDisabled>
        Satın al
      </Button>
    </div>
  );
}
