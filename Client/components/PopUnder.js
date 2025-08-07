"use client";
import { useEffect } from "react";

export default function Popunder() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//pl27367686.profitableratecpm.com/0c/85/0f/0c850fd914d593ea14fddaf8d129f4ab.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
