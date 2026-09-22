"use client"

import { ArrowLeft, BookOpenCheck, ChevronRight, LoaderCircle, LockKeyhole, Save, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

type EducationStatus = "completed" | "incomplete" | "exempt"
type EducationRecord = { id: string; employee_number: string; employee_name: string; department: string; position: string; course_code: string; course_name: string; course_order: number; completed_date: string | null; next_education_date: string | null; status: EducationStatus }
type EditingRecord = EducationRecord & { nextDateUndecided: boolean }

const ADMIN_ID = "human"
const ADMIN_PASSWORD = "1024"

async function fetchEducationRecords(): Promise<EducationRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase.schema("drivermgm").from("human_gw_education").select("id, employee_number, employee_name, department, position, course_code, course_name, course_order, completed_date, next_education_date, status").order("employee_number", { ascending: true }).order("course_order", { ascending: true })
  if (error) throw error
  return (data ?? []) as EducationRecord[]
}

function toEditingRecord(record: EducationRecord): EditingRecord {
  return { ...record, nextDateUndecided: !record.next_education_date }
}

export default function EducationAdminPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ id: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedEmployeeNumber, setSelectedEmployeeNumber] = useState<string | null>(null)
  const [draftCourses, setDraftCourses] = useState<EditingRecord[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const { data: records = [], error, isLoading, mutate } = useSWR<EducationRecord[]>(isAuthenticated ? "education-records-admin" : null, fetchEducationRecords)

  const employees = useMemo(() => {
    const employeeMap = new Map<string, EducationRecord>()
    records.forEach((record) => { if (!employeeMap.has(record.employee_number)) employeeMap.set(record.employee_number, record) })
    return [...employeeMap.values()]
  }, [records])
  const selectedEmployee = employees.find((employee) => employee.employee_number === selectedEmployeeNumber) ?? null

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (credentials.id !== ADMIN_ID || credentials.password !== ADMIN_PASSWORD) { setLoginError("아이디 또는 비밀번호가 올바르지 않습니다."); return }
    setCredentials({ id: "", password: "" }); setLoginError(""); setIsAuthenticated(true)
  }

  const selectEmployee = (employeeNumber: string) => {
    setSelectedEmployeeNumber(employeeNumber)
    setDraftCourses(records.filter((record) => record.employee_number === employeeNumber).map(toEditingRecord))
  }

  const updateDraft = (id: string, patch: Partial<EditingRecord>) => setDraftCourses((courses) => courses.map((course) => course.id === id ? { ...course, ...patch } : course))

  const markAll = (status: "completed" | "incomplete") => {
    const today = new Date().toISOString().slice(0, 10)
    setDraftCourses((courses) => courses.map((course) => ({ ...course, status, completed_date: status === "completed" ? course.completed_date ?? today : null })))
  }

  const cancelEditing = () => {
    if (!selectedEmployeeNumber) return
    setDraftCourses(records.filter((record) => record.employee_number === selectedEmployeeNumber).map(toEditingRecord))
  }

  const handleSave = async () => {
    if (!selectedEmployee) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      const updates = await Promise.all(draftCourses.map(async (course) => {
        const { data, error: updateError } = await supabase.schema("drivermgm").from("human_gw_education").update({ status: course.status, completed_date: course.completed_date || null, next_education_date: course.nextDateUndecided ? null : course.next_education_date || null }).eq("id", course.id).select("id, employee_number, employee_name, department, position, course_code, course_name, course_order, completed_date, next_education_date, status").single()
        if (updateError) throw updateError
        return data as EducationRecord
      }))
      await mutate((current = []) => current.map((record) => updates.find((update) => update.id === record.id) ?? record), { revalidate: false })
      setDraftCourses(updates.map(toEditingRecord))
      void mutate()
      window.alert("교육 현황이 저장되었습니다.")
    } catch {
      window.alert("저장하지 못했습니다. 테이블의 UPDATE 권한을 확인해 주세요.")
    } finally { setIsSaving(false) }
  }

  if (!isAuthenticated) return <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8"><section className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-lg" aria-labelledby="admin-login-title"><div className="flex flex-col gap-2 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="size-6" aria-hidden="true" /></span><h1 id="admin-login-title" className="text-2xl font-bold tracking-tight">교육 현황 관리자</h1><p className="text-sm leading-6 text-muted-foreground">교육 정보를 수정하려면 관리자 인증이 필요합니다.</p></div><form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4"><label className="flex flex-col gap-2" htmlFor="admin-id"><span className="text-sm font-semibold">아이디</span><input id="admin-id" value={credentials.id} onChange={(event) => setCredentials((current) => ({ ...current, id: event.target.value }))} autoComplete="username" className="h-12 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label><label className="flex flex-col gap-2" htmlFor="admin-password"><span className="text-sm font-semibold">비밀번호</span><input id="admin-password" type="password" value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} autoComplete="current-password" className="h-12 rounded-xl border border-input bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>{loginError ? <p className="text-sm text-destructive" role="alert">{loginError}</p> : null}<button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><LockKeyhole className="size-4" aria-hidden="true" />로그인</button><button type="button" onClick={() => router.push("/education")} className="h-11 text-sm font-semibold text-muted-foreground hover:text-foreground">사용자 화면으로 돌아가기</button></form></section></main>

  if (selectedEmployee) return <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur"><button type="button" onClick={() => { setSelectedEmployeeNumber(null); setDraftCourses([]) }} className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="직원 목록으로 돌아가기"><ArrowLeft className="size-5" aria-hidden="true" /></button><h1 className="text-base font-bold">교육 현황 수정</h1><span className="size-10" aria-hidden="true" /></header><section className="flex flex-col gap-5 px-4 py-6"><div className="rounded-3xl bg-primary p-5 text-primary-foreground"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15"><UserRound className="size-6" aria-hidden="true" /></span><div><h2 className="text-xl font-bold">{selectedEmployee.employee_name}</h2><p className="mt-1 text-sm text-primary-foreground/75">{selectedEmployee.employee_number} · {selectedEmployee.department} · {selectedEmployee.position}</p></div></div></div><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => markAll("completed")} className="h-11 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">모두 완료</button><button type="button" onClick={() => markAll("incomplete")} className="h-11 rounded-xl border border-border bg-card text-sm font-bold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">모두 미완료</button></div><div className="flex flex-col gap-4">{draftCourses.map((course) => <article key={course.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="border-b border-border pb-3"><p className="text-xs font-semibold text-muted-foreground">{course.course_code}</p><h3 className="mt-1 text-base font-bold">{course.course_name}</h3></div><div className="mt-4 flex flex-col gap-4"><label className="flex flex-col gap-2"><span className="text-sm font-semibold">교육 이수일자</span><input type="date" value={course.completed_date ?? ""} onChange={(event) => updateDraft(course.id, { completed_date: event.target.value || null })} className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label><div className="flex flex-col gap-2"><span className="text-sm font-semibold">다음 교육일자</span><input type="date" disabled={course.nextDateUndecided} value={course.nextDateUndecided ? "" : course.next_education_date ?? ""} onChange={(event) => updateDraft(course.id, { next_education_date: event.target.value || null })} className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-muted" /><label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={course.nextDateUndecided} onChange={(event) => updateDraft(course.id, { nextDateUndecided: event.target.checked })} className="size-4 accent-primary" />다음 교육일자 미정</label></div><fieldset className="flex flex-col gap-2"><legend className="text-sm font-semibold">교육 완료 여부</legend><div className="grid grid-cols-3 gap-2">{(["incomplete", "completed", "exempt"] as EducationStatus[]).map((status) => <label key={status} className={`flex h-10 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${course.status === status ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background hover:bg-muted"}`}><input type="radio" name={`status-${course.id}`} value={status} checked={course.status === status} onChange={() => updateDraft(course.id, { status })} className="sr-only" />{status === "incomplete" ? "미완료" : status === "completed" ? "완료" : "면제"}</label>)}</div></fieldset></div></article>)}</div><div className="sticky bottom-3 grid grid-cols-2 gap-3 rounded-2xl bg-background/95 p-2 backdrop-blur"><button type="button" onClick={cancelEditing} disabled={isSaving} className="h-12 rounded-xl border border-border bg-card text-sm font-bold hover:bg-muted disabled:opacity-50">취소</button><button type="button" onClick={handleSave} disabled={isSaving} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">{isSaving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}{isSaving ? "저장 중" : "저장"}</button></div></section></main>

  return <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur"><button type="button" onClick={() => router.push("/education")} className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="사용자 교육 현황으로 돌아가기"><ArrowLeft className="size-5" aria-hidden="true" /></button><h1 className="text-base font-bold">교육 현황 관리자</h1><span className="size-10" aria-hidden="true" /></header><section className="flex flex-col gap-5 px-4 py-6" aria-labelledby="admin-education-title"><div className="rounded-3xl bg-secondary p-5"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-card text-primary shadow-sm"><BookOpenCheck className="size-6" aria-hidden="true" /></span><div><h2 id="admin-education-title" className="text-lg font-bold">직원 교육 현황 수정</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">직원을 선택하여 교육 정보를 수정하세요.</p></div></div></div>{isLoading ? <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground" role="status"><LoaderCircle className="mx-auto mb-3 size-5 animate-spin" aria-hidden="true" />교육 현황을 불러오는 중입니다.</p> : null}{error ? <p className="rounded-2xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive" role="alert">교육 현황을 불러오지 못했습니다.</p> : null}{!isLoading && !error && employees.length === 0 ? <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">등록된 직원 교육 현황이 없습니다.</p> : null}<div className="flex flex-col gap-3">{employees.map((employee) => <button key={employee.employee_number} type="button" onClick={() => selectEmployee(employee.employee_number)} className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary"><UserRound className="size-6" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-base font-bold">{employee.employee_name}</span><span className="mt-1 block text-sm text-muted-foreground">{employee.employee_number} · {employee.department}</span><span className="mt-1 block text-xs text-muted-foreground">{employee.position}</span></span><ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" /></button>)}</div></section></main>
}
