"use client";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";

export default function EditorViewer({ value, theme }) {
  const editor = useBlockNote({
    initialContent: JSON.parse(value),
    editable: false,
  });

  return (
    <div>
      <BlockNoteView editor={editor} theme={theme ? theme : "dark"} />
    </div>
  );
}
