"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export function SiteHeader() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { language, setLanguage } = useLanguage()
  const t = translations.nav

  const navigation = [
    {
      title: t.about[language],
      items: [
        { title: t.ceo[language], href: "/about/ceo" },
        { title: t.overview[language], href: "/about/overview" },
        { title: t.location[language], href: "/about/location" },
      ],
    },
    {
      title: t.business[language],
      items: [
        { title: t.vision[language], href: "/business/vision" },
        { title: t.products[language], href: "/business/products" },
      ],
    },
    {
      title: t.contact[language],
      items: [
        { title: t.organization[language], href: "/contact/organization" },
        { title: t.info[language], href: "/contact/info" },
      ],
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-12 w-40">
            <Image
              src={language === "en" ? "/images/b-ci-en-header.png" : "/images/b-ci.png"}
              alt={language === "en" ? "ENER PLATE Co.,Ltd" : "(주)에너플레이트"}
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <DropdownMenu key={item.title}>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors focus:outline-none">
                {item.title}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 p-2">
                {item.items.map((subItem) => (
                  <DropdownMenuItem key={subItem.title} asChild>
                    <Link
                      href={subItem.href}
                      className="w-full cursor-pointer font-medium text-slate-600 hover:text-blue-600"
                    >
                      {subItem.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          <Link href="/notices" className="text-sm font-medium text-slate-700 hover:text-blue-700 transition-colors">
            {t.notices[language]}
          </Link>

          <div className="flex items-center gap-2 ml-4 border-l pl-4 border-slate-200">
            <button
              onClick={() => setLanguage("ko")}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                language === "ko" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              KOR
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                language === "en" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              ENG
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-8 py-8">
              <div className="flex items-center justify-between">
                <div className="relative h-10 w-32">
                  <Image
                    src={language === "en" ? "/images/b-ci-en-header.png" : "/images/b-ci.png"}
                    alt={language === "en" ? "ENER PLATE Co.,Ltd" : "(주)에너플레이트"}
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage("ko")}
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      language === "ko" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    KOR
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      language === "en" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    ENG
                  </button>
                </div>
              </div>
              <nav className="flex flex-col gap-6">
                {navigation.map((item) => (
                  <div key={item.title} className="flex flex-col gap-3">
                    <h4 className="font-bold text-blue-900">{item.title}</h4>
                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-slate-100">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          onClick={() => setIsOpen(false)}
                          className="text-sm text-slate-600 hover:text-blue-600 py-1"
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-3">
                  <Link
                    href="/notices"
                    onClick={() => setIsOpen(false)}
                    className="font-bold text-blue-900 hover:text-blue-700"
                  >
                    {t.notices[language]}
                  </Link>
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
