"use client"

import { ArrowLeft, ExternalLink, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

type EmergencyDocument = {
  id: string
  title: string
  pdf_url: string
  created_at: string
}

async function fetchEmergencyDocuments(): Promise<EmergencyDocument | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .schema("drivermgm")
    .from("human_gw_workdoc")
    .select("id, title, pdf_url, created_at")
    .eq("doc_type", "emergency")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false

  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

export default function EmergencyDocumentPage() {
  const router = useRouter()
  const [useMobileViewer, setUseMobileViewer] = useState(false)
  const { data: document, error, isLoading } = useSWR(
    "emergency-latest-document",
    fetchEmergencyDocuments,
  )

  useEffect(() => {
    setUseMobileViewer(isMobileDevice())
  }, [])

  const goToMain = () => router.push("/")
  const goToAdmin = () => router.push("/emergency/admin")

  const floatingButtonClassName =
    "z-10 flex size-10 items-center justify-center rounded-full bg-foreground/80 text-background shadow-lg backdrop-blur-sm transition-transform hover:bg-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

  const floatingControls = (
    <>
      <button
        type="button"
        onClick={goToMain}
        className={`fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] ${floatingButtonClassName}`}
        aria-label="메인 페이지로 돌아가기"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </button>
      <div className="fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex items-center gap-2">
        {useMobileViewer && document ? (
          <a
            href={document.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className={floatingButtonClassName}
            aria-label="PDF를 새 탭에서 직접 열기"
          >
            <ExternalLink className="size-5" aria-hidden="true" />
          </a>
        ) : null}
        <button
          type="button"
          onClick={goToAdmin}
          className={floatingButtonClassName}
          aria-label="비상대응 절차서 관리자 페이지로 이동"
        >
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </div>
    </>
  )

  if (isLoading) {
    return (
      <main className="fixed inset-0 flex h-dvh w-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground" role="status">
          문서를 불러오는 중입니다.
        </p>
        {floatingControls}
      </main>
    )
  }

  if (error) {
    return (
      <main className="fixed inset-0 flex h-dvh w-screen items-center justify-center bg-background px-6 text-foreground">
        <p className="text-center text-sm text-destructive" role="alert">
          문서를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        {floatingControls}
      </main>
    )
  }

  if (!document) {
    return (
      <main className="fixed inset-0 flex h-dvh w-screen items-center justify-center bg-background px-6 text-foreground">
        <h1 className="text-center text-base font-semibold">등록된 비상대응 절차서가 없습니다.</h1>
        {floatingControls}
      </main>
    )
  }

  const viewerUrl = useMobileViewer
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(document.pdf_url)}&embedded=true`
    : `${document.pdf_url}#toolbar=0&navpanes=0&view=FitH`

  return (
    <main className="fixed inset-0 flex h-dvh w-screen flex-col overflow-hidden bg-background">
      <h1 className="sr-only">{document.title}</h1>
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <iframe
          key={viewerUrl}
          src={viewerUrl}
          title={`${document.title} PDF 문서`}
          className="block h-full min-h-dvh w-full border-0"
          scrolling="yes"
        />
      </div>
      {floatingControls}
    </main>
  )
}
