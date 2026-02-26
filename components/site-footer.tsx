"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"

export function SiteFooter() {
  const { language, t } = useLanguage()

  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="relative h-12 w-48">
              <Image
                src={language === "en" ? "/images/b-ci-en.png" : "/images/a-ci.png"}
                alt={language === "en" ? "Enerplate Co., Ltd." : "(주)에너플레이트"}
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <p className="text-sm text-slate-400 whitespace-pre-line">{t.footer.companyDescription[language]}</p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">{t.footer.aboutUs.title[language]}</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/about/ceo" className="hover:text-white">
                  {t.footer.aboutUs.ceoMessage[language]}
                </Link>
              </li>
              <li>
                <Link href="/about/overview" className="hover:text-white">
                  {t.footer.aboutUs.overview[language]}
                </Link>
              </li>
              <li>
                <Link href="/about/location" className="hover:text-white">
                  {t.footer.aboutUs.location[language]}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">{t.footer.business.title[language]}</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/business/vision" className="hover:text-white">
                  {t.footer.business.vision[language]}
                </Link>
              </li>
              <li>
                <Link href="/business/products" className="hover:text-white">
                  {t.footer.business.products[language]}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">{t.footer.contact.title[language]}</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/contact/organization" className="hover:text-white">
                  {t.footer.contact.organization[language]}
                </Link>
              </li>
              <li>
                <Link href="/contact/info" className="hover:text-white">
                  {t.footer.contact.info[language]}
                </Link>
              </li>
              <li className="pt-2">
                <span className="block text-xs text-slate-500">{t.footer.contact.phone[language]}</span>
                <span className="block text-xs text-slate-500">{t.footer.contact.fax[language]}</span>
                <span className="block text-xs text-slate-500">{t.footer.contact.email[language]}</span>
                <span className="block text-xs text-slate-500 mt-1">{t.footer.contact.address[language]}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          <p>{t.footer.copyright[language]}</p>
        </div>
      </div>
    </footer>
  )
}
