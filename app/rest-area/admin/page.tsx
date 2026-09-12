"use client"

import {
  ArrowLeft,
  BedSingle,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Pencil,
  Plus,
  Save,
  Search,
  ShowerHead,
  Trash2,
  UserRound,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, type FormEvent } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

const ADMIN_ID = "human"
const ADMIN_PASSWORD = "1024"

type RestArea = {
  id: string
  name: string
  address: string
  has_shower: boolean
  has_sleep: boolean
  created_at: string
}

type RestAreaForm = {
  name: string
  address: string
  hasShower: boolean
  hasSleep: boolean
}

const EMPTY_FORM: RestAreaForm = {
  name: "",
  address: "",
  hasShower: false,
  hasSleep: false,
}

async function fetchRestAreas(): Promise<RestArea[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .schema("drivermgm")
    .from("human_gw_restarea")
    .select("id, name, address, has_shower, has_sleep, created_at")
    .order("name", { ascending: true })

  if (error) throw error
  return data ?? []
}

export default function RestAreaAdminPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ id: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [form, setForm] = useState<RestAreaForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const {
    data: restAreas = [],
    error: restAreasError,
    isLoading: isLoadingRestAreas,
    mutate,
  } = useSWR<RestArea[]>(isAuthenticated ? "rest-areas-admin" : null, fetchRestAreas)

  const filteredRestAreas = useMemo(() => {
    const normalizedTerm = searchTerm.trim().normalize("NFC").toLowerCase()
    if (!normalizedTerm) return restAreas

    return restAreas.filter((restArea) =>
      restArea.name.normalize("NFC").toLowerCase().includes(normalizedTerm),
    )
  }, [restAreas, searchTerm])

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (credentials.id !== ADMIN_ID || credentials.password !== ADMIN_PASSWORD) {
      setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.")
      return
    }

    setLoginError("")
    setCredentials({ id: "", password: "" })
    setIsAuthenticated(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = form.name.trim().normalize("NFC")
    const address = form.address.trim().normalize("NFC")

    if (!name || !address) {
      window.alert("휴게소명과 주소를 입력해 주세요.")
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()
      const restAreaValues = {
        name,
        address,
        has_shower: form.hasShower,
        has_sleep: form.hasSleep,
      }

      if (editingId) {
        const { data: updatedRestArea, error: updateError } = await supabase
          .schema("drivermgm")
          .from("human_gw_restarea")
          .update(restAreaValues)
          .eq("id", editingId)
          .select("id, name, address, has_shower, has_sleep, created_at")
          .single()

        if (updateError) throw updateError

        await mutate(
          (currentRestAreas = []) =>
            currentRestAreas
              .map((restArea) => (restArea.id === editingId ? updatedRestArea : restArea))
              .sort((first, second) => first.name.localeCompare(second.name, "ko-KR")),
          { revalidate: false },
        )
        window.alert("휴게소 정보가 수정되었습니다.")
      } else {
        const { data: insertedRestArea, error: insertError } = await supabase
          .schema("drivermgm")
          .from("human_gw_restarea")
          .insert(restAreaValues)
          .select("id, name, address, has_shower, has_sleep, created_at")
          .single()

        if (insertError) throw insertError

        await mutate(
          (currentRestAreas = []) =>
            [...currentRestAreas, insertedRestArea].sort((first, second) =>
              first.name.localeCompare(second.name, "ko-KR"),
            ),
          { revalidate: false },
        )
        window.alert("새 휴게소가 등록되었습니다.")
      }

      setEditingId(null)
      setForm(EMPTY_FORM)
      void mutate()
    } catch {
      window.alert(
        editingId
          ? "수정하지 못했습니다. 테이블의 수정 권한을 확인해 주세요."
          : "등록하지 못했습니다. 테이블과 권한 설정을 확인해 주세요.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (restArea: RestArea) => {
    setEditingId(restArea.id)
    setForm({
      name: restArea.name,
      address: restArea.address,
      hasShower: restArea.has_shower,
      hasSleep: restArea.has_sleep,
    })
    document.getElementById("rest-area-form-title")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = async (restArea: RestArea) => {
    if (!window.confirm(`“${restArea.name}” 휴게소를 삭제하시겠습니까?`)) return

    setDeletingId(restArea.id)

    try {
      const supabase = createClient()
      const { data: deletedRows, error: deleteError } = await supabase
        .schema("drivermgm")
        .from("human_gw_restarea")
        .delete()
        .eq("id", restArea.id)
        .select("id")

      if (deleteError) throw deleteError
      if (!deletedRows?.length) throw new Error("삭제할 휴게소를 찾지 못했습니다.")

      await mutate(
        (currentRestAreas = []) => currentRestAreas.filter((current) => current.id !== restArea.id),
        { revalidate: false },
      )
      if (editingId === restArea.id) handleCancelEdit()
      void mutate()
      window.alert("휴게소가 삭제되었습니다.")
    } catch {
      window.alert("삭제하지 못했습니다. 테이블의 삭제 권한을 확인해 주세요.")
      void mutate()
    } finally {
      setDeletingId(null)
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
            <h1 id="admin-login-title" className="text-balance text-2xl font-bold tracking-tight">관리자 인증</h1>
            <p className="text-sm leading-6 text-muted-foreground">휴게소 정보를 관리하려면 관리자 정보를 입력해 주세요.</p>
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

            <button type="submit" className="h-12 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              로그인
            </button>
            <button type="button" onClick={() => router.push("/rest-area")} className="h-11 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
        <button type="button" onClick={() => router.push("/rest-area")} className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="휴게소 목록으로 이동">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">휴게소 정보 관리</h1>
      </header>

      <section className="flex flex-col gap-6 px-4 py-6" aria-labelledby="rest-area-form-title">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">관리자 전용</p>
          <h2 id="rest-area-form-title" className="text-balance text-2xl font-bold tracking-tight">
            {editingId ? "휴게소 정보 수정" : "새 휴게소 등록"}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {editingId ? "선택한 정보를 변경한 뒤 저장해 주세요." : "휴게소 위치와 편의시설 정보를 입력해 주세요."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <label className="flex flex-col gap-2" htmlFor="rest-area-name">
            <span className="text-sm font-semibold">휴게소명</span>
            <span className="relative block">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input id="rest-area-name" type="text" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="예: 칠곡휴게소" className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" required />
            </span>
          </label>

          <label className="flex flex-col gap-2" htmlFor="rest-area-address">
            <span className="text-sm font-semibold">주소</span>
            <input id="rest-area-address" type="text" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="도로명 주소를 입력하세요" className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" required />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2" htmlFor="has-shower">
              <span className="flex items-center gap-2 text-sm font-semibold"><ShowerHead className="size-4" aria-hidden="true" />샤워실</span>
              <select id="has-shower" value={String(form.hasShower)} onChange={(event) => setForm((current) => ({ ...current, hasShower: event.target.value === "true" }))} className="h-12 rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="true">O</option>
                <option value="false">X</option>
              </select>
            </label>
            <label className="flex flex-col gap-2" htmlFor="has-sleep">
              <span className="flex items-center gap-2 text-sm font-semibold"><BedSingle className="size-4" aria-hidden="true" />수면실</span>
              <select id="has-sleep" value={String(form.hasSleep)} onChange={(event) => setForm((current) => ({ ...current, hasSleep: event.target.value === "true" }))} className="h-12 rounded-xl border border-input bg-background px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="true">O</option>
                <option value="false">X</option>
              </select>
            </label>
          </div>

          <div className="flex gap-2">
            {editingId ? (
              <button type="button" onClick={handleCancelEdit} disabled={isSaving} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="size-5" aria-hidden="true" />취소
              </button>
            ) : null}
            <button type="submit" disabled={isSaving} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {isSaving ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : editingId ? <Save className="size-5" aria-hidden="true" /> : <Plus className="size-5" aria-hidden="true" />}
              {isSaving ? "저장 중..." : editingId ? "수정 저장" : "등록하기"}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-3" aria-labelledby="registered-rest-areas-title">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-primary">등록 현황</p>
              <h2 id="registered-rest-areas-title" className="text-xl font-bold tracking-tight">등록된 휴게소</h2>
            </div>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              총 {filteredRestAreas.length}곳
            </span>
          </div>

          <label className="relative block" htmlFor="admin-rest-area-search">
            <span className="sr-only">등록된 휴게소명 검색</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="admin-rest-area-search"
              type="search"
              inputMode="search"
              autoComplete="off"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="휴게소명 검색"
              className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          {isLoadingRestAreas ? (
            <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground" role="status">휴게소를 불러오는 중입니다.</p>
          ) : restAreasError ? (
            <p className="rounded-xl bg-muted p-6 text-center text-sm text-destructive" role="alert">휴게소 목록을 불러오지 못했습니다.</p>
          ) : filteredRestAreas.length === 0 ? (
            <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">
              {searchTerm ? "검색 결과가 없습니다." : "등록된 휴게소가 없습니다."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {filteredRestAreas.map((restArea) => {
                const isDeleting = deletingId === restArea.id
                return (
                  <li key={restArea.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-semibold leading-6">{restArea.name}</p>
                        <p className="break-words text-sm leading-6 text-muted-foreground">{restArea.address}</p>
                        <p className="mt-2 text-sm text-muted-foreground">샤워실 {restArea.has_shower ? "O" : "X"} · 수면실 {restArea.has_sleep ? "O" : "X"}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => handleEdit(restArea)} disabled={isSaving || deletingId !== null} className="flex size-10 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${restArea.name} 수정`}>
                          <Pencil className="size-5" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => void handleDelete(restArea)} disabled={isSaving || deletingId !== null} className="flex size-10 items-center justify-center rounded-xl text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${restArea.name} 삭제`}>
                          {isDeleting ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Trash2 className="size-5" aria-hidden="true" />}
                        </button>
                      </div>
                    </div>
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
