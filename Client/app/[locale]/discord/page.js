"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function Discord() {
  const router = useRouter();
  router.push("https://discord.gg/vaTnFDB6Nr");
  return <div>Yönlendiriliyosunuz</div>;
}
