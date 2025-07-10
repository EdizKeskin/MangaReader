"use client";
import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { Redo2Icon } from "@/components/tiptap-icons/redo2-icon"
import { Undo2Icon } from "@/components/tiptap-icons/undo2-icon"

import { Button } from "@/components/tiptap-ui-primitive/button";

export const historyIcons = {
  undo: Undo2Icon,
  redo: Redo2Icon,
}

export const historyShortcutKeys = {
  undo: "Ctrl-z",
  redo: "Ctrl-Shift-z",
}

export const historyActionLabels = {
  undo: "Undo",
  redo: "Redo",
}

/**
 * Checks if a history action can be executed.
 *
 * @param editor The TipTap editor instance
 * @param action The history action to check
 * @returns Whether the action can be executed
 */
export function canExecuteHistoryAction(editor, action) {
  if (!editor) return false
  return action === "undo" ? editor.can().undo() : editor.can().redo();
}

/**
 * Executes a history action on the editor.
 *
 * @param editor The TipTap editor instance
 * @param action The history action to execute
 * @returns Whether the action was executed successfully
 */
export function executeHistoryAction(editor, action) {
  if (!editor) return false
  const chain = editor.chain().focus()
  return action === "undo" ? chain.undo().run() : chain.redo().run();
}

/**
 * Determines if a history action should be disabled.
 *
 * @param editor The TipTap editor instance
 * @param action The history action to check
 * @param userDisabled Whether the action is explicitly disabled by the user
 * @returns Whether the action should be disabled
 */
export function isHistoryActionDisabled(editor, action, userDisabled = false) {
  if (userDisabled) return true
  return !canExecuteHistoryAction(editor, action);
}

/**
 * Hook that provides all the necessary state and handlers for a history action.
 *
 * @param editor The TipTap editor instance
 * @param action The history action to handle
 * @param disabled Whether the action is explicitly disabled
 * @returns Object containing state and handlers for the history action
 */
export function useHistoryAction(
  editor,
  action,
  disabled = false
) {
  const canExecute = React.useMemo(() => canExecuteHistoryAction(editor, action), [editor, action])

  const isDisabled = isHistoryActionDisabled(editor, action, disabled)

  const handleAction = React.useCallback(() => {
    if (!editor || isDisabled) return
    executeHistoryAction(editor, action)
  }, [editor, action, isDisabled])

  const Icon = historyIcons[action]
  const actionLabel = historyActionLabels[action]
  const shortcutKey = historyShortcutKeys[action]

  return {
    canExecute,
    isDisabled,
    handleAction,
    Icon,
    actionLabel,
    shortcutKey,
  }
}

/**
 * Button component for triggering undo/redo actions in a TipTap editor.
 */
export const UndoRedoButton = React.forwardRef((
  {
    editor: providedEditor,
    action,
    text,
    className = "",
    disabled,
    onClick,
    children,
    ...buttonProps
  },
  ref
) => {
  const editor = useTiptapEditor(providedEditor)

  const { isDisabled, handleAction, Icon, actionLabel, shortcutKey } =
    useHistoryAction(editor, action, disabled)

  const handleClick = React.useCallback((e) => {
    onClick?.(e)

    if (!e.defaultPrevented && !disabled) {
      handleAction()
    }
  }, [onClick, disabled, handleAction])

  if (!editor || !editor.isEditable) {
    return null
  }

  return (
    <Button
      ref={ref}
      type="button"
      className={className.trim()}
      disabled={isDisabled}
      data-style="ghost"
      data-disabled={isDisabled}
      role="button"
      tabIndex={-1}
      aria-label={actionLabel}
      tooltip={actionLabel}
      shortcutKeys={shortcutKey}
      onClick={handleClick}
      {...buttonProps}>
      {children || (
        <>
          <Icon className="tiptap-button-icon" />
          {text && <span className="tiptap-button-text">{text}</span>}
        </>
      )}
    </Button>
  );
})

UndoRedoButton.displayName = "UndoRedoButton"

export default UndoRedoButton
