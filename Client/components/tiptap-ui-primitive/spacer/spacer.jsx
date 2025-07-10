"use client";
import * as React from "react"

export const Spacer = React.forwardRef((
  { orientation = "horizontal", size, className = "", style = {}, ...props },
  ref
) => {
  const computedStyle = {
    ...style,
    ...(orientation === "horizontal" && !size && { flex: 1 }),
    ...(size && {
      width: orientation === "vertical" ? "1px" : size,
      height: orientation === "horizontal" ? "1px" : size,
    }),
  }

  return (<div ref={ref} {...props} className={className} style={computedStyle} />);
})

Spacer.displayName = "Spacer"
