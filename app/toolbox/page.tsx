"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, LoaderCircle, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { createClient } from "@/lib/supabase/client"

type TabKey = "notices" | "important"
type ToolboxContent = Record<TabKey, string[]>

const MAX_LINES = 10

function toFixedLines(value: string) {
  return [...value.split("\n").slice(0, MAX_LINES), ...Array(MAX_LINES).fill("")].slice(0, MAX_LINES)
}

const initialContent: ToolboxContent = {
  notices: toFixedLines(
    "작업 전 안전 장비를 반드시 확인해 주세요.\n금일 작업 내용을 팀원들과 공유해 주세요.\n작업 종료 후 주변 정리를 확인해 주세요.",
  ),
  important: toFixedLines("위험 요소 발견 시 즉시 작업을 중지해 주세요.\n비상 상황 발생 시 현장 책임자에게 보고해 주세요."),
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "notices", label: "공지사항" },
  { key: "important", label: "중요사항" },
]

export default function ToolboxPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized, credentials, setCredentials, login, loginError, logout } = useAdminAuth()
  const [activeTab, setActiveTab] = useState<TabKey>("notices")
  const [content, setContent] = useState<ToolboxContent>(initialContent)
  const [draftContent, setDraftContent] = useState<ToolboxContent>(initialContent)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoginRequested, setIsLoginRequested] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .schema("drivermgm")
        .from("human_gw_notice")
        .select("notices, important")
        .eq("id", 1)
        .single()

      if (error || !data) return

      const restoredContent = {
        notices: data.notices == null ? initialContent.notices : toFixedLines(data.notices),
        important: data.important == null ? initialContent.important : toFixedLines(data.important),
      }
      setContent(restoredContent)
      setDraftContent(restoredContent)
    }

    void fetchContent()
  }, [])

  useEffect(() => {
    if (isAuthenticated && isLoginRequested) {
      setDraftContent(content)
      setIsEditing(true)
      setIsLoginRequested(false)
    }
  }, [content, isAuthenticated, isLoginRequested])

  const handleSettings = () => {
    if (isAuthenticated) {
      setDraftContent(content)
      setIsEditing(true)
      return
    }

    setIsLoginRequested(true)
  }

  const handleDraftChange = (index: number, value: string) => {
    setDraftContent((previous) => ({
      ...previous,
      [activeTab]: previous[activeTab].map((line, lineIndex) => (lineIndex === index ? value : line)),
    }))
  }

  const saveContent = async () => {
    const supabase = createClient()
    const { error } = await supabase.schema("drivermgm").from("human_gw_notice").upsert({
      id: 1,
      notices: draftContent.notices.join("\n"),
      important: draftContent.important.join("\n"),
    })

    if (error) {
      window.alert("저장 중 오류가 발생했습니다.")
      return
    }

    setContent(draftContent)
    setIsEditing(false)
    window.alert("내용이 저장되었습니다.")
  }

  const cancelEditing = () => {
    setDraftContent(content)
    setIsEditing(false)
  }

  if (!isInitialized) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background" aria-busy="true">
        <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">관리자 인증 상태를 확인하는 중입니다.</span>
      </main>
    )
  }

  if (isLoginRequested && !isAuthenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
        <section className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-lg" aria-labelledby="toolbox-login-title">
          <button
            type="button"
            onClick={() => setIsLoginRequested(false)}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Tool Box Meeting으로 돌아가기
          </button>
          <h1 id="toolbox-login-title" className="text-xl font-bold">관리자 인증</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">편집 모드에 진입하려면 관리자 정보를 입력해 주세요.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              login()
            }}
            className="mt-6 flex flex-col gap-4"
          >
            <label className="flex flex-col gap-2" htmlFor="toolbox-admin-id">
              <span className="text-sm font-semibold">아이디</span>
              <input
                id="toolbox-admin-id"
                type="text"
                autoComplete="username"
                value={credentials.id}
                onChange={(event) => setCredentials((current) => ({ ...current, id: event.target.value }))}
                className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>
            <label className="flex flex-col gap-2" htmlFor="toolbox-admin-password">
              <span className="text-sm font-semibold">비밀번호</span>
              <input
                id="toolbox-admin-password"
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>
            {loginError ? <p className="text-sm font-medium text-destructive" role="alert">{loginError}</p> : null}
            <button type="submit" className="h-12 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              로그인
            </button>
          </form>
        </section>
      </main>
    )
  }

  const activeLines = content[activeTab].filter((line) => line.trim().length > 0)

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-card text-foreground shadow-sm">
      <header className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={() => router.back()} className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="이전 화면으로 이동">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="truncate text-lg font-bold tracking-tight">Tool Box Meeting</h1>
        </div>
        <div className="flex items-center gap-1">
          {isAuthenticated ? <button type="button" onClick={logout} className="px-2 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">로그아웃</button> : null}
          <button type="button" onClick={handleSettings} className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="관리자 설정 열기">
            <Settings className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="border-b border-border px-4">
        <div className="flex" role="tablist" aria-label="Tool Box Meeting 정보 분류">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return <button key={tab.key} type="button" role="tab" aria-selected={isActive} aria-controls={`${tab.key}-panel`} id={`${tab.key}-tab`} onClick={() => setActiveTab(tab.key)} className={`relative flex-1 px-3 py-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {tab.label}
              {isActive ? <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-primary" /> : null}
            </button>
          })}
        </div>
      </div>

      <section id={`${activeTab}-panel`} role="tabpanel" aria-labelledby={`${activeTab}-tab`} className="px-5 py-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">TBM Board</p>
            <h2 className="mt-1 text-xl font-bold">{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
          </div>
          {isEditing ? <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">편집 모드</span> : null}
        </div>

        {isEditing ? <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">{tabs.find((tab) => tab.key === activeTab)?.label} 내용</p>
          <div className="flex flex-col gap-3">
            {draftContent[activeTab].map((line, index) => <label key={index} htmlFor={`toolbox-content-${activeTab}-${index}`} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-right text-sm font-semibold text-muted-foreground">{index + 1}.</span>
              <input id={`toolbox-content-${activeTab}-${index}`} type="text" value={line} onChange={(event) => handleDraftChange(index, event.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20" aria-label={`${index + 1}번째 줄`} />
            </label>)}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={cancelEditing} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">취소</button>
            <button type="button" onClick={saveContent} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">저장</button>
          </div>
        </div> : activeLines.length > 0 ? <ul className="flex flex-col gap-5">
          {activeLines.map((line, index) => <li key={`${line}-${index}`} className="flex min-h-14 items-start gap-4 rounded-xl bg-muted px-4 py-4">
            <div className="my-0.5 w-2.5 shrink-0 self-stretch rounded-l-md border-y-2 border-l-2 border-primary" aria-hidden="true" />
            <p className="pt-0.5 text-sm font-medium leading-6 text-pretty">{line}</p>
          </li>)}
        </ul> : <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">등록된 내용이 없습니다.</p>}
      </section>
    </main>
  )
}
