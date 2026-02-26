"use client"

import { User, Users, TrendingUp, Factory, ClipboardCheck, Briefcase } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function OrganizationPage() {
  const { language, t } = useLanguage()

  const departments = [
    {
      icon: Briefcase,
      title: t.organization.departments[0].title[language],
      description: t.organization.departments[0].description[language],
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      icon: TrendingUp,
      title: t.organization.departments[1].title[language],
      description: t.organization.departments[1].description[language],
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      icon: Factory,
      title: t.organization.departments[2].title[language],
      description: t.organization.departments[2].description[language],
      color: "from-indigo-600 to-indigo-700",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-700",
    },
    {
      icon: ClipboardCheck,
      title: t.organization.departments[3].title[language],
      description: t.organization.departments[3].description[language],
      color: "from-violet-600 to-violet-700",
      bgColor: "bg-violet-100",
      textColor: "text-violet-700",
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
            <h1 className="text-4xl font-bold mb-4 md:text-5xl">{t.organization.hero.title[language]}</h1>
            <p className="text-blue-100 text-lg leading-relaxed">{t.organization.hero.subtitle[language]}</p>
          </div>
        </div>
      </section>

      {/* Organization Chart Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* CEO Level */}
            <div className="flex flex-col items-center mb-12">
              <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl shadow-2xl p-8 text-white text-center min-w-[280px]">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <User className="w-8 h-8" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">{t.organization.ceoSection.title[language]}</h2>
                <p className="text-white/90 text-lg">{t.organization.ceoSection.name[language]}</p>
              </div>

              {/* Vertical Line */}
              <div className="w-1 h-16 bg-gradient-to-b from-blue-700 to-slate-300 my-4"></div>

              {/* Horizontal Line */}
              <div className="relative w-full max-w-5xl h-1 bg-slate-300 mb-4">
                {/* Connection Points */}
                <div className="absolute top-0 left-[12.5%] w-1 h-16 bg-slate-300 -translate-x-1/2"></div>
                <div className="absolute top-0 left-[37.5%] w-1 h-16 bg-slate-300 -translate-x-1/2"></div>
                <div className="absolute top-0 left-[62.5%] w-1 h-16 bg-slate-300 -translate-x-1/2"></div>
                <div className="absolute top-0 left-[87.5%] w-1 h-16 bg-slate-300 -translate-x-1/2"></div>
              </div>
            </div>

            {/* Departments Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {departments.map((dept, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 ${dept.bgColor} rounded-full flex items-center justify-center mb-4`}>
                      <dept.icon className={`w-8 h-8 ${dept.textColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{dept.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{dept.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Organization Culture Section */}
            <div className="mt-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-10 md:p-14">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-blue-700" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-6">{t.organization.culture.title[language]}</h3>
                <p className="text-slate-700 text-lg leading-relaxed max-w-3xl mx-auto">
                  {t.organization.culture.description[language]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
