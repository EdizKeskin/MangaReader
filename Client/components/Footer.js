import Link from "next/link";
import React from "react";
import { BsDiscord, BsGithub, BsInstagram } from "react-icons/bs";
import { RiTwitterXLine } from "react-icons/ri";

export default function Footer() {
  return (
    <footer>
      <div className="max-w-screen-xl px-4 py-6 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
        <div className="flex justify-center mt-8 space-x-6">
          <Link
            href="https://www.instagram.com/ediz.keskinn"
            className="text-gray-400 hover:text-secondary"
          >
            <span className="sr-only">Instagram</span>
            <BsInstagram className="w-6 h-6" />
          </Link>
          <Link
            href="https://twitter.com/EdizKeskin_"
            className="text-gray-400 hover:text-secondary"
          >
            <span className="sr-only">Twitter</span>
            <RiTwitterXLine className="w-6 h-6" />
          </Link>
          <Link
            href="https://github.com/EdizKeskin"
            className="text-gray-400 hover:text-secondary"
          >
            <span className="sr-only">GitHub</span>
            <BsGithub className="w-6 h-6" />
          </Link>
          <Link href="discord" className="text-gray-400 hover:text-secondary">
            <span className="sr-only">Discord</span>
            <BsDiscord className="w-6 h-6" />
          </Link>
          <Link href="/dmca" className="text-gray-400 hover:text-secondary">
            <span className="sr-only">DMCA</span>
            <span className="text-xl font-bold ">DMCA</span>
          </Link>
        </div>
        <p className="mt-8 text-base leading-6 text-center text-gray-400">
          Made with ❤️ by{" "}
          <Link
            href={"https://github.com/EdizKeskin"}
            className="underline cursor-pointer"
          >
            Ediz Keskin
          </Link>
        </p>
      </div>
    </footer>
  );
}
