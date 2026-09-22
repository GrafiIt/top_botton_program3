"use client"

import { ArrowLeft, BookOpenCheck, CalendarDays, CheckCircle2, ChevronRight, CircleAlert, LoaderCircle, Settings, UserRound, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

type EducationStatus = "completed" | "incomplete" | "exempt"

type EducationRecord = {
  id: string
  employee_number: string
  employee_name: string
  department: string
  position: string
  course_code: string
  course_name: string
  course_order: number
  completed_date: string | null
  next_education_date: string | null
  status: EducationStatus
}

const statusLabel: Record<EducationStatus, string> = {
  completed: "완료",
  incomplete: "미완료",
  exempt: "면제",
}

async function fetchEducationRecords(): Promise<EducationRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .schema("drivermgm")
    .from("human_gw_education")
    .select("id, employee_number, employee_name, department, position, course_code, course_name, course_order, completed_date, next_education_date, status")
    .order("employee_number", { ascending: true })
    .order("course_order", { ascending: true })

  if (error) throw error
  return (data ?? []) as EducationRecord[]
}

function formatDate(value: string | null) {
  if (!value) return "미정"
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(`${value}T00:00:00`),
  )
}

function StatusIcon({ status }: { status: EducationStatus }) {
  if (status === "completed") return <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
  if (status === "exempt") return <CircleAlert className="size-5 text-muted-foreground" aria-hidden="true" />
  return <XCircle className="size-5 text-destructive" aria-hidden="true" />
}

export default function EducationPage() {
  const router = useRouter()
  const [selectedEmployeeNumber, setSelectedEmployeeNumber] = useState<string | null>(null)
  const { data: records = [], error, isLoading } = useSWR("education-records", fetchEducationRecords)

  const employees = useMemo(() => {
    const employeeMap = new Map<string, EducationRecord>()
    records.forEach((record) => {
      if (!employeeMap.has(record.employee_number)) employeeMap.set(record.employee_number, record)
    })
    return [...employeeMap.values()]
  }, [records])

  const selectedEmployee = employees.find((employee) => employee.employee_number === selectedEmployeeNumber) ?? null
  const selectedCourses = selectedEmployee
    ? records.filter((record) => record.employee_number === selectedEmployee.employee_number)
    : []

  if (selectedEmployee) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
          <button type="button" onClick={() => setSelectedEmployeeNumber(null)} className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="직원 목록으로 돌아가기">
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-base font-bold">교육 현황 상세</h1>
          <span className="size-10" aria-hidden="true" />
        </header>

        <section className="flex flex-col gap-5 px-4 py-6" aria-labelledby="employee-name">
          <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15">
                  <UserRound className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 id="employee-name" className="truncate text-xl font-bold">{selectedEmployee.employee_name}</h2>
                  <p className="text-sm text-primary-foreground/75">{selectedEmployee.employee_number}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">총 {selectedCourses.length}과정</span>
            </div>
            <div className="mt-5 flex gap-2 text-sm text-primary-foreground/85">
              <span>{selectedEmployee.department}</span><span aria-hidden="true">·</span><span>{selectedEmployee.position}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">교육 이수 현황</h3>
            <span className="text-sm text-muted-foreground">총 {selectedCourses.length}건</span>
          </div>

          <div className="flex flex-col gap-3">
            {selectedCourses.map((course) => (
              <article key={course.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground">{course.course_code}</p>
                    <h4 className="mt-1 text-base font-bold">{course.course_name}</h4>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                    <StatusIcon status={course.status} />{statusLabel[course.status]}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-xs font-medium text-muted-foreground">교육 이수일자</dt><dd className="mt-1 font-semibold">{formatDate(course.completed_date)}</dd></div>
                  <div><dt className="text-xs font-medium text-muted-foreground">다음 교육일자</dt><dd className="mt-1 font-semibold">{formatDate(course.next_education_date)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
        <button type="button" onClick={() => router.push("/")} className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="메인 페이지로 돌아가기">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-base font-bold">교육 현황 관리</h1>
        <button type="button" onClick={() => router.push("/education/admin")} className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="교육 현황 관리자 페이지로 이동">
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <section className="flex flex-col gap-5 px-4 py-6" aria-labelledby="education-list-title">
        <div className="rounded-3xl bg-secondary p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-card text-primary shadow-sm"><BookOpenCheck className="size-6" aria-hidden="true" /></span>
            <div><h2 id="education-list-title" className="text-lg font-bold">직원 교육 현황</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">직원을 선택하여 교육 이수 현황을 확인하세요.</p></div>
          </div>
        </div>

        {isLoading ? <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground" role="status"><LoaderCircle className="mx-auto mb-3 size-5 animate-spin" aria-hidden="true" />교육 현황을 불러오는 중입니다.</p> : null}
        {error ? <p className="rounded-2xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive" role="alert">교육 현황을 불러오지 못했습니다. 테이블 설정을 확인해 주세요.</p> : null}
        {!isLoading && !error && employees.length === 0 ? <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm leading-6 text-muted-foreground">등록된 직원 교육 현황이 없습니다.</p> : null}

        <div className="flex flex-col gap-3">
          {employees.map((employee) => {
            const courseCount = records.filter((record) => record.employee_number === employee.employee_number).length
            return <button key={employee.employee_number} type="button" onClick={() => setSelectedEmployeeNumber(employee.employee_number)} className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary"><UserRound className="size-6" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-base font-bold">{employee.employee_name}</span><span className="mt-1 block text-sm text-muted-foreground">{employee.employee_number} · {employee.department}</span><span className="mt-1 block text-xs text-muted-foreground">{employee.position} · 교육 {courseCount}과정</span></span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          })}
        </div>
      </section>
    </main>
  )
}
