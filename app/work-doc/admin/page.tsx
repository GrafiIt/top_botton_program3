"use client"

import { ArrowLeft, FileText, LockKeyhole, Upload, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"

const ADMIN_ID = "human"
const ADMIN_PASSWORD = "1024"
const STORAGE_BUCKET = "work_documents"

export default function WorkDocumentAdminPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [credentials, setCredentials] = useState({ id: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (credentials.id !== ADMIN_ID || credentials.password !== ADMIN_PASSWORD) {
      setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.")
      return
    }

    setLoginError("")
    setCredentials({ id: "", password: "" })
    setIsAuthenticated(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!file) {
      window.alert("PDF 파일을 선택해 주세요.")
      return
    }

    const hasPdfExtension = file.name.toLocaleLowerCase().endsWith(".pdf")
    const hasPdfMimeType = file.type.toLocaleLowerCase() === "application/pdf"

    if (!hasPdfExtension || !hasPdfMimeType) {
      window.alert("PDF 파일만 업로드할 수 있습니다.")
      return
    }

    setIsSaving(true)
    const supabase = createClient()
    const filePath = `documents/${Date.now()}-${crypto.randomUUID()}.pdf`

    try {
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
        contentType: "application/pdf",
        upsert: false,
      })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
      const { error: insertError } = await supabase.schema("drivermgm").from("human_gw_workdoc").insert({
        title: title.trim(),
        pdf_url: urlData.publicUrl,
      })

      if (insertError) {
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
        throw insertError
      }

      window.alert("작업 지침서가 등록되었습니다.")
      setTitle("")
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      window.alert("등록 중 오류가 발생했습니다. 저장소와 테이블 설정을 확인해 주세요.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
        <section className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-lg" aria-labelledby="admin-login-title">
          <div className="flex flex-col gap-2 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <LockKeyhole className="size-6" aria-hidden="true" />
            </span>
            <h1 id="admin-login-title" className="text-balance text-2xl font-bold tracking-tight">
              관리자 인증
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">지침서를 등록하려면 관리자 정보를 입력해 주세요.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-2" htmlFor="admin-id">
              <span className="text-sm font-semibold">아이디</span>
              <span className="relative block">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="admin-id"
                  type="text"
                  autoComplete="username"
                  value={credentials.id}
                  onChange={(event) => setCredentials((current) => ({ ...current, id: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </span>
            </label>

            <label className="flex flex-col gap-2" htmlFor="admin-password">
              <span className="text-sm font-semibold">비밀번호</span>
              <span className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </span>
            </label>

            {loginError ? <p className="text-center text-sm text-destructive" role="alert">{loginError}</p> : null}

            <button
              type="submit"
              className="h-12 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => router.push("/work-doc")}
              className="h-11 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              목록으로 돌아가기
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
      <header className="flex h-16 items-center gap-2 border-b border-border px-4">
        <button
          type="button"
          onClick={() => router.push("/work-doc")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="작업 지침서 목록으로 이동"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">작업 지침서 등록</h1>
      </header>

      <section className="flex flex-col gap-6 px-4 py-6" aria-labelledby="upload-form-title">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">관리자 문서함</p>
          <h2 id="upload-form-title" className="text-balance text-2xl font-bold tracking-tight">새 PDF 등록</h2>
          <p className="text-sm leading-6 text-muted-foreground">현장에서 확인할 작업 지침서를 업로드하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <label className="flex flex-col gap-2" htmlFor="work-document-title">
            <span className="text-sm font-semibold">문서 제목</span>
            <input
              id="work-document-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 오일작업착수서"
              className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </label>

          <label className="flex flex-col gap-2" htmlFor="work-document-file">
            <span className="text-sm font-semibold">PDF 파일</span>
            <span className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted px-4 py-5 text-center hover:border-primary">
              {file ? <FileText className="size-7 text-primary" aria-hidden="true" /> : <Upload className="size-7 text-muted-foreground" aria-hidden="true" />}
              <span className="max-w-full truncate text-sm font-semibold">{file ? file.name : "PDF 파일 선택"}</span>
              <span className="text-sm text-muted-foreground">PDF 형식만 등록할 수 있습니다.</span>
            </span>
            <input
              ref={fileInputRef}
              id="work-document-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="sr-only"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Upload className="size-5" aria-hidden="true" />
            {isSaving ? "등록 중..." : "등록하기"}
          </button>
        </form>
      </section>
    </main>
  )
}
