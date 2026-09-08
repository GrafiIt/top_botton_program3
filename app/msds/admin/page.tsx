"use client"

import {
  ArrowLeft,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Pencil,
  Save,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

const ADMIN_ID = "human"
const ADMIN_PASSWORD = "1024"
const STORAGE_BUCKET = "work_documents"

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

function getStoragePath(pdfUrl: string) {
  try {
    const pathname = new URL(pdfUrl).pathname
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
    const markerIndex = pathname.indexOf(marker)

    if (markerIndex === -1) return null

    const storagePath = decodeURIComponent(pathname.slice(markerIndex + marker.length))
    const pathSegments = storagePath.split("/")

    if (!storagePath || pathSegments.some((segment) => !segment || segment === "." || segment === "..")) {
      return null
    }

    return storagePath
  } catch {
    return null
  }
}

function formatCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(createdAt))
}

export default function MsdsDocumentAdminPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [credentials, setCredentials] = useState({ id: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const {
    data: documents = [],
    error: documentsError,
    isLoading: isLoadingDocuments,
    mutate,
  } = useSWR<MsdsDocument[]>(isAuthenticated ? "msds-documents-admin" : null, fetchMsdsDocuments)

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
      const { data: insertedDocument, error: insertError } = await supabase
        .schema("drivermgm")
        .from("human_gw_workdoc")
        .insert({
          title: title.trim(),
          pdf_url: urlData.publicUrl,
          doc_type: "msds",
        })
        .select("id, title, pdf_url, created_at")
        .single()

      if (insertError) {
        await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
        throw insertError
      }

      await mutate((currentDocuments = []) => [insertedDocument, ...currentDocuments], {
        revalidate: false,
      })
      void mutate()
      window.alert("MSDS가 등록되었습니다.")
      setTitle("")
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      window.alert("등록 중 오류가 발생했습니다. 저장소와 테이블 설정을 확인해 주세요.")
    } finally {
      setIsSaving(false)
    }
  }

  const startEditing = (document: MsdsDocument) => {
    setEditingId(document.id)
    setEditingTitle(document.title)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const handleTitleUpdate = async (documentId: string) => {
    const nextTitle = editingTitle.trim()

    if (!nextTitle) {
      window.alert("문서 제목을 입력해 주세요.")
      return
    }

    setProcessingId(`update:${documentId}`)

    try {
      const supabase = createClient()
      const { data: updatedRows, error: updateError } = await supabase
        .schema("drivermgm")
        .from("human_gw_workdoc")
        .update({ title: nextTitle })
        .eq("id", documentId)
        .select("id")

      if (updateError) throw updateError
      if (!updatedRows?.length) throw new Error("수정할 문서를 찾지 못했습니다.")

      await mutate(
        (currentDocuments = []) =>
          currentDocuments.map((document) =>
            document.id === documentId ? { ...document, title: nextTitle } : document,
          ),
        { revalidate: false },
      )
      cancelEditing()
      void mutate()
      window.alert("문서 제목이 수정되었습니다.")
    } catch {
      window.alert("제목을 수정하지 못했습니다. 테이블 권한을 확인해 주세요.")
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (document: MsdsDocument) => {
    const approved = window.confirm(`“${document.title}” 문서와 PDF 파일을 삭제하시겠습니까?`)
    if (!approved) return

    const storagePath = getStoragePath(document.pdf_url)
    if (!storagePath) {
      window.alert("PDF 저장 경로를 확인할 수 없어 삭제를 중단했습니다.")
      return
    }

    setProcessingId(`delete:${document.id}`)

    try {
      const supabase = createClient()
      const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])

      if (storageError) throw storageError

      const { data: deletedRows, error: deleteError } = await supabase
        .schema("drivermgm")
        .from("human_gw_workdoc")
        .delete()
        .eq("id", document.id)
        .select("id")

      if (deleteError) throw deleteError
      if (!deletedRows?.length) throw new Error("삭제할 문서를 찾지 못했습니다.")

      await mutate(
        (currentDocuments = []) =>
          currentDocuments.filter((currentDocument) => currentDocument.id !== document.id),
        { revalidate: false },
      )
      if (editingId === document.id) cancelEditing()
      void mutate()
      window.alert("문서와 PDF 파일이 삭제되었습니다.")
    } catch {
      window.alert("삭제를 완료하지 못했습니다. 저장소와 테이블의 삭제 권한을 확인해 주세요.")
      void mutate()
    } finally {
      setProcessingId(null)
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
            <p className="text-sm leading-6 text-muted-foreground">MSDS를 관리하려면 관리자 정보를 입력해 주세요.</p>
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
              onClick={() => router.push("/msds")}
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
          onClick={() => router.push("/msds")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="MSDS 목록으로 이동"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">MSDS 관리</h1>
      </header>

      <section className="flex flex-col gap-6 px-4 py-6" aria-labelledby="upload-form-title">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">관리자 문서함</p>
          <h2 id="upload-form-title" className="text-balance text-2xl font-bold tracking-tight">새 PDF 등록</h2>
          <p className="text-sm leading-6 text-muted-foreground">현장에서 확인할 MSDS를 업로드하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <label className="flex flex-col gap-2" htmlFor="msds-document-title">
            <span className="text-sm font-semibold">문서 제목</span>
            <input
              id="msds-document-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 오일작업착수서"
              className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </label>

          <label className="flex flex-col gap-2" htmlFor="msds-document-file">
            <span className="text-sm font-semibold">PDF 파일</span>
            <span className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted px-4 py-5 text-center hover:border-primary">
              {file ? <FileText className="size-7 text-primary" aria-hidden="true" /> : <Upload className="size-7 text-muted-foreground" aria-hidden="true" />}
              <span className="max-w-full truncate text-sm font-semibold">{file ? file.name : "PDF 파일 선택"}</span>
              <span className="text-sm text-muted-foreground">PDF 형식만 등록할 수 있습니다.</span>
            </span>
            <input
              ref={fileInputRef}
              id="msds-document-file"
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
            {isSaving ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Upload className="size-5" aria-hidden="true" />}
            {isSaving ? "등록 중..." : "등록하기"}
          </button>
        </form>

        <div className="flex flex-col gap-3" aria-labelledby="registered-documents-title">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-primary">등록 현황</p>
              <h2 id="registered-documents-title" className="text-xl font-bold tracking-tight">등록된 문서</h2>
            </div>
            <span className="text-sm text-muted-foreground">총 {documents.length}건</span>
          </div>

          {isLoadingDocuments ? (
            <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground" role="status">
              문서를 불러오는 중입니다.
            </p>
          ) : documentsError ? (
            <p className="rounded-xl bg-muted p-6 text-center text-sm text-destructive" role="alert">
              문서 목록을 불러오지 못했습니다.
            </p>
          ) : documents.length === 0 ? (
            <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">
              등록된 MSDS가 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {documents.map((document) => {
                const isEditing = editingId === document.id
                const isUpdating = processingId === `update:${document.id}`
                const isDeleting = processingId === `delete:${document.id}`
                const isBusy = processingId !== null

                return (
                  <li key={document.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    {isEditing ? (
                      <div className="flex flex-col gap-3">
                        <label className="flex flex-col gap-2" htmlFor={`edit-title-${document.id}`}>
                          <span className="text-sm font-semibold">문서 제목 수정</span>
                          <input
                            id={`edit-title-${document.id}`}
                            type="text"
                            value={editingTitle}
                            onChange={(event) => setEditingTitle(event.target.value)}
                            className="h-11 rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            disabled={isUpdating}
                            required
                          />
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleTitleUpdate(document.id)}
                            disabled={isBusy}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {isUpdating ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isUpdating}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-muted px-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <X className="size-4" aria-hidden="true" />
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <FileText className="size-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block break-words text-base font-semibold leading-6">{document.title}</span>
                            <span className="mt-1 block text-sm text-muted-foreground">{formatCreatedAt(document.created_at)} 등록</span>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(document)}
                            disabled={isBusy}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-muted px-3 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(document)}
                            disabled={isBusy}
                            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-destructive bg-background px-3 text-sm font-semibold text-destructive disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {isDeleting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
                            {isDeleting ? "삭제 중" : "삭제"}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
