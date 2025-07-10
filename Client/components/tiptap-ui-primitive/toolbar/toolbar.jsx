"use client";
import * as React from "react"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import "@/components/tiptap-ui-primitive/toolbar/toolbar.scss"

const mergeRefs = refs => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value)
      } else if (ref != null) {
        ;(ref).current = value
      }
    })
  };
}

const useObserveVisibility = (ref, callback) => {
  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    let isMounted = true

    if (isMounted) {
      requestAnimationFrame(callback)
    }

    const observer = new MutationObserver(() => {
      if (isMounted) {
        requestAnimationFrame(callback)
      }
    })

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      isMounted = false
      observer.disconnect()
    };
  }, [ref, callback])
}

const useToolbarKeyboardNav = toolbarRef => {
  React.useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return

    const getFocusableElements = () =>
      Array.from(toolbar.querySelectorAll(
        'button:not([disabled]), [role="button"]:not([disabled]), [tabindex="0"]:not([disabled])'
      ))

    const navigateToIndex = (
      e,
      targetIndex,
      elements
    ) => {
      e.preventDefault()
      let nextIndex = targetIndex

      if (nextIndex >= elements.length) {
        nextIndex = 0
      } else if (nextIndex < 0) {
        nextIndex = elements.length - 1
      }

      elements[nextIndex]?.focus()
    }

    const handleKeyDown = (e) => {
      const focusableElements = getFocusableElements()
      if (!focusableElements.length) return

      const currentElement = document.activeElement
      const currentIndex = focusableElements.indexOf(currentElement)

      if (!toolbar.contains(currentElement)) return

      const keyActions = {
        ArrowRight: () =>
          navigateToIndex(e, currentIndex + 1, focusableElements),
        ArrowDown: () =>
          navigateToIndex(e, currentIndex + 1, focusableElements),
        ArrowLeft: () =>
          navigateToIndex(e, currentIndex - 1, focusableElements),
        ArrowUp: () => navigateToIndex(e, currentIndex - 1, focusableElements),
        Home: () => navigateToIndex(e, 0, focusableElements),
        End: () =>
          navigateToIndex(e, focusableElements.length - 1, focusableElements),
      }

      const action = keyActions[e.key]
      if (action) {
        action()
      }
    }

    const handleFocus = (e) => {
      const target = e.target
      if (toolbar.contains(target)) {
        target.setAttribute("data-focus-visible", "true")
      }
    }

    const handleBlur = (e) => {
      const target = e.target
      if (toolbar.contains(target)) {
        target.removeAttribute("data-focus-visible")
      }
    }

    toolbar.addEventListener("keydown", handleKeyDown)
    toolbar.addEventListener("focus", handleFocus, true)
    toolbar.addEventListener("blur", handleBlur, true)

    const focusableElements = getFocusableElements()
    focusableElements.forEach((element) => {
      element.addEventListener("focus", handleFocus)
      element.addEventListener("blur", handleBlur)
    })

    return () => {
      toolbar.removeEventListener("keydown", handleKeyDown)
      toolbar.removeEventListener("focus", handleFocus, true)
      toolbar.removeEventListener("blur", handleBlur, true)

      const focusableElements = getFocusableElements()
      focusableElements.forEach((element) => {
        element.removeEventListener("focus", handleFocus)
        element.removeEventListener("blur", handleBlur)
      })
    };
  }, [toolbarRef])
}

const useToolbarVisibility = ref => {
  const [isVisible, setIsVisible] = React.useState(true)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = React.useCallback(() => {
    if (!isMountedRef.current) return

    const toolbar = ref.current
    if (!toolbar) return

    // Check if any group has visible children
    const hasVisibleChildren = Array.from(toolbar.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false
      if (child.getAttribute("role") === "group") {
        return child.children.length > 0
      }
      return false
    })

    setIsVisible(hasVisibleChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

const useGroupVisibility = ref => {
  const [isVisible, setIsVisible] = React.useState(true)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = React.useCallback(() => {
    if (!isMountedRef.current) return

    const group = ref.current
    if (!group) return

    const hasVisibleChildren = Array.from(group.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false
      return true
    })

    setIsVisible(hasVisibleChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

const useSeparatorVisibility = ref => {
  const [isVisible, setIsVisible] = React.useState(true)
  const isMountedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const checkVisibility = React.useCallback(() => {
    if (!isMountedRef.current) return

    const separator = ref.current
    if (!separator) return

    const prevSibling = separator.previousElementSibling
    const nextSibling = separator.nextElementSibling

    if (!prevSibling || !nextSibling) {
      setIsVisible(false)
      return
    }

    const areBothGroups =
      prevSibling.getAttribute("role") === "group" &&
      nextSibling.getAttribute("role") === "group"

    const haveBothChildren =
      prevSibling.children.length > 0 && nextSibling.children.length > 0

    setIsVisible(areBothGroups && haveBothChildren)
  }, [ref])

  useObserveVisibility(ref, checkVisibility)
  return isVisible
}

export const Toolbar = React.forwardRef(({ children, className, variant = "fixed", ...props }, ref) => {
  const toolbarRef = React.useRef(null)
  const isVisible = useToolbarVisibility(toolbarRef)

  useToolbarKeyboardNav(toolbarRef)

  if (!isVisible) return null

  return (
    <div
      ref={mergeRefs([toolbarRef, ref])}
      role="toolbar"
      aria-label="toolbar"
      data-variant={variant}
      className={`tiptap-toolbar ${className || ""}`}
      {...props}>
      {children}
    </div>
  );
})

Toolbar.displayName = "Toolbar"

export const ToolbarGroup = React.forwardRef(({ children, className, ...props }, ref) => {
  const groupRef = React.useRef(null)
  const isVisible = useGroupVisibility(groupRef)

  if (!isVisible) return null

  return (
    <div
      ref={mergeRefs([groupRef, ref])}
      role="group"
      className={`tiptap-toolbar-group ${className || ""}`}
      {...props}>
      {children}
    </div>
  );
})

ToolbarGroup.displayName = "ToolbarGroup"

export const ToolbarSeparator = React.forwardRef(({ ...props }, ref) => {
  const separatorRef = React.useRef(null)
  const isVisible = useSeparatorVisibility(separatorRef)

  if (!isVisible) return null

  return (
    <Separator
      ref={mergeRefs([separatorRef, ref])}
      orientation="vertical"
      decorative
      {...props} />
  );
})

ToolbarSeparator.displayName = "ToolbarSeparator"
