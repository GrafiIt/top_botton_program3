"use client"

import { ArrowLeft, Edit3, LoaderCircle, LockKeyhole, MapPin, Plus, Save, Search, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, type FormEvent } from "react"
import useSWR from "swr"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { createClient } from "@/utils/supabase/client"

type ShipOilRecord = {
  id: string
  agent: string
  pier_name: string
  address: string
  created_at: string
}

type ShipOilForm = Pick<ShipOilRecord, "agent" | "pier_name" | "address">

const EMPTY_FORM: ShipOilForm = {
  agent: "",
  pier_name: "",
  address: "",
}

async function fetchShipOilRecords(): Promise<ShipOilRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .schema("drivermgm")
    .from("human_gw_shipoil")
    .select("id, agent, pier_name, address, created_at")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export default function ShipOilAdminPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized, credentials, setCredentials, login, loginError } = useAdminAuth()
  const [form, setForm] = useState<ShipOilForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const {
    data: records = [],
    error,
    isLoading,
    mutate,
  } = useSWR<ShipOilRecord[]>(
    isAuthenticated ? "ship-oil-admin-records" : null,
    fetchShipOilRecords,
  )

  const filteredRecords = useMemo(() => {
    const normalizedSearchTerm = searchTerm.normalize("NFC").toLowerCase()

    if (!normalizedSearchTerm) return records

    return records.filter((record) => {
      const normalizedAgent = record.agent.normalize("NFC").toLowerCase()
      const normalizedPierName = record.pier_name.normalize("NFC").toLowerCase()

      return (
        normalizedAgent.includes(normalizedSearchTerm) ||
        normalizedPierName.includes(normalizedSearchTerm)
      )
    })
  }, [records, searchTerm])

  const updateField = (field: keyof ShipOilForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const values: ShipOilForm = {
      agent: form.agent.trim().normalize("NFC"),
      pier_name: form.pier_name.trim().normalize("NFC"),
      address: form.address.trim().normalize("NFC"),
    }

    if (Object.values(values).some((value) => !value)) {
      window.alert("모든 항목을 입력해 주세요.")
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()

      if (editingId) {
        const { error: updateError } = await supabase
          .schema("drivermgm")
          .from("human_gw_shipoil")
          .update(values)
          .eq("id", editingId)

        if (updateError) throw updateError
        window.alert("도착지 정보가 수정되었습니다.")
      } else {
        const { error: insertError } = await supabase
          .schema("drivermgm")
          .from("human_gw_shipoil")
          .insert(values)

        if (insertError) throw insertError
        window.alert("도착지 정보가 등록되었습니다.")
      }

      resetForm()
      await mutate()
    } catch {
      window.alert(
        editingId
          ? "수정하지 못했습니다. 테이블 권한을 확인해 주세요."
          : "등록하지 못했습니다. 테이블 권한을 확인해 주세요.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (record: ShipOilRecord) => {
    setEditingId(record.id)
    setForm({
      agent: record.agent,
      pier_name: record.pier_name,
      address: record.address,
    })
    document.getElementById("ship-oil-form-title")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const handleDelete = async (record: ShipOilRecord) => {
    if (!window.confirm(`“${record.pier_name}” 도착지 정보를 삭제하시겠습니까?`)) return

    setDeletingId(record.id)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .schema("drivermgm")
        .from("human_gw_shipoil")
        .delete()
        .eq("id", record.id)

      if (deleteError) throw deleteError

      if (editingId === record.id) resetForm()
      await mutate()
      window.alert("도착지 정보가 삭제되었습니다.")
    } catch {
      window.alert("삭제하지 못했습니다. 테이블 권한을 확인해 주세요.")
    } finally {
      setDeletingId(null)
    }
  }

  if (!isInitialized) {
    return <main className="flex min-h-dvh items-center justify-center bg-muted" aria-busy="true"><LoaderCircle className="size-6 animate-spin text-primary" aria-hidden="true" /><span className="sr-only">관리자 인증 상태를 확인하는 중입니다.</span></main>
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
        <section
          className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-lg"
          aria-labelledby="ship-oil-login-title"
        >
          <div className="flex flex-col gap-2 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <LockKeyhole className="size-6" aria-hidden="true" />
            </span>
            <h1 id="ship-oil-login-title" className="text-balance text-2xl font-bold tracking-tight">
              선박유 도착지 관리자 인증
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              도착지 정보를 관리하려면 로그인해 주세요.
            </p>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); login() }} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-2" htmlFor="ship-oil-admin-id">
              <span className="text-sm font-semibold">아이디</span>
              <input
                id="ship-oil-admin-id"
                type="text"
                autoComplete="username"
                autoFocus
                value={credentials.id}
                onChange={(event) =>
                  setCredentials((current) => ({ ...current, id: event.target.value }))
                }
                className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>
            <label className="flex flex-col gap-2" htmlFor="ship-oil-admin-password">
              <span className="text-sm font-semibold">비밀번호</span>
              <input
                id="ship-oil-admin-password"
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((current) => ({ ...current, password: event.target.value }))
                }
                className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>
            {loginError ? (
              <p className="text-center text-sm text-destructive" role="alert">
                {loginError}
              </p>
            ) : null}
            <button
              type="submit"
              className="h-12 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => router.push("/ship-oil")}
              className="h-11 rounded-xl border border-border text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              사용자 화면으로 돌아가기
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
      <header className="sticky top-0 flex h-16 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push("/ship-oil")}
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="선박유 도착지 정보로 이동"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">선박유 도착지 관리</h1>
      </header>

      <section className="flex flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">관리자 전용</p>
          <h2 id="ship-oil-form-title" className="text-balance text-2xl font-bold tracking-tight">
            {editingId ? "도착지 정보 수정" : "새 도착지 등록"}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            저장된 정보는 사용자 화면에 바로 반영됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          {(
            [
              ["agent", "Agent", "Agent명을 입력하세요"],
              ["pier_name", "도착지 부두명", "부두명을 입력하세요"],
              ["address", "상세 주소", "상세 주소를 입력하세요"],
            ] as [keyof ShipOilForm, string, string][]
          ).map(([field, label, placeholder]) => (
            <label key={field} className="flex flex-col gap-2" htmlFor={`ship-oil-${field}`}>
              <span className="text-sm font-semibold">{label}</span>
              <input
                id={`ship-oil-${field}`}
                type="text"
                value={form[field]}
                onChange={(event) => updateField(field, event.target.value)}
                placeholder={placeholder}
                className="h-11 rounded-xl border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </label>
          ))}

          <div className="flex gap-2">
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold disabled:opacity-50"
              >
                <X className="size-4" aria-hidden="true" />
                취소
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isSaving}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {editingId ? <Save className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
              {isSaving ? "저장 중..." : editingId ? "수정 저장" : "등록하기"}
            </button>
          </div>
        </form>

        <section className="flex flex-col gap-4" aria-labelledby="ship-oil-list-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">등록 현황</p>
              <h2 id="ship-oil-list-title" className="text-xl font-bold tracking-tight">도착지 목록</h2>
            </div>
            {!isLoading && !error ? (
              <span className="text-sm text-muted-foreground">{filteredRecords.length}건</span>
            ) : null}
          </div>

          <label className="relative block" htmlFor="ship-oil-admin-search">
            <span className="sr-only">Agent 또는 도착지 부두명 검색</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="ship-oil-admin-search"
              type="search"
              inputMode="search"
              autoComplete="off"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Agent 또는 부두명 검색"
              className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          {isLoading ? (
            <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground" role="status">
              도착지 정보를 불러��는 중입니다.
            </p>
          ) : error ? (
            <p className="rounded-2xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive" role="alert">
              도착지 정보를 불러오지 못했습니다.
            </p>
          ) : filteredRecords.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {searchTerm ? "검색 결과가 없습니다." : "등록된 도착지 정보가 없습니다."}
            </p>
          ) : (
            <div className="flex flex-col gap-3" aria-live="polite">
              {filteredRecords.map((record, index) => (
                <article key={record.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-secondary-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-primary">{record.agent}</p>
                      <h3 className="break-words font-bold leading-6">{record.pier_name}</h3>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm leading-6 text-muted-foreground">
                    <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
                    <p className="break-words">{record.address}</p>
                  </div>

                  <div className="flex gap-2 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(record)}
                      disabled={deletingId === record.id}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold disabled:opacity-50"
                    >
                      <Edit3 className="size-4" aria-hidden="true" />
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record)}
                      disabled={deletingId === record.id}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-destructive text-sm font-semibold text-destructive-foreground disabled:opacity-50"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      {deletingId === record.id ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
