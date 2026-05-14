// src/components/shaders/themed/use-in-view.ts
"use client"

import { type RefObject, useEffect, useState } from "react"

export function useInView(
  ref: RefObject<Element | null>,
  rootMargin = "200px"
): boolean {
  // SSR-safe: assume in-view so server-rendered markup includes the shader subtree.
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, rootMargin])

  return inView
}
