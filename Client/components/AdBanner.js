"use client";
import { useEffect } from "react";

export default function AdBanner() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//pl27303366.profitableratecpm.com/6033f75d0e0e9d855561929b6233185b/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.getElementById("ad-container")?.appendChild(script);
  }, []);

  return (
    <div id="ad-container">
      <div id="container-6033f75d0e0e9d855561929b6233185b"></div>
    </div>
  );
}
