"use client"

import { Building2, MapPin, Calendar, Briefcase } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function CompanyOverviewPage() {
  const { language, t } = useLanguage()

  const companyInfo = [
    {
      icon: Calendar,
      label: t.overview.info.founded.label[language],
      value: t.overview.info.founded.value[language],
      description: t.overview.info.founded.description[language],
    },
    {
      icon: Building2,
      label: t.overview.info.ceo.label[language],
      value: t.overview.info.ceo.value[language],
      description: t.overview.info.ceo.description[language],
    },
    {
      icon: MapPin,
      label: t.overview.info.location.label[language],
      value: t.overview.info.location.value[language],
      description: t.overview.info.location.description[language],
    },
    {
      icon: Briefcase,
      label: t.overview.info.business.label[language],
      value: t.overview.info.business.value[language],
      description: t.overview.info.business.description[language],
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 md:text-5xl">{t.overview.hero.title[language]}</h1>
            <p className="text-blue-100 text-lg">{t.overview.hero.subtitle[language]}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Introduction */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  {t.overview.intro.title[language]}
                </h2>
                <div className="h-1 w-24 bg-blue-600 mx-auto mb-8" />
                <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                  {t.overview.intro.description[language]}
                </p>
              </div>
            </div>

            {/* Company Information Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {companyInfo.map((info, index) => {
                const Icon = info.icon
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-8 h-8 text-blue-700" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-600 mb-2">{info.description}</p>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{info.label}</h3>
                        <p className="text-slate-700 leading-relaxed">{info.value}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Vision Statement */}
            <div className="mt-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl shadow-lg p-8 md:p-12 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-6">{t.overview.vision.title[language]}</h3>
                <p className="text-lg text-blue-100 leading-relaxed whitespace-pre-line">
                  {t.overview.vision.description[language]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
