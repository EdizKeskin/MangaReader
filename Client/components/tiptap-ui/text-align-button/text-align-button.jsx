"use client";
import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { AlignCenterIcon } from "@/components/tiptap-icons/align-center-icon"
import { AlignJustifyIcon } from "@/components/tiptap-icons/align-justify-icon"
import { AlignLeftIcon } from "@/components/tiptap-icons/align-left-icon"
import { AlignRightIcon } from "@/components/tiptap-icons/align-right-icon"

import { Button } from "@/components/tiptap-ui-primitive/button"

export const textAlignIcons = {
  left: AlignLeftIcon,
  center: AlignCenterIcon,
  right: AlignRightIcon,
  justify: AlignJustifyIcon,
}

export const textAlignShortcutKeys = {
  left: "Ctrl-Shift-l",
  center: "Ctrl-Shift-e",
  right: "Ctrl-Shift-r",
  justify: "Ctrl-Shift-j",
}

export const textAlignLabels = {
  left: "Align left",
  center: "Align center",
  right: "Align right",
  justify: "Align justify",
}

export function hasSetTextAlign(commands) {
  return "setTextAlign" in commands
}

export function checkTextAlignExtension(editor) {
  if (!editor) return false

  const hasExtension = editor.extensionManager.extensions.some((extension) => extension.name === "textAlign")

  if (!hasExtension) {
    console.warn("TextAlign extension is not available. " +
      "Make sure it is included in your editor configuration.")
  }

  return hasExtension
}

export function canSetTextAlign(editor, align, alignAvailable) {
  if (!editor || !alignAvailable) return false

  try {
    return editor.can().setTextAlign(align);
  } catch {
    return false
  }
}

export function isTextAlignActive(editor, align) {
  if (!editor) return false
  return editor.isActive({ textAlign: align });
}

export function setTextAlign(editor, align) {
  if (!editor) return false

  const chain = editor.chain().focus()
  if (hasSetTextAlign(chain)) {
    return chain.setTextAlign(align).run();
  }
  return false
}

export function isTextAlignButtonDisabled(editor, alignAvailable, canAlign, userDisabled = false) {
  if (!editor || !alignAvailable) return true
  if (userDisabled) return true
  if (!canAlign) return true
  return false
}

export function shouldShowTextAlignButton(editor, canAlign, hideWhenUnavailable) {
  if (!editor?.isEditable) return false
  if (hideWhenUnavailable && !canAlign) return false
  return true
}

export function useTextAlign(
  editor,
  align,
  disabled = false,
  hideWhenUnavailable = false
) {
  const alignAvailable = React.useMemo(() => checkTextAlignExtension(editor), [editor])

  const canAlign = React.useMemo(
    () => canSetTextAlign(editor, align, alignAvailable),
    [editor, align, alignAvailable]
  )

  const isDisabled = isTextAlignButtonDisabled(editor, alignAvailable, canAlign, disabled)
  const isActive = isTextAlignActive(editor, align)

  const handleAlignment = React.useCallback(() => {
    if (!alignAvailable || !editor || isDisabled) return false
    return setTextAlign(editor, align);
  }, [alignAvailable, editor, isDisabled, align])

  const shouldShow = React.useMemo(
    () => shouldShowTextAlignButton(editor, canAlign, hideWhenUnavailable),
    [editor, canAlign, hideWhenUnavailable]
  )

  const Icon = textAlignIcons[align]
  const shortcutKey = textAlignShortcutKeys[align]
  const label = textAlignLabels[align]

  return {
    alignAvailable,
    canAlign,
    isDisabled,
    isActive,
    handleAlignment,
    shouldShow,
    Icon,
    shortcutKey,
    label,
  }
}

export const TextAlignButton = React.forwardRef((
  {
    editor: providedEditor,
    align,
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
    isDisabled,
    isActive,
    handleAlignment,
    shouldShow,
    Icon,
    shortcutKey,
    label,
  } = useTextAlign(editor, align, disabled, hideWhenUnavailable)

  const handleClick = React.useCallback((e) => {
    onClick?.(e)

    if (!e.defaultPrevented && !disabled) {
      handleAlignment()
    }
  }, [onClick, disabled, handleAlignment])

  if (!shouldShow || !editor || !editor.isEditable) {
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
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
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

TextAlignButton.displayName = "TextAlignButton"

export default TextAlignButton
