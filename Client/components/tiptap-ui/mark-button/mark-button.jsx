"use client";
import * as React from "react"
import { isNodeSelection } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BoldIcon } from "@/components/tiptap-icons/bold-icon"
import { Code2Icon } from "@/components/tiptap-icons/code2-icon"
import { ItalicIcon } from "@/components/tiptap-icons/italic-icon"
import { StrikeIcon } from "@/components/tiptap-icons/strike-icon"
import { SubscriptIcon } from "@/components/tiptap-icons/subscript-icon"
import { SuperscriptIcon } from "@/components/tiptap-icons/superscript-icon"
import { UnderlineIcon } from "@/components/tiptap-icons/underline-icon"

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils"

import { Button } from "@/components/tiptap-ui-primitive/button"

export const markIcons = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strike: StrikeIcon,
  code: Code2Icon,
  superscript: SuperscriptIcon,
  subscript: SubscriptIcon,
}

export const markShortcutKeys = {
  bold: "Ctrl-b",
  italic: "Ctrl-i",
  underline: "Ctrl-u",
  strike: "Ctrl-Shift-s",
  code: "Ctrl-e",
  superscript: "Ctrl-.",
  subscript: "Ctrl-,",
}

export function canToggleMark(editor, type) {
  if (!editor) return false

  try {
    return editor.can().toggleMark(type);
  } catch {
    return false
  }
}

export function isMarkActive(editor, type) {
  if (!editor) return false
  return editor.isActive(type);
}

export function toggleMark(editor, type) {
  if (!editor) return
  editor.chain().focus().toggleMark(type).run()
}

export function isMarkButtonDisabled(editor, type, userDisabled = false) {
  if (!editor) return true
  if (userDisabled) return true
  if (editor.isActive("codeBlock")) return true
  if (!canToggleMark(editor, type)) return true
  return false
}

export function shouldShowMarkButton(params) {
  const { editor, type, hideWhenUnavailable, markInSchema } = params

  if (!markInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable) {
    if (
      isNodeSelection(editor.state.selection) ||
      !canToggleMark(editor, type)
    ) {
      return false
    }
  }

  return true
}

export function getFormattedMarkName(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function useMarkState(
  editor,
  type,
  disabled = false
) {
  const markInSchema = isMarkInSchema(type, editor)
  const isDisabled = isMarkButtonDisabled(editor, type, disabled)
  const isActive = isMarkActive(editor, type)

  const Icon = markIcons[type]
  const shortcutKey = markShortcutKeys[type]
  const formattedName = getFormattedMarkName(type)

  return {
    markInSchema,
    isDisabled,
    isActive,
    Icon,
    shortcutKey,
    formattedName,
  }
}

export const MarkButton = React.forwardRef((
  {
    editor: providedEditor,
    type,
    text,
    hideWhenUnavailable = false,
    className = "",
    disabled,
    onClick,
    children,
    ...buttonProps
  },
  ref
) => {
  const editor = useTiptapEditor(providedEditor)

  const {
    markInSchema,
    isDisabled,
    isActive,
    Icon,
    shortcutKey,
    formattedName,
  } = useMarkState(editor, type, disabled)

  const handleClick = React.useCallback((e) => {
    onClick?.(e)

    if (!e.defaultPrevented && !isDisabled && editor) {
      toggleMark(editor, type)
    }
  }, [onClick, isDisabled, editor, type])

  const show = React.useMemo(() => {
    return shouldShowMarkButton({
      editor,
      type,
      hideWhenUnavailable,
      markInSchema,
    });
  }, [editor, type, hideWhenUnavailable, markInSchema])

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  return (
    <Button
      type="button"
      className={className.trim()}
      disabled={isDisabled}
      data-style="ghost"
      data-active-state={isActive ? "on" : "off"}
      data-disabled={isDisabled}
      role="button"
      tabIndex={-1}
      aria-label={type}
      aria-pressed={isActive}
      tooltip={formattedName}
      shortcutKeys={shortcutKey}
      onClick={handleClick}
      {...buttonProps}
      ref={ref}>
      {children || (
        <>
          <Icon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
        </>
      )}
    </Button>
  );
})

MarkButton.displayName = "MarkButton"

export default MarkButton
