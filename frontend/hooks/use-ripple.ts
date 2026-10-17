import type React from "react";

/**
 * Themed press-ripple for buttons. Ported from the sibling projects
 * (mazlum-ummah / bashantabilash / mmbc) and adapted to this project's theme.
 *
 * Usage:
 *   const createRipple = useRipple();
 *   <button onClick={(e) => { createRipple(e); handleClick(); }}>…</button>
 *
 * The button must set `position: relative; overflow: hidden` so the span is
 * clipped to its shape. Ripple colour comes from the `--ripple-color` CSS
 * variable (app/globals.css); override it per-button for e.g. a white tint on
 * a primary-filled button.
 */
export function useRipple() {
  return (target: React.MouseEvent<HTMLElement> | HTMLElement) => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      return;
    }
    const button =
      target && "currentTarget" in target
        ? (target.currentTarget as HTMLElement)
        : (target as HTMLElement);
    if (!button) return;
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const isMouseEvent = target && "clientX" in target;
    const clientX = isMouseEvent && target.clientX ? target.clientX : rect.left + rect.width / 2;
    const clientY = isMouseEvent && target.clientY ? target.clientY : rect.top + rect.height / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${clientX - rect.left - size / 2}px`;
    ripple.style.top = `${clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  };
}
