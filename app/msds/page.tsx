"use client"

import { ArrowLeft, ExternalLink, FileText, Search, Settings, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

type MsdsDocument = {
  id: string
  title: string
  pdf_url: string
  created_at: string
}

async function fetchMsdsDocuments(): Promise<MsdsDocument[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .schema("drivermgm")
    .from("human_gw_workdoc")
    .select("id, title, pdf_url, created_at")
    .eq("doc_type", "msds")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false

  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

export default function MsdsDocumentPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<MsdsDocument | null>(null)
  const [useMobileViewer, setUseMobileViewer] = useState(false)
  const { data: documents, error, isLoading } = useSWR("msds-documents", fetchMsdsDocuments)

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().normalize("NFC").toLowerCase()
    if (!normalizedQuery) return documents ?? []

    return (documents ?? []).filter((document) =>
      document.title.normalize("NFC").toLowerCase().includes(normalizedQuery),
    )
  }, [documents, query])

  const openDocument = (document: MsdsDocument) => {
    setUseMobileViewer(isMobileDevice())
    setSelectedDocument(document)
  }

  if (selectedDocument) {
    const viewerUrl = useMobileViewer
      ? `https://docs.google.com/viewer?url=${encodeURIComponent(selectedDocument.pdf_url)}&embedded=true`
      : `${selectedDocument.pdf_url}#toolbar=0&navpanes=0&view=FitH`

    return (
      <main className="fixed inset-0 z-50 flex h-dvh w-screen flex-col overflow-hidden bg-background">
        <h1 className="sr-only">{selectedDocument.title}</h1>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <iframe
            key={viewerUrl}
            src={viewerUrl}
            title={`${selectedDocument.title} PDF 문서`}
            className="block h-full min-h-dvh w-full border-0"
            scrolling="yes"
          />
        </div>
        <button
          type="button"
          onClick={() => setSelectedDocument(null)}
          className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] flex size-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="문서 닫고 목록으로 돌아가기"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        {useMobileViewer ? (
          <a
            href={selectedDocument.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex size-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="PDF를 새 탭에서 직접 열기"
          >
            <ExternalLink className="size-5" aria-hidden="true" />
          </a>
        ) : null}
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
      <header className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="이전 화면으로 이동"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="truncate text-lg font-bold tracking-tight">MSDS</h1>
        </div>

        <button
          type="button"
          onClick={() => router.push("/msds/admin")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="MSDS 관리자 페이지로 이동"
        >
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <section className="flex flex-col gap-5 px-4 py-6" aria-labelledby="msds-list-title">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">현장 문서함</p>
          <h2 id="msds-list-title" className="text-balance text-2xl font-bold tracking-tight">
            필요한 MSDS를 찾아보세요
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">문서를 누르면 전체 화면으로 열립니다.</p>
        </div>

        <label className="relative block" htmlFor="msdsument-search">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">MSDS 제목 검색</span>
          <input
            id="msdsument-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="MSDS 제목 검색"
            className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-4 text-base outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        {isLoading ? (
          <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground" role="status">
            문서를 불러오는 중입니다.
          </p>
        ) : error ? (
          <p className="rounded-xl bg-muted p-6 text-center text-sm text-destructive" role="alert">
            문서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : filteredDocuments.length === 0 ? (
          <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">
            {query ? "검색 결과가 없습니다." : "등록된 MSDS가 없습니다."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredDocuments.map((document) => (
              <li key={document.id}>
                <button
                  type="button"
                  onClick={() => openDocument(document)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-transform hover:border-primary/40 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <FileText className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-semibold">{document.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">PDF 문서 보기</span>
                  </span>
                  <span className="font-mono text-lg text-muted-foreground" aria-hidden="true">
                    {">"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
