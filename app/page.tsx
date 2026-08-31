import Link from "next/link"

const menuItems = [
  { label: "Tool Box Meeting", href: "#" },
  { label: "교육 현황 관리", href: "#" },
  { label: "MSDS", href: "#" },
  { label: "상/하차지 정보", href: "/loading-info" },
  { label: "벙커링 현황", href: "#" },
  { label: "선박유 도착지 정보", href: "#" },
  { label: "비상대응 절차서", href: "#" },
  { label: "휴게소 정보", href: "#" },
  { label: "작업 지침서", href: "#" },
  { label: "비상연락망", href: "#" },
]

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-background px-4 py-8">
      <h1 className="sr-only">업무 지원 메뉴</h1>

      <nav aria-label="업무 지원 메뉴">
        <ul className="grid grid-cols-3 gap-3 sm:gap-4">
          {menuItems.map((item, index) => (
            <li key={item.label} className={index === menuItems.length - 1 ? "col-start-2" : undefined}>
              <Link
                href={item.href}
                className="flex aspect-square w-full items-center justify-center rounded-2xl bg-[#0b1f3a] p-3 text-center text-sm font-semibold leading-relaxed text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-[#102d52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1f3a] focus-visible:ring-offset-2 active:scale-[0.98] sm:rounded-3xl sm:text-base"
              >
                <span className="text-balance break-keep">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  )
}
