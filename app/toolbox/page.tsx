"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Settings, X } from "lucide-react"
import { useRouter } from "next/navigation"

type TabKey = "notices" | "important"

type ToolboxContent = Record<TabKey, string>

const STORAGE_KEY = "toolbox-meeting-content"
const MAX_LINES = 10

const initialContent: ToolboxContent = {
  notices: "작업 전 안전 장비를 반드시 확인해 주세요.\n금일 작업 내용을 팀원들과 공유해 주세요.\n작업 종료 후 주변 정리를 확인해 주세요.",
  important: "위험 요소 발견 시 즉시 작업을 중지해 주세요.\n비상 상황 발생 시 현장 책임자에게 보고해 주세요.",
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "notices", label: "공지사항" },
  { key: "important", label: "중요사항" },
]

function getLineCount(value: string) {
  return value === "" ? 0 : value.split("\n").length
}

export default function ToolboxPage() {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("notices")
  const [content, setContent] = useState<ToolboxContent>(initialContent)
  const [draftContent, setDraftContent] = useState<ToolboxContent>(initialContent)
  const [isEditing, setIsEditing] = useState(false)
  const [credentials, setCredentials] = useState({ id: "", password: "" })
  const [loginError, setLoginError] = useState("")

  useEffect(() => {
    const savedContent = window.localStorage.getItem(STORAGE_KEY)

    if (!savedContent) return

    try {
      const parsedContent = JSON.parse(savedContent) as Partial<ToolboxContent>
      const restoredContent = {
        notices: parsedContent.notices ?? initialContent.notices,
        important: parsedContent.important ?? initialContent.important,
      }
      setContent(restoredContent)
      setDraftContent(restoredContent)
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const openLoginModal = () => {
    setLoginError("")
    setCredentials({ id: "", password: "" })
    dialogRef.current?.showModal()
  }

  const closeLoginModal = () => {
    dialogRef.current?.close()
    setLoginError("")
  }

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (credentials.id !== "human" || credentials.password !== "1024") {
      setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.")
      return
    }

    setDraftContent(content)
    setIsEditing(true)
    closeLoginModal()
  }

  const handleDraftChange = (value: string) => {
    if (getLineCount(value) > MAX_LINES) {
      window.alert("각 탭의 내용은 최대 10줄까지 입력할 수 있습니다.")
      return
    }

    setDraftContent((previous) => ({ ...previous, [activeTab]: value }))
  }

  const saveContent = () => {
    if (getLineCount(draftContent.notices) > MAX_LINES || getLineCount(draftContent.important) > MAX_LINES) {
      window.alert("각 탭의 내용은 최대 10줄까지 입력할 수 있습니다.")
      return
    }

    setContent(draftContent)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draftContent))
    setIsEditing(false)
    window.alert("내용이 저장되었습니다.")
  }

  const cancelEditing = () => {
    setDraftContent(content)
    setIsEditing(false)
  }

  const activeLines = content[activeTab].split("\n").filter((line) => line.trim().length > 0)
  const activeLineCount = getLineCount(draftContent[activeTab])

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white text-slate-950 shadow-sm">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="이전 화면으로 이동"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="truncate text-lg font-bold tracking-tight">Tool Box Meeting</h1>
        </div>

        <button
          type="button"
          onClick={openLoginModal}
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="관리자 설정 열기"
        >
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="border-b border-slate-200 px-4">
        <div className="flex" role="tablist" aria-label="Tool Box Meeting 정보 분류">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.key}-panel`}
                id={`${tab.key}-tab`}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 px-3 py-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-950"
                }`}
              >
                {tab.label}
                {isActive ? <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-blue-600" /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <section
        id={`${activeTab}-panel`}
        role="tabpanel"
        aria-labelledby={`${activeTab}-tab`}
        className="px-5 py-7"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">TBM Board</p>
            <h2 className="mt-1 text-xl font-bold">{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
          </div>
          {isEditing ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">편집 모드</span>
          ) : null}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-4">
            <label htmlFor="toolbox-content" className="text-sm font-semibold">
              {tabs.find((tab) => tab.key === activeTab)?.label} 내용
            </label>
            <textarea
              id="toolbox-content"
              value={draftContent[activeTab]}
              onChange={(event) => handleDraftChange(event.target.value)}
              rows={10}
              className="min-h-64 w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-sm leading-7 outline-none transition-shadow focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              aria-describedby="line-count"
            />
            <p id="line-count" className="text-right text-xs text-slate-500" aria-live="polite">
              {activeLineCount} / {MAX_LINES}줄
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelEditing}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                취소
              </button>
              <button
                type="button"
                onClick={saveContent}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                저장
              </button>
            </div>
          </div>
        ) : activeLines.length > 0 ? (
          <ul className="flex flex-col gap-5">
            {activeLines.map((line, index) => (
              <li key={`${line}-${index}`} className="flex min-h-14 items-start gap-4 rounded-xl bg-slate-50 px-4 py-4">
                <span className="-mt-1 shrink-0 font-mono text-4xl font-light leading-none text-blue-600" aria-hidden="true">
                  {"["}
                </span>
                <p className="pt-0.5 text-sm font-medium leading-6 text-pretty">{line}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">등록된 내용이 없습니다.</p>
        )}
      </section>

      <dialog
        ref={dialogRef}
        onCancel={(event) => {
          event.preventDefault()
          closeLoginModal()
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-0 text-slate-950 shadow-xl backdrop:bg-slate-950/50"
        aria-labelledby="admin-login-title"
      >
        <form onSubmit={handleLogin} className="flex flex-col gap-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="admin-login-title" className="text-lg font-bold">관리자 인증</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">편집 모드에 진입하려면 관리자 정보를 입력해 주세요.</p>
            </div>
            <button
              type="button"
              onClick={closeLoginModal}
              className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="관리자 인증 닫기"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="admin-id" className="text-sm font-semibold">관리자 아이디</label>
            <input
              id="admin-id"
              name="admin-id"
              type="text"
              autoComplete="username"
              value={credentials.id}
              onChange={(event) => setCredentials((previous) => ({ ...previous, id: event.target.value }))}
              className="h-12 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="admin-password" className="text-sm font-semibold">비밀번호</label>
            <input
              id="admin-password"
              name="admin-password"
              type="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={(event) => setCredentials((previous) => ({ ...previous, password: event.target.value }))}
              className="h-12 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              required
            />
          </div>

          {loginError ? <p className="text-sm font-medium text-red-600" role="alert">{loginError}</p> : null}

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            로그인
          </button>
        </form>
      </dialog>
    </main>
  )
}
