"use client"

import { useEffect } from "react"

export default function EnerplatePage() {
  useEffect(() => {
    // 외부 사이트로 리다이렉션
    window.location.href = "http://106.254.245.74:8081/"
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">리다이렉션 중...</div>
        <div className="text-sm text-muted-foreground">잠시만 기다려주세요.</div>
      </div>
    </div>
  )
}
