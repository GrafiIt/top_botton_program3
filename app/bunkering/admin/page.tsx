"use client"

import { ArrowLeft, ClipboardList, Edit3, LockKeyhole, Plus, Save, Search, Trash2, UserRound, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, type FormEvent } from "react"
import useSWR from "swr"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { createClient } from "@/utils/supabase/client"

type BunkeringRecord = {
  id: string
  agent: string
  barge_name: string
  loading_point: string
  port: string
  manager_name: string
  contact: string
  task_details: string
  created_at: string
}

type BunkeringForm = Omit<BunkeringRecord, "id" | "created_at">

const EMPTY_FORM: BunkeringForm = { agent: "", barge_name: "", loading_point: "", port: "", manager_name: "", contact: "", task_details: "" }

async function fetchBunkeringRecords(): Promise<BunkeringRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase.schema("drivermgm").from("human_gw_bunkering").select("id, agent, barge_name, loading_point, port, manager_name, contact, task_details, created_at").order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

function normalizeSearchValue(value: string) {
  return value.normalize("NFC").toLocaleLowerCase("ko-KR").replaceAll(" ", "")
}

export default function BunkeringAdminPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    isInitialized,
    credentials,
    loginError,
    setCredentials,
    login,
    logout,
  } = useAdminAuth()
  const [form, setForm] = useState<BunkeringForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { data: records = [], error, isLoading, mutate } = useSWR<BunkeringRecord[]>(isAuthenticated ? "bunkering-admin-records" : null, fetchBunkeringRecords)

  const filteredRecords = useMemo(() => {
    const normalizedTerm = normalizeSearchValue(searchTerm)
    if (!normalizedTerm) return records
    return records.filter((record) => [record.agent, record.barge_name, record.loading_point, record.port, record.manager_name, record.contact, record.task_details].some((value) => normalizeSearchValue(value).includes(normalizedTerm)))
  }, [records, searchTerm])

  const updateField = (field: keyof BunkeringForm, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim().normalize("NFC")])) as BunkeringForm
    if (Object.values(values).some((value) => !value)) {
      window.alert("모든 항목을 입력해 주세요.")
      return
    }
    setIsSaving(true)
    try {
      const supabase = createClient()
      if (editingId) {
        const { data, error: updateError } = await supabase.schema("drivermgm").from("human_gw_bunkering").update(values).eq("id", editingId).select("id, agent, barge_name, loading_point, port, manager_name, contact, task_details, created_at").single()
        if (updateError) throw updateError
        await mutate((current = []) => current.map((record) => record.id === editingId ? data : record), { revalidate: false })
        window.alert("벙커링 현황이 수정되었습니다.")
      } else {
        const { data, error: insertError } = await supabase.schema("drivermgm").from("human_gw_bunkering").insert(values).select("id, agent, barge_name, loading_point, port, manager_name, contact, task_details, created_at").single()
        if (insertError) throw insertError
        await mutate((current = []) => [data, ...current], { revalidate: false })
        window.alert("벙커링 현황이 등록되었습니다.")
      }
      setEditingId(null)
      setForm(EMPTY_FORM)
      void mutate()
    } catch {
      window.alert(editingId ? "수정하지 못했습니다. 테이블 권한을 확인해 주세요." : "등록하지 못했습니다. 테이블과 권한 설정을 확인해 주세요.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (record: BunkeringRecord) => {
    setEditingId(record.id)
    setForm({ agent: record.agent, barge_name: record.barge_name, loading_point: record.loading_point, port: record.port, manager_name: record.manager_name, contact: record.contact, task_details: record.task_details })
    document.getElementById("bunkering-form-title")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleDelete = async (record: BunkeringRecord) => {
    if (!window.confirm(`“${record.barge_name}” 벙커링 현황을 삭제하시겠습니까?`)) return
    setDeletingId(record.id)
    try {
      const supabase = createClient()
      const { data, error: deleteError } = await supabase.schema("drivermgm").from("human_gw_bunkering").delete().eq("id", record.id).select("id")
      if (deleteError) throw deleteError
      if (!data?.length) throw new Error("삭제할 항목을 찾지 못했습니다.")
      await mutate((current = []) => current.filter((item) => item.id !== record.id), { revalidate: false })
      if (editingId === record.id) { setEditingId(null); setForm(EMPTY_FORM) }
      window.alert("벙커링 현황이 삭제되었습니다.")
    } catch {
      window.alert("삭제하지 못했습니다. 테이블의 삭제 권한을 확인해 주세요.")
      void mutate()
    } finally {
      setDeletingId(null)
    }
  }

  if (!isInitialized) {
    return <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8" aria-busy="true"><span className="sr-only">관리자 인증 상태를 확인하는 중입니다.</span></main>
  }

  if (!isAuthenticated) {
    return <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8"><section className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-lg" aria-labelledby="admin-login-title"><div className="flex flex-col gap-2 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="size-6" aria-hidden="true" /></span><h1 id="admin-login-title" className="text-2xl font-bold tracking-tight">벙커링 관리자 인증</h1><p className="text-sm leading-6 text-muted-foreground">현황을 등록하거나 수정하려면 로그인해 주세요.</p></div><form onSubmit={(event) => { event.preventDefault(); login() }} className="mt-6 flex flex-col gap-4"><label className="flex flex-col gap-2" htmlFor="admin-id"><span className="text-sm font-semibold">아이디</span><input id="admin-id" type="text" autoComplete="username" value={credentials.id} onChange={(event) => setCredentials((current) => ({ ...current, id: event.target.value }))} className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required /></label><label className="flex flex-col gap-2" htmlFor="admin-password"><span className="text-sm font-semibold">비밀번호</span><input id="admin-password" type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required /></label>{loginError ? <p className="text-center text-sm text-destructive" role="alert">{loginError}</p> : null}<button type="submit" className="h-12 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">로그인</button><button type="button" onClick={() => router.push("/bunkering")} className="h-11 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">목록으로 돌아가기</button></form></section></main>
  }

  return <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm"><header className="flex h-16 items-center gap-2 border-b border-border px-4"><button type="button" onClick={() => router.push("/bunkering")} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="벙커링 현황으로 이동"><ArrowLeft className="size-5" aria-hidden="true" /></button><div className="flex min-w-0 flex-1 items-center justify-between gap-2"><h1 className="text-lg font-bold tracking-tight">벙커링 현황 관리</h1><button type="button" onClick={logout} className="shrink-0 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">로그아웃</button></div></header><section className="flex flex-col gap-6 px-4 py-6"><div className="flex flex-col gap-1"><p className="text-sm font-semibold text-primary">관리자 전용</p><h2 id="bunkering-form-title" className="text-2xl font-bold tracking-tight">{editingId ? "벙커링 현황 수정" : "새 현황 등록"}</h2><p className="text-sm leading-6 text-muted-foreground">필요한 정보를 입력하면 사용자 화면에 바로 반영됩니다.</p></div><form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">{([ ["agent", "Bunkering Agent"], ["barge_name", "barge name"], ["loading_point", "barge loading point"], ["port", "Port"], ["manager_name", "담당자"], ["contact", "연락처"], ["task_details", "담당내역"] ] as [keyof BunkeringForm, string][]).map(([field, label]) => <label key={field} className="flex flex-col gap-2" htmlFor={`bunkering-${field}`}><span className="text-sm font-semibold">{label}</span><input id={`bunkering-${field}`} type="text" value={form[field]} onChange={(event) => updateField(field, event.target.value)} className="h-11 rounded-xl border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" required /></label>)}<div className="flex gap-2">{editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM) }} disabled={isSaving} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted"><X className="size-4" aria-hidden="true" />취소</button> : null}<button type="submit" disabled={isSaving} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60">{editingId ? <Save className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}{editingId ? "수정 저장" : "등록"}</button></div></form><div className="flex flex-col gap-4"><div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-bold"><ClipboardList className="size-5" aria-hidden="true" />등록 현황</h2><span className="text-sm text-muted-foreground">{filteredRecords.length}건</span></div><label className="relative block" htmlFor="admin-bunkering-search"><span className="sr-only">관리자 벙커링 검색</span><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><input id="admin-bunkering-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="등록 현황 빠른 검색" className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>{isLoading ? <p className="p-6 text-center text-sm text-muted-foreground">목록을 불러오는 중입니다.</p> : error ? <p className="p-6 text-center text-sm text-destructive" role="alert">목록을 불러오지 못했습니다.</p> : filteredRecords.length === 0 ? <p className="rounded-2xl border border-border p-6 text-center text-sm text-muted-foreground">등록된 현황이 없습니다.</p> : <div className="flex flex-col gap-3">{filteredRecords.map((record) => <article key={record.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"><div><h3 className="font-bold">{record.barge_name}</h3><p className="text-sm text-muted-foreground">{record.port} · {record.manager_name}</p><p className="mt-1 text-sm">{record.task_details}</p></div><div className="flex gap-2"><button type="button" onClick={() => handleEdit(record)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted"><Edit3 className="size-4" aria-hidden="true" />수정</button><button type="button" onClick={() => void handleDelete(record)} disabled={deletingId === record.id} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/30 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"><Trash2 className="size-4" aria-hidden="true" />{deletingId === record.id ? "삭제 중" : "삭제"}</button></div></article>)}</div>}</div></section></main>
}

