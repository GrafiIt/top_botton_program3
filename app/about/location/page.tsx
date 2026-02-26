"use client"

import { MapPin, Navigation } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function LocationPage() {
  const { language, t } = useLanguage()

  const address = {
    korean: t.location.address.korean.value[language],
    english: t.location.address.english.value[language],
  }

  // Google Maps embed URL with the Korean address
  const mapUrl = `https://maps.google.com/maps?q=경상북도+구미시+3공단3로+220&hl=ko&z=16&output=embed`

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 md:text-5xl">{t.location.hero.title[language]}</h1>
            <p className="text-blue-100 text-lg">{t.location.hero.subtitle[language]}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Map Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="aspect-video w-full">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={language === "ko" ? "에너플레이트 위치" : "Enerplate Location"}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Korean Address */}
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-7 h-7 text-blue-700" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-2">
                      {t.location.address.korean.label[language]}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900">{t.location.address.korean.title[language]}</h3>
                  </div>
                </div>
                <p className="text-slate-700 text-lg leading-relaxed">{address.korean}</p>
              </div>

              {/* English Address */}
              <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Navigation className="w-7 h-7 text-blue-700" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-2">
                      {t.location.address.english.label[language]}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900">{t.location.address.english.title[language]}</h3>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">{address.english}</p>
              </div>
            </div>

            {/* Quick Access Section */}
            <div className="mt-8 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl shadow-lg p-8 md:p-12 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-6">{t.location.directions.title[language]}</h3>
                <div className="max-w-2xl mx-auto">
                  <p className="text-blue-100 leading-relaxed mb-6 whitespace-pre-line">
                    {t.location.directions.description[language]}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("경상북도 구미시 3공단3로 220")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                      <MapPin className="w-5 h-5" />
                      {t.location.directions.viewOnMap[language]}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
