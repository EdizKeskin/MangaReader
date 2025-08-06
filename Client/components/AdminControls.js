"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";
import { TbPlus, TbBookUpload } from "react-icons/tb";

export default function AdminControls() {
  return (
    <div className="flex justify-center mb-12 ">
      <div className="flex flex-col gap-4 px-6 sm:flex-row">
        <Button
          as={Link}
          href="/admin/mangas/add"
          color="primary"
          size="lg"
          startContent={<TbPlus size={20} />}
        >
          Yeni Manga Ekle
        </Button>
        <Button
          as={Link}
          href="/admin/chapters/add"
          color="secondary"
          size="lg"
          startContent={<TbBookUpload size={20} />}
        >
          Yeni Bölüm Ekle
        </Button>
      </div>
    </div>
  );
}
