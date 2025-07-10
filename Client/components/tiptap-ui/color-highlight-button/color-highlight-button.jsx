"use client";
import * as React from "react"
import { isNodeSelection } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import {
  findNodePosition,
  isEmptyNode,
  isMarkInSchema,
} from "@/lib/tiptap-utils"

import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Styles ---
import "@/components/tiptap-ui/color-highlight-button/color-highlight-button.scss"

export const HIGHLIGHT_COLORS = [
  {
    label: "Default background",
    value: "var(--tt-bg-color)",
    border: "var(--tt-bg-color-contrast)",
  },
  {
    label: "Gray background",
    value: "var(--tt-color-highlight-gray)",
    border: "var(--tt-color-highlight-gray-contrast)",
  },
  {
    label: "Brown background",
    value: "var(--tt-color-highlight-brown)",
    border: "var(--tt-color-highlight-brown-contrast)",
  },
  {
    label: "Orange background",
    value: "var(--tt-color-highlight-orange)",
    border: "var(--tt-color-highlight-orange-contrast)",
  },
  {
    label: "Yellow background",
    value: "var(--tt-color-highlight-yellow)",
    border: "var(--tt-color-highlight-yellow-contrast)",
  },
  {
    label: "Green background",
    value: "var(--tt-color-highlight-green)",
    border: "var(--tt-color-highlight-green-contrast)",
  },
  {
    label: "Blue background",
    value: "var(--tt-color-highlight-blue)",
    border: "var(--tt-color-highlight-blue-contrast)",
  },
  {
    label: "Purple background",
    value: "var(--tt-color-highlight-purple)",
    border: "var(--tt-color-highlight-purple-contrast)",
  },
  {
    label: "Pink background",
    value: "var(--tt-color-highlight-pink)",
    border: "var(--tt-color-highlight-pink-contrast)",
  },
  {
    label: "Red background",
    value: "var(--tt-color-highlight-red)",
    border: "var(--tt-color-highlight-red-contrast)",
  },
]

/**
 * Checks if highlight can be toggled in the current editor state
 */
export function canToggleHighlight(editor) {
  if (!editor) return false
  try {
    return editor.can().setMark("highlight");
  } catch {
    return false
  }
}

/**
 * Checks if highlight is active in the current selection
 */
export function isHighlightActive(editor, color) {
  if (!editor) return false
  return editor.isActive("highlight", { color });
}

/**
 * Toggles highlight on the current selection or specified node
 */
export function toggleHighlight(editor, color, node, nodePos) {
  if (!editor) return

  try {
    const chain = editor.chain().focus()

    if (isEmptyNode(node)) {
      chain.toggleMark("highlight", { color }).run()
    } else if (nodePos !== undefined && nodePos !== null && nodePos !== -1) {
      chain.setNodeSelection(nodePos).toggleMark("highlight", { color }).run()
    } else if (node) {
      const foundPos = findNodePosition({ editor, node })
      if (foundPos) {
        chain
          .setNodeSelection(foundPos.pos)
          .toggleMark("highlight", { color })
          .run()
      } else {
        chain.toggleMark("highlight", { color }).run()
      }
    } else {
      chain.toggleMark("highlight", { color }).run()
    }

    editor.chain().setMeta("hideDragHandle", true).run()
  } catch (error) {
    console.error("Failed to apply highlight:", error)
  }
}

/**
 * Determines if the highlight button should be disabled
 */
export function isColorHighlightButtonDisabled(editor, userDisabled = false) {
  if (!editor || userDisabled) return true

  const isIncompatibleContext =
    editor.isActive("code") ||
    editor.isActive("codeBlock") ||
    editor.isActive("imageUpload")

  return isIncompatibleContext || !canToggleHighlight(editor);
}

/**
 * Determines if the highlight button should be shown
 */
export function shouldShowColorHighlightButton(editor, hideWhenUnavailable, highlightInSchema) {
  if (!highlightInSchema || !editor) return false

  if (hideWhenUnavailable) {
    if (
      isNodeSelection(editor.state.selection) ||
      !canToggleHighlight(editor)
    ) {
      return false
    }
  }

  return true
}

/**
 * Custom hook to manage highlight button state
 */
export function useHighlightState(
  editor,
  color,
  disabled = false,
  hideWhenUnavailable = false
) {
  const highlightInSchema = isMarkInSchema("highlight", editor)
  const isDisabled = isColorHighlightButtonDisabled(editor, disabled)
  const isActive = isHighlightActive(editor, color)

  const shouldShow = React.useMemo(() =>
    shouldShowColorHighlightButton(editor, hideWhenUnavailable, highlightInSchema), [editor, hideWhenUnavailable, highlightInSchema])

  return {
    highlightInSchema,
    isDisabled,
    isActive,
    shouldShow,
  }
}

/**
 * ColorHighlightButton component for TipTap editor
 */
export const ColorHighlightButton = React.forwardRef((
  {
    editor: providedEditor,
    node,
    nodePos,
    color,
    text,
    hideWhenUnavailable = false,
    className = "",
    disabled,
    onClick,
    onApplied,
    children,
    style,
    ...buttonProps
  },
  ref
) => {
  const editor = useTiptapEditor(providedEditor)
  const { isDisabled, isActive, shouldShow } = useHighlightState(editor, color, disabled, hideWhenUnavailable)

  const handleClick = React.useCallback((e) => {
    onClick?.(e)

    if (!e.defaultPrevented && !isDisabled && editor) {
      toggleHighlight(editor, color, node, nodePos)
      onApplied?.(color)
    }
  }, [color, editor, isDisabled, node, nodePos, onClick, onApplied])

  const buttonStyle = React.useMemo(() =>
    ({
      ...style,
      "--highlight-color": color
    }), [color, style])

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
      aria-label={`${color} highlight color`}
      aria-pressed={isActive}
      onClick={handleClick}
      style={buttonStyle}
      {...buttonProps}
      ref={ref}>
      {children || (
        <>
          <span
            className="tiptap-button-highlight"
            style={{
              "--highlight-color": color
            }} />
          {text && <span className="tiptap-button-text">{text}</span>}
        </>
      )}
    </Button>
  );
})

ColorHighlightButton.displayName = "ColorHighlightButton"

export default ColorHighlightButton
