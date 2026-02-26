"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Leaf, Battery, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export default function Home() {
  const { language } = useLanguage()
  const t = translations.home

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] w-full overflow-hidden bg-slate-50">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/main-hero.jpeg"
            alt="에너플레이트 공장 전경"
            fill
            className="object-cover object-center opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent md:via-white/20" />
        </div>

        <div className="container relative z-10 mx-auto flex h-full flex-col justify-center px-4">
          <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              {t.hero.title[language]}
            </h1>
            <p className="text-xl font-medium text-slate-700 sm:text-2xl md:text-3xl leading-relaxed text-balance">
              {t.hero.subtitle[language]}
              <br className="hidden md:block" />
              <span className="text-blue-700">{t.hero.subtitle2[language]}</span>
            </p>
            <p className="max-w-lg text-base text-slate-600 md:text-lg text-balance">{t.hero.description[language]}</p>
            <div className="flex gap-4 pt-4">
              <Link href="/business/products">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white">
                  {t.hero.viewProducts[language]}
                </Button>
              </Link>
              <Link href="/about/overview">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/50 backdrop-blur-sm border-blue-200 text-blue-900 hover:bg-white"
                >
                  {t.hero.aboutCompany[language]}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                {t.intro.badge[language]}
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl whitespace-pre-line">
                {t.intro.title[language]}
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">{t.intro.description[language]}</p>
              <ul className="space-y-4 pt-4">
                {[t.intro.features[1][language], t.intro.features[2][language], t.intro.features[3][language]].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="relative h-[400px] overflow-hidden rounded-2xl bg-slate-100 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-blue-900 p-8 flex flex-col justify-between text-white">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">CEO Message</h3>
                  <div className="h-1 w-12 bg-blue-400" />
                </div>
                <blockquote className="text-lg font-light italic leading-relaxed whitespace-pre-line">
                  {t.intro.ceoQuote[language]}
                </blockquote>
                <div className="text-right">
                  <p className="font-bold">{t.intro.ceoName[language]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Areas */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">{t.business.title[language]}</h2>
            <p className="text-lg text-slate-600">{t.business.description[language]}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Battery,
                title: t.business.battery.title[language],
                desc: t.business.battery.desc[language],
              },
              {
                icon: Leaf,
                title: t.business.fuelCell.title[language],
                desc: t.business.fuelCell.desc[language],
              },
              {
                icon: Zap,
                title: t.business.rd.title[language],
                desc: t.business.rd.desc[language],
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">{item.desc}</p>
                <Link
                  href="#"
                  className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  {t.business.viewMore[language]} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-slate-900">{t.news.title[language]}</h2>
            <Link href="/notices" className="text-sm font-semibold text-blue-700 hover:text-blue-800 flex items-center">
              {t.news.viewAll[language]} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { date: "2025.11.20", title: "(주)에너플레이트, 신규 공장 준공식 개최" },
              { date: "2025.11.15", title: "2025 국제 수소 에너지 전시회 참가 안내" },
              { date: "2025.10.30", title: "차세대 탄소복합분리판 특허 취득 완료" },
              { date: "2025.10.10", title: "하반기 신입 및 경력사원 공개 채용" },
            ].map((news, i) => (
              <Link
                key={i}
                href="#"
                className="group block space-y-3 p-6 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm font-medium text-blue-600">{news.date}</span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-800 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  (주)에너플레이트의 새로운 소식을 전해드립니다. 자세한 내용은 클릭하여 확인해주세요.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
