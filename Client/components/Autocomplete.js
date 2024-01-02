"use client";
import { fetchMangaList } from "@/functions";
import { Avatar, Input } from "@nextui-org/react";
import { useRouter } from "next13-progressbar";
import React, { useEffect, useRef, useState } from "react";
import { TbSearch } from "react-icons/tb";

export default function Autocomplete({ value, placeholder, onChange }) {
  const autocomplete = useRef();
  const router = useRouter();

  const [mangas, setMangas] = useState([]);

  useEffect(() => {
    const getMangas = async () => {
      const response = await fetchMangaList();
      setMangas(response);
    };
    getMangas();
  }, []);

  const [optionsData, setOptionsData] = useState([]);
  const [query, setQuery] = useState(value);
  const [isShow, setIsShow] = useState(false);

  const handleInputChange = (v) => {
    setQuery(v);
    onChange(v);
    v === ""
      ? setOptionsData([])
      : setOptionsData([
          ...mangas.filter(
            (x) => x.name.toLowerCase().indexOf(v.toLowerCase()) > -1
          ),
        ]);
  };

  const handleClickOutSide = (e) => {
    if (autocomplete.current && !autocomplete.current.contains(e.target)) {
      setIsShow(false);
    }
  };

  const hilightSearchText = (text) => {
    var pattern = new RegExp("(" + query + ")", "gi");
    var new_text = text.replace(pattern, `<b>${query}</b>`);
    return new_text;
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutSide);
    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  }, []);

  useEffect(() => {
    optionsData.length !== 0 ? setIsShow(true) : setIsShow(false);
  }, [optionsData]);

  const push = (url) => {
    router.push(url);
  };

  return (
    <div ref={autocomplete} className="relative min-w-[320px]">
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        disabled={mangas.length === 0 || !mangas}
        onChange={(e) => handleInputChange(e.target.value)}
        autoComplete="off"
        startContent={
          <TbSearch className="flex-shrink-0 text-2xl pointer-events-none text-default-400" />
        }
      />
      {isShow && (
        <div className="absolute z-10 flex flex-col items-center justify-start w-full mt-2 overflow-y-auto bg-transparent rounded-md shadow-sm max-h-240">
          {optionsData.map((x, index) => (
            <div
              onClick={() => {
                push(`/manga/${x.slug}`);
                setQuery(x.name);
                setIsShow(false);
                onChange(x.name);
              }}
              key={index}
              className="flex flex-row items-center w-full gap-4 px-2 py-4 text-left border-none outline-none cursor-pointer text bg-zinc-800 hover:bg-zinc-900"
            >
              <Avatar radius="sm" src={x.coverImage} />
              <div
                dangerouslySetInnerHTML={{ __html: hilightSearchText(x.name) }}
                className="color-white"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
