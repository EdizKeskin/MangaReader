"use client";
import { Button } from "@nextui-org/react";
import { useRouter } from "next13-progressbar";
import { BiArrowBack } from "react-icons/bi";

const BackButton = ({ href }) => {
  const router = useRouter();
  return (
    <div className="flex items-start gap-2">
      <Button
        onClick={() => {
          href ? router.push(href) : router.back();
        }}
        isIconOnly
      >
        <BiArrowBack />
      </Button>
    </div>
  );
};
export default BackButton;
