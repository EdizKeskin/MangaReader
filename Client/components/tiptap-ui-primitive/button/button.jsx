"use client";
import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tiptap-ui-primitive/tooltip"

import "@/components/tiptap-ui-primitive/button/button-colors.scss"
import "@/components/tiptap-ui-primitive/button/button-group.scss"
import "@/components/tiptap-ui-primitive/button/button.scss"

export const MAC_SYMBOLS = {
  ctrl: "⌘",
  alt: "⌥",
  shift: "⇧"
}

export const formatShortcutKey = (key, isMac) => {
  if (isMac) {
    const lowerKey = key.toLowerCase()
    return MAC_SYMBOLS[lowerKey] || key.toUpperCase();
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export const parseShortcutKeys = (
  shortcutKeys,
  isMac
) => {
  if (!shortcutKeys) return []

  return shortcutKeys
    .split("-")
    .map((key) => key.trim())
    .map((key) => formatShortcutKey(key, isMac));
}

export const ShortcutDisplay = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null

  return (
    <div>
      {shortcuts.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <kbd>+</kbd>}
          <kbd>{key}</kbd>
        </React.Fragment>
      ))}
    </div>
  );
}

export const Button = React.forwardRef((
  {
    className = "",
    children,
    tooltip,
    showTooltip = true,
    shortcutKeys,
    "aria-label": ariaLabel,
    ...props
  },
  ref
) => {
  const isMac = React.useMemo(() =>
    typeof navigator !== "undefined" &&
    navigator.platform.toLowerCase().includes("mac"), [])

  const shortcuts = React.useMemo(() => parseShortcutKeys(shortcutKeys, isMac), [shortcutKeys, isMac])

  if (!tooltip || !showTooltip) {
    return (
      <button
        className={`tiptap-button ${className}`.trim()}
        ref={ref}
        aria-label={ariaLabel}
        {...props}>
        {children}
      </button>
    );
  }

  return (
    <Tooltip delay={200}>
      <TooltipTrigger
        className={`tiptap-button ${className}`.trim()}
        ref={ref}
        aria-label={ariaLabel}
        {...props}>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        {tooltip}
        <ShortcutDisplay shortcuts={shortcuts} />
      </TooltipContent>
    </Tooltip>
  );
})

Button.displayName = "Button"

export default Button
