"use client";

import * as React from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";

import { Link } from "@/components/tiptap-extension/link-extension";
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension";

import {
  Button,
  Slider,
  Card,
  CardBody,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { TbSettings, TbPalette, TbColorSwatch } from "react-icons/tb";

import "@/components/tiptap-templates/simple/simple-editor.scss";

const fontSizes = [
  { key: "14", label: "XS - 14px", desc: "Very compact" },
  { key: "16", label: "SM - 16px", desc: "Small" },
  { key: "18", label: "MD - 18px", desc: "Default" },
  { key: "20", label: "LG - 20px", desc: "Comfortable" },
  { key: "22", label: "XL - 22px", desc: "Large" },
  { key: "24", label: "2XL - 24px", desc: "Extra Large" },
  { key: "28", label: "3XL - 28px", desc: "Very Large" },
  { key: "32", label: "4XL - 32px", desc: "Maximum" },
];

const textColors = [
  { key: "#1a1a1a", label: "Dark", color: "#1a1a1a" },
  { key: "#333333", label: "Dark Gray", color: "#333333" },
  { key: "#666666", label: "Medium Gray", color: "#666666" },
  { key: "#e5e5e5", label: "Light Gray", color: "#e5e5e5" },
  { key: "#ffffff", label: "White", color: "#ffffff" },
  { key: "#8b7355", label: "Sepia", color: "#8b7355" },
  { key: "#4a5568", label: "Blue Gray", color: "#4a5568" },
  { key: "#2d3748", label: "Dark Blue", color: "#2d3748" },
];

const backgroundColors = [
  { key: "#fefefe", label: "Pure White", color: "#fefefe" },
  { key: "#f9f9f9", label: "Off White", color: "#f9f9f9" },
  { key: "#f5f5dc", label: "Beige", color: "#f5f5dc" },
  { key: "#faf0e6", label: "Linen", color: "#faf0e6" },
  { key: "#0f0f0f", label: "Pure Black", color: "#0f0f0f" },
  { key: "#1a1a1a", label: "Dark Gray", color: "#1a1a1a" },
  { key: "#2d2d2d", label: "Medium Dark", color: "#2d2d2d" },
  { key: "#1e2024", label: "Dark Blue", color: "#1e2024" },
];

export function TiptapNovelReader({ value, theme = "dark" }) {
  const [showSettings, setShowSettings] = React.useState(false);
  const [fontSize, setFontSize] = React.useState("18");
  const [textColor, setTextColor] = React.useState(
    theme === "dark" ? "#e5e5e5" : "#1a1a1a"
  );
  const [backgroundColor, setBgColor] = React.useState(
    theme === "dark" ? "#0f0f0f" : "#fefefe"
  );
  const [lineHeight, setLineHeight] = React.useState(1.8);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setFontSize(localStorage.getItem("novelFontSize") || "18");
      setTextColor(
        localStorage.getItem("novelTextColor") ||
          (theme === "dark" ? "#e5e5e5" : "#1a1a1a")
      );
      setBgColor(
        localStorage.getItem("novelBgColor") ||
          (theme === "dark" ? "#0f0f0f" : "#fefefe")
      );
      setLineHeight(parseFloat(localStorage.getItem("novelLineHeight")) || 1.8);
    }
  }, [theme]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    editorProps: {
      attributes: {
        class: "tiptap-novel-reader",
      },
    },
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      TrailingNode,
      Link.configure({ openOnClick: true }),
    ],
    content: value || "",
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelFontSize", fontSize);
    }
  }, [fontSize]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelTextColor", textColor);
    }
  }, [textColor]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelBgColor", backgroundColor);
    }
  }, [backgroundColor]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelLineHeight", lineHeight.toString());
    }
  }, [lineHeight]);

  const contentStyle = {
    fontSize: `${fontSize}px`,
    color: textColor,
    backgroundColor: backgroundColor,
    lineHeight: lineHeight,

    minHeight: "100vh",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  };

  React.useEffect(() => {
    console.log("Current settings:", {
      fontSize,
      textColor,
      backgroundColor,
      lineHeight,
    });
  }, [fontSize, textColor, backgroundColor, lineHeight]);

  return (
    <div className="relative w-full">
      {/* Settings Button */}
      <div className="z-50 flex items-center justify-end mr-2 md:mr-16 ">
        <Button
          isIconOnly
          variant="solid"
          color="primary"
          className="shadow-lg"
          onClick={() => setShowSettings(!showSettings)}
        >
          <TbSettings size={20} />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-20 right-2 md:right-16 z-40 w-80 max-w-[90vw] max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <Card className="border border-gray-200 shadow-2xl dark:border-gray-700 backdrop-blur-md bg-white/95 dark:bg-gray-900/95">
            <CardBody className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <TbSettings size={20} />
                  Reading Settings
                </h3>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  onClick={() => setShowSettings(false)}
                >
                  ✕
                </Button>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔤</span>
                  <span className="text-sm font-medium">Font Size</span>
                </div>
                <Select
                  selectedKeys={new Set([fontSize])}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    if (selectedKey) {
                      console.log("Selected font size:", selectedKey);
                      setFontSize(selectedKey);
                    }
                  }}
                  labelPlacement="outside-left"
                  size="md"
                  selectionMode="single"
                  placeholder={
                    fontSizes.find((size) => size.key === fontSize)?.label ||
                    "Select font size"
                  }
                  variant="bordered"
                  renderValue={(items) => {
                    return items.map((item) => {
                      const size = fontSizes.find((s) => s.key === item.key);
                      return (
                        <div key={item.key} className="flex flex-col">
                          <span>{size?.label}</span>
                        </div>
                      );
                    });
                  }}
                >
                  {fontSizes.map((size) => (
                    <SelectItem key={size.key} value={size.key}>
                      <div className="flex flex-col">
                        <span>{size.label}</span>
                        <span className="text-xs text-gray-500">
                          {size.desc}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Line Height */}
              <div className="pb-4 space-y-2">
                <span className="text-sm font-medium">
                  Line Height: {lineHeight.toFixed(1)}
                </span>
                <Slider
                  size="sm"
                  step={0.1}
                  minValue={1.2}
                  maxValue={2.8}
                  value={lineHeight}
                  onChange={setLineHeight}
                  className="max-w-md"
                  marks={[
                    { value: 1.4, label: "Tight" },
                    { value: 1.8, label: "Normal" },
                    { value: 2.2, label: "Loose" },
                  ]}
                />
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TbPalette size={16} />
                  <span className="text-sm font-medium">Text Color</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {textColors.map((color) => (
                    <button
                      key={color.key}
                      className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                        textColor === color.key
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.color }}
                      onClick={() => setTextColor(color.key)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TbColorSwatch size={16} />
                  <span className="text-sm font-medium">Background Color</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color.key}
                      className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                        backgroundColor === color.key
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.color }}
                      onClick={() => setBgColor(color.key)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Reading Presets */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Quick Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      console.log("Setting Classic preset");
                      setFontSize("18");
                      setTextColor("#1a1a1a");
                      setBgColor("#fefefe");
                      setLineHeight(1.8);
                    }}
                    className="text-xs"
                  >
                    📖 Classic
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setFontSize("16");
                      setTextColor("#333333");
                      setBgColor("#f9f9f9");
                      setLineHeight(1.6);
                    }}
                    className="text-xs"
                  >
                    📰 Compact
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setFontSize("22");
                      setTextColor("#2d3748");
                      setBgColor("#f5f5dc");
                      setLineHeight(2.0);
                    }}
                    className="text-xs"
                  >
                    🌅 Comfort
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setFontSize("20");

                      setTextColor("#e5e5e5");
                      setBgColor("#0f0f0f");
                      setLineHeight(1.8);
                    }}
                    className="text-xs"
                  >
                    🌙 Night
                  </Button>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                size="sm"
                variant="bordered"
                onClick={() => {
                  setFontSize("18");
                  setTextColor(theme === "dark" ? "#e5e5e5" : "#1a1a1a");
                  setBgColor(theme === "dark" ? "#0f0f0f" : "#fefefe");
                  setLineHeight(1.8);
                }}
                className="w-full"
              >
                🔄 Reset to Default
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Novel Content */}
      <div className="w-full min-h-screen">
        <div
          style={contentStyle}
          className="px-4 py-6 transition-all duration-500 ease-in-out sm:px-6 md:px-8 lg:px-16 xl:px-20 sm:py-8 md:py-12 lg:py-16 tiptap-novel-container"
        >
          <style jsx>{`
            .tiptap-novel-container {
              font-family: "Georgia", "Times New Roman", serif'} !important;
              font-size: ${fontSize}px !important;
              color: ${textColor} !important;
              background-color: ${backgroundColor} !important;
              line-height: ${lineHeight} !important;
            }
            .tiptap-novel-reader {
              outline: none;
              word-spacing: 0.1em;
              letter-spacing: 0.02em;
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .tiptap-novel-reader * {
              font-family: inherit !important;
              font-size: inherit !important;
            }
            .tiptap-novel-reader h1,
            .tiptap-novel-reader h2,
            .tiptap-novel-reader h3,
            .tiptap-novel-reader h4,
            .tiptap-novel-reader h5,
            .tiptap-novel-reader h6 {
              margin-top: 3rem;
              margin-bottom: 1.5rem;
              font-weight: 700;
              text-align: center;
              color: inherit;
            }
            .tiptap-novel-reader h1 {
              font-size: 2.5em;
              margin-top: 2rem;
              margin-bottom: 2rem;
            }
            .tiptap-novel-reader h2 {
              font-size: 2em;
            }
            .tiptap-novel-reader h3 {
              font-size: 1.5em;
            }
            .tiptap-novel-reader p {
              margin-bottom: 1.8rem;
              text-align: left;
              text-indent: 0;
              line-height: inherit;
              hyphens: auto;
              word-break: break-word;
              orphans: 3;
              widows: 3;
            }
            .tiptap-novel-reader blockquote {
              border-left: 4px solid #666;
              padding-left: 1.5rem;
              margin: 2rem 0;
              font-style: italic;
              background: transparent;
              padding: 1.5rem;
              border-radius: 0;
              opacity: 0.8;
            }
            .tiptap-novel-reader ul,
            .tiptap-novel-reader ol {
              margin: 2rem 0;
              padding-left: 2rem;
            }
            .tiptap-novel-reader li {
              margin-bottom: 0.8rem;
            }
            .tiptap-novel-reader a {
              color: #4a90e2;
              text-decoration: none;
              border-bottom: 1px solid transparent;
              transition: border-bottom 0.2s;
            }
            .tiptap-novel-reader a:hover {
              border-bottom: 1px solid currentColor;
            }
            .tiptap-novel-reader code {
              background-color: rgba(128, 128, 128, 0.2);
              padding: 0.3rem 0.5rem;
              border-radius: 4px;
              font-family: "Courier New", monospace;
              font-size: 0.9em;
            }
            .tiptap-novel-reader img {
              max-width: 100%;
              height: auto;
              margin: 2rem auto;
              border-radius: 4px;
              display: block;
            }
            .tiptap-novel-reader strong {
              font-weight: 600;
            }
            .tiptap-novel-reader em {
              font-style: italic;
            }
          `}</style>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
