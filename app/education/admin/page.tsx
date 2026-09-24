"use client"

import {
  ArrowLeft,
  BookOpenCheck,
  ChevronRight,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Save,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import useSWR from "swr"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { createClient } from "@/utils/supabase/client"

type EducationStatus = "completed" | "incomplete" | "exempt"

type EducationRecord = {
  id: string
  employee_number: string
  employee_name: string
  department: string
  position: string
  verified_user: string | null
  course_code: string
  course_name: string
  course_order: number
  completed_date: string | null
  next_education_date: string | null
  status: EducationStatus
}

type EditingRecord = EducationRecord & {
  nextDateUndecided: boolean
}

type EmployeeForm = {
  employee_number: string
  employee_name: string
  department: string
  position: string
  verified_user?: string
}

type CourseForm = {
  course_code: string
  course_name: string
}

const emptyEmployeeForm: EmployeeForm = {
  employee_number: "",
  employee_name: "",
  department: "",
  position: "",
  verified_user: "",
}
const emptyCourseForm: CourseForm = {
  course_code: "",
  course_name: "",
}

const DEFAULT_COURSES = [
  { code: "DEFAULT-01", name: "JMP 교육" },
  { code: "DEFAULT-02", name: "LSR 교육" },
  { code: "DEFAULT-03", name: "개인 건강검진" },
  { code: "DEFAULT-04", name: "방어운전" },
  { code: "DEFAULT-05", name: "비상대응훈련" },
  { code: "DEFAULT-06", name: "운전자경력증명서" },
  { code: "DEFAULT-07", name: "운전적성정밀 자격유지 검사(고령운전자 대상)" },
  { code: "DEFAULT-08", name: "위험물운송자 교육" },
  { code: "DEFAULT-09", name: "탱크로리 이동탱크 일반점검표" },
  { code: "DEFAULT-10", name: "화물종사자 교육" },
]

async function fetchEducationRecords(): Promise<EducationRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .schema("drivermgm")
    .from("human_gw_education")
    .select(
      "id, employee_number, employee_name, department, position, verified_user, course_code, course_name, course_order, completed_date, next_education_date, status",
    )
    .order("employee_number", { ascending: true })
    .order("course_order", { ascending: true })

  if (error) throw error
  return (data ?? []) as EducationRecord[]
}

async function fetchVerifiedUsers(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .schema("all_use_programs")
    .from("saas_payment_customer_apps")
    .select("user_name")
    .eq("company_code", "human1004")
    .not("user_name", "is", null)
    .order("user_name", { ascending: true })

  if (error) throw error
  return Array.from(
    new Set(
      (data ?? [])
        .map((item: { user_name: string | null }) => item.user_name)
        .filter((userName: string | null): userName is string => Boolean(userName)),
    ),
  )
}

function toEditingRecord(record: EducationRecord): EditingRecord {
  return {
    ...record,
    nextDateUndecided: !record.next_education_date,
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: "text" | "password"
}) {
  return (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <span className="text-sm font-semibold">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        required
      />
    </label>
  )
}

export default function EducationAdminPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    isInitialized,
    credentials,
    loginError,
    setCredentials,
    login,
  } = useAdminAuth()
  const [selectedEmployeeNumber, setSelectedEmployeeNumber] = useState<string | null>(null)
  const [draftCourses, setDraftCourses] = useState<EditingRecord[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false)
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>(emptyEmployeeForm)
  const [editEmployeeForm, setEditEmployeeForm] = useState<EmployeeForm>(emptyEmployeeForm)
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourseForm)
  const [isMutating, setIsMutating] = useState(false)

  const {
    data: records = [],
    error,
    isLoading,
    mutate,
  } = useSWR<EducationRecord[]>(
    isAuthenticated ? "education-records-admin" : null,
    fetchEducationRecords,
  )
  const {
    data: verifiedUsers = [],
    error: verifiedUsersError,
    isLoading: isVerifiedUsersLoading,
  } = useSWR<string[]>(
    isAuthenticated ? "education-verified-users" : null,
    fetchVerifiedUsers,
  )

  const employees = useMemo(() => {
    const employeeMap = new Map<string, EducationRecord>()
    records.forEach((record) => {
      if (!employeeMap.has(record.employee_number)) {
        employeeMap.set(record.employee_number, record)
      }
    })
    return [...employeeMap.values()]
  }, [records])

  const selectedEmployee =
    employees.find((employee) => employee.employee_number === selectedEmployeeNumber) ?? null

  const selectEmployee = (employeeNumber: string) => {
    setSelectedEmployeeNumber(employeeNumber)
    setDraftCourses(
      records
        .filter((record) => record.employee_number === employeeNumber)
        .map(toEditingRecord),
    )
  }

  const updateDraft = (id: string, patch: Partial<EditingRecord>) => {
    setDraftCourses((courses) =>
      courses.map((course) => (course.id === id ? { ...course, ...patch } : course)),
    )
  }

  const markAll = (status: "completed" | "incomplete") => {
    const today = new Date().toISOString().slice(0, 10)
    setDraftCourses((courses) =>
      courses.map((course) => ({
        ...course,
        status,
        completed_date: status === "completed" ? course.completed_date ?? today : null,
      })),
    )
  }

  const cancelEditing = () => {
    if (!selectedEmployeeNumber) return
    setDraftCourses(
      records
        .filter((record) => record.employee_number === selectedEmployeeNumber)
        .map(toEditingRecord),
    )
  }

  const handleSave = async () => {
    if (!selectedEmployee) return

    setIsSaving(true)
    try {
      const supabase = createClient()
      const updates = await Promise.all(
        draftCourses.map(async (course) => {
          const { data, error: updateError } = await supabase
            .schema("drivermgm")
            .from("human_gw_education")
            .update({
              status: course.status,
              completed_date: course.completed_date || null,
              next_education_date: course.nextDateUndecided
                ? null
                : course.next_education_date || null,
            })
            .eq("id", course.id)
            .select(
              "id, employee_number, employee_name, department, position, verified_user, course_code, course_name, course_order, completed_date, next_education_date, status",
            )
            .single()

          if (updateError) throw updateError
          return data as EducationRecord
        }),
      )

      await mutate(
        (current = []) =>
          current.map(
            (record) => updates.find((update) => update.id === record.id) ?? record,
          ),
        { revalidate: false },
      )
      setDraftCourses(updates.map(toEditingRecord))
      await mutate()
      window.alert("교육 현황이 저장되었습니다.")
      setSelectedEmployeeNumber(null)
      setDraftCourses([])
    } catch (saveError) {
      window.alert(`저장하지 못했습니다. ${getErrorMessage(saveError)}`)
    } finally {
      setIsSaving(false)
    }
  }

  const openEditEmployeeDialog = () => {
    if (!selectedEmployee) return

    setEditEmployeeForm({
      employee_number: selectedEmployee.employee_number,
      employee_name: selectedEmployee.employee_name,
      department: selectedEmployee.department,
      position: selectedEmployee.position,
      verified_user: selectedEmployee.verified_user ?? "",
    })
    setIsEditEmployeeDialogOpen(true)
  }

  const handleUpdateEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedEmployee) return

    setIsMutating(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .schema("drivermgm")
        .from("human_gw_education")
        .update({
          employee_number: editEmployeeForm.employee_number,
          employee_name: editEmployeeForm.employee_name,
          department: editEmployeeForm.department,
          position: editEmployeeForm.position,
          verified_user: editEmployeeForm.verified_user || null,
        })
        .eq("employee_number", selectedEmployee.employee_number)

      if (updateError) throw updateError

      setSelectedEmployeeNumber(editEmployeeForm.employee_number)
      setIsEditEmployeeDialogOpen(false)
      await mutate()
      window.alert("근로자 정보가 수정되었습니다.")
    } catch (updateError) {
      window.alert(`근로자 정보를 수정하지 못했습니다. ${getErrorMessage(updateError)}`)
    } finally {
      setIsMutating(false)
    }
  }

  const handleAddEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsMutating(true)

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .schema("drivermgm")
        .from("human_gw_education")
        .insert(
          DEFAULT_COURSES.map((course, index) => ({
            employee_number: employeeForm.employee_number,
            employee_name: employeeForm.employee_name,
            department: employeeForm.department,
            position: employeeForm.position,
            verified_user: employeeForm.verified_user || null,
            course_code: course.code,
            course_name: course.name,
            course_order: index,
            status: "incomplete" as const,
            completed_date: null,
            next_education_date: null,
          })),
        )

      if (insertError) throw insertError

      setEmployeeForm(emptyEmployeeForm)
      setIsEmployeeDialogOpen(false)
      await mutate()
      window.alert("근로자가 등록되었습니다.")
    } catch (insertError) {
      window.alert(`근로자를 추가하지 못했습니다. ${getErrorMessage(insertError)}`)
    } finally {
      setIsMutating(false)
    }
  }

  const handleAddCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedEmployee) return

    setIsMutating(true)
    try {
      const supabase = createClient()
      const courseOrder =
        draftCourses.reduce(
          (highestOrder, course) => Math.max(highestOrder, course.course_order),
          -1,
        ) + 1
      const { error: insertError } = await supabase
        .schema("drivermgm")
        .from("human_gw_education")
        .insert({
          employee_number: selectedEmployee.employee_number,
          employee_name: selectedEmployee.employee_name,
          department: selectedEmployee.department,
          position: selectedEmployee.position,
          verified_user: selectedEmployee.verified_user,
          course_code: courseForm.course_code,
          course_name: courseForm.course_name,
          course_order: courseOrder,
          status: "incomplete",
          completed_date: null,
          next_education_date: null,
        })

      if (insertError) throw insertError

      setCourseForm(emptyCourseForm)
      setIsCourseDialogOpen(false)
      await mutate()
      window.alert("새 교육 과정이 추가되었습니다.")
    } catch (insertError) {
      window.alert(`교육 과정을 추가하지 못했습니다. ${getErrorMessage(insertError)}`)
    } finally {
      setIsMutating(false)
    }
  }

  const handleDeleteEmployee = async () => {
    if (
      !selectedEmployee ||
      !window.confirm(
        `${selectedEmployee.employee_name} 근로자의 모든 교육 기록을 삭제하시겠습니까?`,
      )
    ) {
      return
    }

    setIsMutating(true)
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .schema("drivermgm")
        .from("human_gw_education")
        .delete()
        .eq("employee_number", selectedEmployee.employee_number)

      if (deleteError) throw deleteError

      setSelectedEmployeeNumber(null)
      setDraftCourses([])
      await mutate()
      window.alert("근로자와 모든 교육 기록이 삭제되었습니다.")
    } catch (deleteError) {
      window.alert(`근로자를 삭제하지 못했습니다. ${getErrorMessage(deleteError)}`)
    } finally {
      setIsMutating(false)
    }
  }

  const handleDeleteCourse = async (course: EditingRecord) => {
    if (!window.confirm(`${course.course_name} 교육 과정을 삭제하시겠습니까?`)) return

    setIsMutating(true)
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .schema("drivermgm")
        .from("human_gw_education")
        .delete()
        .eq("id", course.id)

      if (deleteError) throw deleteError

      setDraftCourses((courses) => courses.filter((item) => item.id !== course.id))
      await mutate()
      window.alert("교육 과정이 삭제되었습니다.")
    } catch (deleteError) {
      window.alert(`교육 과정을 삭제하지 못했습니다. ${getErrorMessage(deleteError)}`)
    } finally {
      setIsMutating(false)
    }
  }

  if (!isInitialized) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8" aria-busy="true">
        <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">관리자 인증 상태를 확인하는 중입니다.</span>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
        <section
          className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-lg"
          aria-labelledby="admin-login-title"
        >
          <div className="flex flex-col gap-2 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <LockKeyhole className="size-6" aria-hidden="true" />
            </span>
            <h1 id="admin-login-title" className="text-2xl font-bold tracking-tight">
              교육 현황 관리자
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              교육 정보를 수정하려면 관리자 인증이 필요합니다.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              login()
            }}
            className="mt-6 flex flex-col gap-4"
          >
            <TextField
              id="admin-id"
              label="아이디"
              value={credentials.id}
              onChange={(id) => setCredentials((current) => ({ ...current, id }))}
              placeholder="관리자 아이디"
            />
            <TextField
              id="admin-password"
              label="비밀번호"
              type="password"
              value={credentials.password}
              onChange={(password) =>
                setCredentials((current) => ({ ...current, password }))
              }
              placeholder="관리자 비밀번호"
            />
            {loginError ? (
              <p className="text-sm text-destructive" role="alert">
                {loginError}
              </p>
            ) : null}
            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LockKeyhole className="size-4" aria-hidden="true" />
              로그인
            </button>
            <button
              type="button"
              onClick={() => router.push("/education")}
              className="h-11 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              사용자 화면으로 돌아가기
            </button>
          </form>
        </section>
      </main>
    )
  }

  if (selectedEmployee) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => {
              setSelectedEmployeeNumber(null)
              setDraftCourses([])
            }}
            className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="직원 목록으로 돌아가기"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="text-base font-bold">교육 현황 수정</h1>
          <button
            type="button"
            onClick={handleDeleteEmployee}
            disabled={isMutating}
            className="text-sm font-bold text-destructive disabled:opacity-50"
          >
            근로자 삭제
          </button>
        </header>

        <section className="flex flex-col gap-5 px-4 py-6">
          <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15">
                  <UserRound className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-bold">{selectedEmployee.employee_name}</h2>
                  <p className="mt-1 text-sm text-primary-foreground/75">
                    {selectedEmployee.employee_number} · {selectedEmployee.department} ·{" "}
                    {selectedEmployee.position}
                  </p>
                  {selectedEmployee.verified_user ? (
                    <p className="mt-1 text-sm text-primary-foreground/75">
                      확인사용자: {selectedEmployee.verified_user}
                    </p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={openEditEmployeeDialog}
                disabled={isMutating}
                className="text-sm font-semibold text-primary-foreground/80 hover:text-primary-foreground disabled:opacity-50"
              >
                편집
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => markAll("completed")}
              className="h-11 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              모두 완료
            </button>
            <button
              type="button"
              onClick={() => markAll("incomplete")}
              className="h-11 rounded-xl border border-border bg-card text-sm font-bold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              모두 미완료
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {draftCourses.map((course) => (
              <article key={course.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{course.course_name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{course.course_code}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(course)}
                    disabled={isMutating}
                    className="flex size-9 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    aria-label={`${course.course_name} 교육 과정 삭제`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {(["completed", "incomplete", "exempt"] as EducationStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        updateDraft(course.id, {
                          status,
                          completed_date:
                            status === "completed"
                              ? course.completed_date ?? new Date().toISOString().slice(0, 10)
                              : null,
                        })
                      }
                      className={`h-10 rounded-lg text-xs font-bold transition-colors ${
                        course.status === status
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {status === "completed" ? "완료" : status === "incomplete" ? "미완료" : "면제"}
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2" htmlFor={`completed-${course.id}`}>
                    <span className="text-xs font-semibold text-muted-foreground">완료일</span>
                    <input
                      id={`completed-${course.id}`}
                      type="date"
                      value={course.completed_date ?? ""}
                      onChange={(event) => updateDraft(course.id, { completed_date: event.target.value })}
                      disabled={course.status !== "completed"}
                      className="h-10 rounded-lg border border-input bg-background px-2 text-xs disabled:opacity-50"
                    />
                  </label>
                  <label className="flex flex-col gap-2" htmlFor={`next-date-${course.id}`}>
                    <span className="text-xs font-semibold text-muted-foreground">다음 교육일</span>
                    <input
                      id={`next-date-${course.id}`}
                      type="date"
                      value={course.next_education_date ?? ""}
                      onChange={(event) =>
                        updateDraft(course.id, {
                          next_education_date: event.target.value,
                          nextDateUndecided: false,
                        })
                      }
                      disabled={course.nextDateUndecided}
                      className="h-10 rounded-lg border border-input bg-background px-2 text-xs disabled:opacity-50"
                    />
                  </label>
                </div>
                <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={course.nextDateUndecided}
                    onChange={(event) =>
                      updateDraft(course.id, {
                        nextDateUndecided: event.target.checked,
                        next_education_date: event.target.checked
                          ? null
                          : course.next_education_date,
                      })
                    }
                    className="size-4 accent-primary"
                  />
                  다음 교육일 미정
                </label>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCourseDialogOpen(true)}
            disabled={isMutating}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 text-sm font-bold text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden="true" />
            교육 과정 추가
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={isSaving || isMutating}
              className="h-12 rounded-xl border border-border bg-card text-sm font-bold hover:bg-muted disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isMutating}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              저장
            </button>
          </div>
        </section>

        <Dialog
          open={isEditEmployeeDialogOpen}
          onOpenChange={(open) => {
            setIsEditEmployeeDialogOpen(open)
            if (!open) setEditEmployeeForm(emptyEmployeeForm)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>근로자 정보 수정</DialogTitle>
              <DialogDescription>선택한 근로자의 기본 정보를 수정합니다.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateEmployee} className="flex flex-col gap-4">
              <TextField
                id="edit-employee-number"
                label="사번"
                value={editEmployeeForm.employee_number}
                onChange={(employee_number) =>
                  setEditEmployeeForm((current) => ({ ...current, employee_number }))
                }
                placeholder="예: EMP001"
              />
              <TextField
                id="edit-employee-name"
                label="성명"
                value={editEmployeeForm.employee_name}
                onChange={(employee_name) =>
                  setEditEmployeeForm((current) => ({ ...current, employee_name }))
                }
                placeholder="근로자 성명"
              />
              <TextField
                id="edit-employee-department"
                label="부서"
                value={editEmployeeForm.department}
                onChange={(department) =>
                  setEditEmployeeForm((current) => ({ ...current, department }))
                }
                placeholder="소속 부서"
              />
              <TextField
                id="edit-employee-position"
                label="직급"
                value={editEmployeeForm.position}
                onChange={(position) =>
                  setEditEmployeeForm((current) => ({ ...current, position }))
                }
                placeholder="직급 또는 직책"
              />
              <label className="flex flex-col gap-2" htmlFor="edit-verified-user">
                <span className="text-sm font-semibold">확인사용자 (선택)</span>
                <select
                  id="edit-verified-user"
                  value={editEmployeeForm.verified_user ?? ""}
                  onChange={(event) =>
                    setEditEmployeeForm((current) => ({
                      ...current,
                      verified_user: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">선택 안 함</option>
                  {verifiedUsers.map((userName) => (
                    <option key={userName} value={userName}>
                      {userName}
                    </option>
                  ))}
                </select>
                {isVerifiedUsersLoading ? (
                  <span className="text-xs text-muted-foreground">확인사용자 목록을 불러오는 중입니다.</span>
                ) : null}
                {verifiedUsersError ? (
                  <span className="text-xs text-destructive">확인사용자 목록을 불러오지 못했습니다. 선택 없이 수정할 수 있습니다.</span>
                ) : null}
              </label>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsEditEmployeeDialogOpen(false)}
                  disabled={isMutating}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-semibold disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
                >
                  {isMutating ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
                  수정 완료
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>교육 과정 추가</DialogTitle>
              <DialogDescription>선택한 근로자에게 새 교육 과정을 추가합니다.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourse} className="flex flex-col gap-4">
              <TextField
                id="course-code"
                label="교육코드"
                value={courseForm.course_code}
                onChange={(course_code) => setCourseForm((current) => ({ ...current, course_code }))}
                placeholder="예: SAFE-001"
              />
              <TextField
                id="course-name"
                label="교육명"
                value={courseForm.course_name}
                onChange={(course_name) => setCourseForm((current) => ({ ...current, course_name }))}
                placeholder="교육 과정 이름"
              />
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsCourseDialogOpen(false)}
                  className="h-10 rounded-lg border border-border px-4 text-sm font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
                >
                  {isMutating ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
                  추가
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push("/education")}
          className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="사용자 교육 현황으로 돌아가기"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-base font-bold">교육 현황 관리자</h1>
        <span className="size-10" aria-hidden="true" />
      </header>

      <section className="flex flex-col gap-5 px-4 py-6" aria-labelledby="admin-education-title">
        <div className="rounded-3xl bg-secondary p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
              <BookOpenCheck className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h2 id="admin-education-title" className="text-lg font-bold">
                직원 교육 현황 수정
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                직원을 선택하여 교육 정보를 수정하세요.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEmployeeDialogOpen(true)}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          근로자 추가
        </button>

        {isLoading ? (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground" role="status">
            <LoaderCircle className="mx-auto mb-3 size-5 animate-spin" aria-hidden="true" />
            교육 현황을 불러오는 중입니다.
          </p>
        ) : null}
        {error ? (
          <p className="rounded-2xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive" role="alert">
            교육 현황을 불러오지 못했습니다.
          </p>
        ) : null}
        {!isLoading && !error && employees.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            등록된 직원 교육 현황이 없습니다.
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {employees.map((employee) => (
            <button
              key={employee.employee_number}
              type="button"
              onClick={() => selectEmployee(employee.employee_number)}
              className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                <UserRound className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{employee.employee_name}</span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {employee.employee_number} · {employee.department} · {employee.position}
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <Dialog
        open={isEmployeeDialogOpen}
        onOpenChange={(open) => {
          setIsEmployeeDialogOpen(open)
          if (!open) setEmployeeForm(emptyEmployeeForm)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>근로자 추가</DialogTitle>
            <DialogDescription>
              기본 정보를 등록하면 교육 과정 없이 새 근로자가 생성됩니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="flex flex-col gap-4">
            <TextField
              id="employee-number"
              label="사번"
              value={employeeForm.employee_number}
              onChange={(employee_number) =>
                setEmployeeForm((current) => ({ ...current, employee_number }))
              }
              placeholder="예: EMP001"
            />
            <TextField
              id="employee-name"
              label="성명"
              value={employeeForm.employee_name}
              onChange={(employee_name) =>
                setEmployeeForm((current) => ({ ...current, employee_name }))
              }
              placeholder="근로자 성명"
            />
            <TextField
              id="employee-department"
              label="부서"
              value={employeeForm.department}
              onChange={(department) =>
                setEmployeeForm((current) => ({ ...current, department }))
              }
              placeholder="소속 부서"
            />
            <TextField
              id="employee-position"
              label="직급"
              value={employeeForm.position}
              onChange={(position) =>
                setEmployeeForm((current) => ({ ...current, position }))
              }
              placeholder="직급 또는 직책"
            />
            <label className="flex flex-col gap-2" htmlFor="verified-user">
              <span className="text-sm font-semibold">확인사용자 (선택)</span>
              <select
                id="verified-user"
                value={employeeForm.verified_user ?? ""}
                onChange={(event) =>
                  setEmployeeForm((current) => ({
                    ...current,
                    verified_user: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">선택 안 함</option>
                {verifiedUsers.map((userName) => (
                  <option key={userName} value={userName}>
                    {userName}
                  </option>
                ))}
              </select>
              {isVerifiedUsersLoading ? (
                <span className="text-xs text-muted-foreground">확인사용자 목록을 불러오는 중입니다.</span>
              ) : null}
              {verifiedUsersError ? (
                <span className="text-xs text-destructive">확인사용자 목록을 불러오지 못했습니다. 선택 없이 등록할 수 있습니다.</span>
              ) : null}
            </label>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsEmployeeDialogOpen(false)}
                className="h-10 rounded-lg border border-border px-4 text-sm font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isMutating}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {isMutating ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
                등록
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
