"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-12 w-40">
            <Image
              src="/images/b-ci.png"
              alt="(주)에너플레이트"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
      </div>
    </header>
  )
}
