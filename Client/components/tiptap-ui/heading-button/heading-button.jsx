"use client";
import * as React from "react"
import { isNodeSelection } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { HeadingOneIcon } from "@/components/tiptap-icons/heading-one-icon"
import { HeadingTwoIcon } from "@/components/tiptap-icons/heading-two-icon"
import { HeadingThreeIcon } from "@/components/tiptap-icons/heading-three-icon"
import { HeadingFourIcon } from "@/components/tiptap-icons/heading-four-icon"
import { HeadingFiveIcon } from "@/components/tiptap-icons/heading-five-icon"
import { HeadingSixIcon } from "@/components/tiptap-icons/heading-six-icon"

// --- Lib ---
import { isNodeInSchema } from "@/lib/tiptap-utils"

import { Button } from "@/components/tiptap-ui-primitive/button"

export const headingIcons = {
  1: HeadingOneIcon,
  2: HeadingTwoIcon,
  3: HeadingThreeIcon,
  4: HeadingFourIcon,
  5: HeadingFiveIcon,
  6: HeadingSixIcon,
}

export const headingShortcutKeys = {
  1: "Ctrl-Alt-1",
  2: "Ctrl-Alt-2",
  3: "Ctrl-Alt-3",
  4: "Ctrl-Alt-4",
  5: "Ctrl-Alt-5",
  6: "Ctrl-Alt-6",
}

export function canToggleHeading(editor, level) {
  if (!editor) return false

  try {
    return editor.can().toggleNode("heading", "paragraph", { level });
  } catch {
    return false
  }
}

export function isHeadingActive(editor, level) {
  if (!editor) return false
  return editor.isActive("heading", { level });
}

export function toggleHeading(editor, level) {
  if (!editor) return

  if (editor.isActive("heading", { level })) {
    editor.chain().focus().setNode("paragraph").run()
  } else {
    editor.chain().focus().toggleNode("heading", "paragraph", { level }).run()
  }
}

export function isHeadingButtonDisabled(editor, level, userDisabled = false) {
  if (!editor) return true
  if (userDisabled) return true
  if (!canToggleHeading(editor, level)) return true
  return false
}

export function shouldShowHeadingButton(params) {
  const { editor, hideWhenUnavailable, headingInSchema } = params

  if (!headingInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable) {
    if (isNodeSelection(editor.state.selection)) {
      return false
    }
  }

  return true
}

export function getFormattedHeadingName(level) {
  return `Heading ${level}`
}

export function useHeadingState(
  editor,
  level,
  disabled = false
) {
  const headingInSchema = isNodeInSchema("heading", editor)
  const isDisabled = isHeadingButtonDisabled(editor, level, disabled)
  const isActive = isHeadingActive(editor, level)

  const Icon = headingIcons[level]
  const shortcutKey = headingShortcutKeys[level]
  const formattedName = getFormattedHeadingName(level)

  return {
    headingInSchema,
    isDisabled,
    isActive,
    Icon,
    shortcutKey,
    formattedName,
  }
}

export const HeadingButton = React.forwardRef((
  {
    editor: providedEditor,
    level,
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
    headingInSchema,
    isDisabled,
    isActive,
    Icon,
    shortcutKey,
    formattedName,
  } = useHeadingState(editor, level, disabled)

  const handleClick = React.useCallback((e) => {
    onClick?.(e)

    if (!e.defaultPrevented && !isDisabled && editor) {
      toggleHeading(editor, level)
    }
  }, [onClick, isDisabled, editor, level])

  const show = React.useMemo(() => {
    return shouldShowHeadingButton({
      editor,
      level,
      hideWhenUnavailable,
      headingInSchema,
    });
  }, [editor, level, hideWhenUnavailable, headingInSchema])

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
      aria-label={formattedName}
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

HeadingButton.displayName = "HeadingButton"

export default HeadingButton
