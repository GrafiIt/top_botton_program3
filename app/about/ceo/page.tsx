"use client"

import { useLanguage } from "@/contexts/language-context"

export default function CEOPage() {
  const { language, t } = useLanguage()

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 md:text-5xl">{t.ceo.hero.title[language]}</h1>
            <p className="text-blue-100 text-lg">{t.ceo.hero.subtitle[language]}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* CEO Info */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
              <div className="p-10 md:p-14 text-center">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-blue-600 tracking-widest uppercase">
                    {t.ceo.info.position[language]}
                  </p>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900">{t.ceo.info.name[language]}</h2>
                  <p className="text-xl text-slate-600">{t.ceo.info.nameEng[language]}</p>
                  <div className="flex justify-center">
                    <div className="h-1 w-20 bg-blue-600 rounded-full" />
                  </div>
                  <p className="text-lg text-slate-700 pt-2">{t.ceo.info.company[language]}</p>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl font-semibold text-slate-900 mb-8 leading-relaxed whitespace-pre-line">
                  {t.ceo.message.greeting[language]}
                </p>

                <div className="space-y-6 text-slate-700 leading-relaxed">
                  <p>{t.ceo.message.p1[language]}</p>
                  <p>{t.ceo.message.p2[language]}</p>
                  <p>{t.ceo.message.p3[language]}</p>
                  <p className="font-medium text-slate-900 whitespace-pre-line">{t.ceo.message.closing[language]}</p>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{t.ceo.signature.title[language]}</p>
                    <p className="text-3xl font-bold text-blue-700 mt-2">{t.ceo.signature.name[language]}</p>
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
