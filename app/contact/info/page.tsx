"use client"

import { Phone, Printer, MapPin, Clock, Mail } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ContactInfoPage() {
  const { language, t } = useLanguage()

  const contactItems = [
    {
      icon: Phone,
      title: t.contactInfo.items[0].title[language],
      mainInfo: t.contactInfo.items[0].mainInfo[language],
      subInfo: t.contactInfo.items[0].subInfo[language],
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    {
      icon: Printer,
      title: t.contactInfo.items[1].title[language],
      mainInfo: t.contactInfo.items[1].mainInfo[language],
      subInfo: t.contactInfo.items[1].subInfo[language],
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-50",
      iconColor: "text-green-700",
    },
    {
      icon: MapPin,
      title: t.contactInfo.items[2].title[language],
      mainInfo: t.contactInfo.items[2].mainInfo[language],
      subInfo: t.contactInfo.items[2].subInfo[language],
      color: "from-indigo-600 to-indigo-700",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-700",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-600" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 md:text-5xl">{t.contactInfo.hero.title[language]}</h1>
            <p className="text-blue-100 text-lg leading-relaxed">{t.contactInfo.hero.subtitle[language]}</p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contactItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 ${item.bgColor} rounded-full flex items-center justify-center mb-6`}>
                      <item.icon className={`w-10 h-10 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                    <p className="text-2xl font-semibold text-slate-900 mb-2">{item.mainInfo}</p>
                    <p className="text-slate-600">{item.subInfo}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info Section */}
            <div className="mt-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                      {t.contactInfo.additional.businessHours.title[language]}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      {t.contactInfo.additional.businessHours.weekdays[language]}
                      <br />
                      {t.contactInfo.additional.businessHours.weekend[language]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                      {t.contactInfo.additional.email.title[language]}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      {t.contactInfo.additional.email.address[language]}
                      <br />
                      <span className="text-sm text-slate-500">{t.contactInfo.additional.email.note[language]}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl shadow-xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-4">{t.contactInfo.cta.title[language]}</h3>
              <p className="text-blue-100 text-lg leading-relaxed mb-6 whitespace-pre-line">
                {t.contactInfo.cta.description[language]}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:054-715-5112"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {t.contactInfo.cta.phoneButton[language]}
                </a>
                <a
                  href="mailto:jskim@enerplate.co.kr"
                  className="inline-flex items-center justify-center gap-2 bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  {t.contactInfo.cta.emailButton[language]}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
