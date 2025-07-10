"use client";
import * as React from "react"
import { isNodeSelection } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BlockQuoteIcon } from "@/components/tiptap-icons/block-quote-icon"

// --- Lib ---
import { isNodeInSchema } from "@/lib/tiptap-utils"

import { Button } from "@/components/tiptap-ui-primitive/button"

export function canToggleBlockquote(editor) {
  if (!editor) return false

  try {
    return editor.can().toggleWrap("blockquote");
  } catch {
    return false
  }
}

export function isBlockquoteActive(editor) {
  if (!editor) return false
  return editor.isActive("blockquote");
}

export function toggleBlockquote(editor) {
  if (!editor) return false
  return editor.chain().focus().toggleWrap("blockquote").run();
}

export function isBlockquoteButtonDisabled(editor, canToggle, userDisabled = false) {
  if (!editor) return true
  if (userDisabled) return true
  if (!canToggle) return true
  return false
}

export function shouldShowBlockquoteButton(params) {
  const { editor, hideWhenUnavailable, nodeInSchema, canToggle } = params

  if (!nodeInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable) {
    if (isNodeSelection(editor.state.selection) || !canToggle) {
      return false
    }
  }

  return Boolean(editor?.isEditable);
}

export function useBlockquoteState(
  editor,
  disabled = false,
  hideWhenUnavailable = false
) {
  const nodeInSchema = isNodeInSchema("blockquote", editor)

  const canToggle = canToggleBlockquote(editor)
  const isDisabled = isBlockquoteButtonDisabled(editor, canToggle, disabled)
  const isActive = isBlockquoteActive(editor)

  const shouldShow = React.useMemo(() =>
    shouldShowBlockquoteButton({
      editor,
      hideWhenUnavailable,
      nodeInSchema,
      canToggle,
    }), [editor, hideWhenUnavailable, nodeInSchema, canToggle])

  const handleToggle = React.useCallback(() => {
    if (!isDisabled && editor) {
      return toggleBlockquote(editor);
    }
    return false
  }, [editor, isDisabled])

  const shortcutKey = "Ctrl-Shift-b"
  const label = "Blockquote"

  return {
    nodeInSchema,
    canToggle,
    isDisabled,
    isActive,
    shouldShow,
    handleToggle,
    shortcutKey,
    label,
  }
}

export const BlockquoteButton = React.forwardRef((
  {
    editor: providedEditor,
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
    shouldShow,
    handleToggle,
    shortcutKey,
    label,
  } = useBlockquoteState(editor, disabled, hideWhenUnavailable)

  const handleClick = React.useCallback((e) => {
    onClick?.(e)

    if (!e.defaultPrevented && !isDisabled) {
      handleToggle()
    }
  }, [onClick, isDisabled, handleToggle])

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
      aria-label="blockquote"
      aria-pressed={isActive}
      tooltip={label}
      shortcutKeys={shortcutKey}
      onClick={handleClick}
      {...buttonProps}
      ref={ref}>
      {children || (
        <>
          <BlockQuoteIcon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
        </>
      )}
    </Button>
  );
})

BlockquoteButton.displayName = "BlockquoteButton"

export default BlockquoteButton
