"use client";
import { useEffect } from "react";

export default function SocialBar() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//pl27369054.profitableratecpm.com/54/6d/50/546d506ca19529007fb803a929c8de13.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null; // Bu bileşen ekranda bir şey render etmez
}
