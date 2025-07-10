"use client";
import * as React from "react"
import { useCurrentEditor } from "@tiptap/react"

export function useTiptapEditor(providedEditor) {
  const { editor: coreEditor } = useCurrentEditor()
  return React.useMemo(() => providedEditor || coreEditor, [providedEditor, coreEditor]);
}
