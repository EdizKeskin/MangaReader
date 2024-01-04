"use client";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Next13ProgressBar } from "next13-progressbar";
import { color } from "@/config";

export default function Providers({ children }) {
  return (
    <NextUIProvider>
      {children}
      <Next13ProgressBar
        height="3px"
        color={color}
        options={{ showSpinner: true }}
        showOnShallow
      />
    </NextUIProvider>
  );
}
