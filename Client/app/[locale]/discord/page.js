"use client";
import { discordUrl } from "@/config";
import { useRouter } from "next/navigation";
import React from "react";

export default function Discord() {
  const router = useRouter();
  router.push(discordUrl);
  return <div>Yönlendiriliyosunuz</div>;
}
