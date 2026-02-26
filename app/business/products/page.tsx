"use client"

import Image from "next/image"
import { Factory, Leaf, Handshake, Award } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ProductsPage() {
  const { language, t } = useLanguage()
  const productsData = t.products

  const products = [
    {
      icon: Factory,
      title: productsData.items[0].title[language],
      description: productsData.items[0].description[language],
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      icon: Leaf,
      title: productsData.items[1].title[language],
      description: productsData.items[1].description[language],
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      icon: Handshake,
      title: productsData.items[2].title[language],
      description: productsData.items[2].description[language],
      color: "from-indigo-600 to-indigo-700",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-700",
    },
    {
      icon: Award,
      title: productsData.items[3].title[language],
      description: productsData.items[3].description[language],
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
            <h1 className="text-4xl font-bold mb-4 md:text-5xl">{productsData.hero.title[language]}</h1>
            <p className="text-blue-100 text-lg leading-relaxed">{productsData.hero.subtitle[language]}</p>
          </div>
        </div>
      </section>

      {/* Factory Images Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Manufacturing Site Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <Image
                  src="/images/e1-84-8c-e1-85-a6-e1-84-8c-e1-85-a9-e1-84-92-e1-85-a7-e1-86-ab-e1-84-8c-e1-85-a1-e1-86-bc.png"
                  alt={productsData.images.manufacturing[language]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-bold text-xl">{productsData.images.manufacturing[language]}</h3>
                  <p className="text-white/90 text-sm">{productsData.images.manufacturingDesc[language]}</p>
                </div>
              </div>

              {/* Factory Exterior Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <Image
                  src="/images/e1-84-80-e1-85-a9-e1-86-bc-e1-84-8c-e1-85-a1-e1-86-bc-e1-84-8c-e1-85-a5-e1-86-ab-e1-84-80-e1-85-a7-e1-86-bc.png"
                  alt={productsData.images.factory[language]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white font-bold text-xl">{productsData.images.factory[language]}</h3>
                  <p className="text-white/90 text-sm">{productsData.images.factoryDesc[language]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Introduction */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 md:text-4xl">
                {productsData.intro.title[language]}
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                {productsData.intro.description[language]}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 ${product.bgColor} rounded-2xl flex items-center justify-center`}>
                        <product.icon className={`w-8 h-8 ${product.textColor}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">{product.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{product.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Product Highlight */}
            <div className="mt-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl shadow-xl p-10 md:p-14 text-white">
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-6">{productsData.highlight.title[language]}</h3>
                <p className="text-white/95 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
                  {productsData.highlight.description[language]}
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  {productsData.highlight.features.map((feature, index) => (
                    <div key={index} className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                      <span className="font-semibold">{feature[language]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
