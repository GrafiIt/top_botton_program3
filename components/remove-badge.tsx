"use client"

import { useEffect } from "react"

export function RemoveBadge() {
  useEffect(() => {
    const removeBadge = () => {
      // Remove all iframes that might be the v0 badge
      const iframes = document.querySelectorAll("iframe")
      iframes.forEach((iframe) => {
        const src = iframe.getAttribute("src") || ""
        if (src.includes("v0.dev") || src.includes("vercel.live") || src.includes("v0-")) {
          iframe.remove()
        }
      })

      // Remove fixed position divs in bottom right that might be badges
      const allDivs = document.querySelectorAll("div")
      allDivs.forEach((div) => {
        const style = window.getComputedStyle(div)
        if (
          style.position === "fixed" &&
          (style.bottom === "0px" || style.bottom === "20px") &&
          (style.right === "0px" || style.right === "20px")
        ) {
          const text = div.textContent || ""
          if (text.toLowerCase().includes("v0") || text.toLowerCase().includes("built with")) {
            div.remove()
          }
        }
      })
    }

    // Run immediately
    removeBadge()

    // Run after a short delay in case badge loads later
    const timer = setInterval(removeBadge, 1000)

    // Observe DOM changes
    const observer = new MutationObserver(removeBadge)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      clearInterval(timer)
      observer.disconnect()
    }
  }, [])

  return null
}
