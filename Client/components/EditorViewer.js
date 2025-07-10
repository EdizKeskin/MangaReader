"use client";
import { TiptapNovelReader } from "@/components/TiptapNovelReader";

export default function EditorViewer({ value, theme = "dark" }) {
  return (
    <TiptapNovelReader 
      value={value} 
      theme={theme}
    />
  );
} 