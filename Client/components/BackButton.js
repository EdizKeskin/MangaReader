"use client";
import { Button } from "@nextui-org/react";
import { useRouter } from "next13-progressbar";
import { BiArrowBack } from "react-icons/bi";
import { cn } from "@/utils/cn";

const BackButton = ({ href, className, onClick }) => {
  const router = useRouter();
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <Button
        onPress={() => {
          onClick ? onClick() : href ? router.push(href) : router.back();
        }}
        isIconOnly
      >
        <BiArrowBack />
      </Button>
    </div>
  );
};

export default BackButton;
