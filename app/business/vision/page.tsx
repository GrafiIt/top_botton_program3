"use client"

import { TrendingUp, Globe, Lightbulb, Leaf, Heart } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function VisionPage() {
  const { language, t } = useLanguage()
  const visionData = t.vision

  const visions = [
    {
      icon: TrendingUp,
      title: visionData.visions[0].title[language],
      description: visionData.visions[0].description[language],
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      icon: Globe,
      title: visionData.visions[1].title[language],
      description: visionData.visions[1].description[language],
      color: "from-indigo-600 to-indigo-700",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-700",
    },
    {
      icon: Lightbulb,
      title: visionData.visions[2].title[language],
      description: visionData.visions[2].description[language],
      color: "from-violet-600 to-violet-700",
      bgColor: "bg-violet-100",
      textColor: "text-violet-700",
    },
    {
      icon: Leaf,
      title: visionData.visions[3].title[language],
      description: visionData.visions[3].description[language],
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      icon: Heart,
      title: visionData.visions[4].title[language],
      description: visionData.visions[4].description[language],
      color: "from-rose-600 to-rose-700",
      bgColor: "bg-rose-100",
      textColor: "text-rose-700",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/abstract-tech-pattern.png')] bg-cover bg-center" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 md:text-5xl">{visionData.hero.title[language]}</h1>
            <p className="text-blue-100 text-lg leading-relaxed">{visionData.hero.subtitle[language]}</p>
          </div>
        </div>
      </section>

      {/* Vision Cards Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Introduction */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 md:text-4xl">{visionData.intro.title[language]}</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                {visionData.intro.description[language]}
              </p>
            </div>

            {/* Vision Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {visions.slice(0, 4).map((vision, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 ${vision.bgColor} rounded-2xl flex items-center justify-center`}>
                        <vision.icon className={`w-8 h-8 ${vision.textColor}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">{vision.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{vision.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Vision Card - Full Width */}
            <div className={`bg-gradient-to-br ${visions[4].color} rounded-2xl shadow-xl p-10 md:p-14 text-white`}>
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-6">{visions[4].title}</h3>
                  <p className="text-white/95 text-lg leading-relaxed">{visions[4].description}</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <div className="inline-block bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 md:text-3xl">{visionData.cta.title[language]}</h3>
                <p className="text-slate-600 text-lg leading-relaxed max-w-3xl mx-auto whitespace-pre-line">
                  {visionData.cta.description[language]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
