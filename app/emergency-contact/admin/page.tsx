"use client"

import { ArrowLeft, LoaderCircle, LockKeyhole, Pencil, Phone, Plus, Save, Trash2, UserRound, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

const ADMIN_ID = "human"
const ADMIN_PASSWORD = "1024"

type EmergencyContact = {
  id: string
  vehicle_number: string
  driver_name: string
  phone_number: string
  created_at: string
}

type ContactForm = {
  vehicleNumber: string
  driverName: string
  phoneNumber: string
}

const EMPTY_FORM: ContactForm = {
  vehicleNumber: "",
  driverName: "",
  phoneNumber: "",
}

async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .schema("drivermgm")
    .from("human_gw_emercall")
    .select("id, vehicle_number, driver_name, phone_number, created_at")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export default function EmergencyContactAdminPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ id: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM)
  const [isSpecialNumber, setIsSpecialNumber] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const {
    data: contacts = [],
    error: contactsError,
    isLoading: isLoadingContacts,
    mutate,
  } = useSWR<EmergencyContact[]>(isAuthenticated ? "emergency-contacts-admin" : null, fetchEmergencyContacts)

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

    const vehicleNumber = form.vehicleNumber.trim().normalize("NFC")
    const driverName = form.driverName.trim().normalize("NFC")
    const phoneNumber = isSpecialNumber
      ? form.phoneNumber.trim().normalize("NFC")
      : formatPhoneNumber(form.phoneNumber)
    const isInvalidPhoneNumber = isSpecialNumber
      ? !phoneNumber.trim()
      : phoneNumber.replace(/\D/g, "").length < 10

    if (!vehicleNumber || !driverName || isInvalidPhoneNumber) {
      window.alert("차량번호, 성명과 올바른 연락처를 입력해 주세요.")
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()
      const contactValues = {
        vehicle_number: vehicleNumber,
        driver_name: driverName,
        phone_number: phoneNumber,
      }

      if (editingId) {
        const { data: updatedContact, error: updateError } = await supabase
          .schema("drivermgm")
          .from("human_gw_emercall")
          .update(contactValues)
          .eq("id", editingId)
          .select("id, vehicle_number, driver_name, phone_number, created_at")
          .single()

        if (updateError) throw updateError

        await mutate(
          (currentContacts = []) =>
            currentContacts.map((contact) => (contact.id === editingId ? updatedContact : contact)),
          { revalidate: false },
        )
        setEditingId(null)
        window.alert("연락처가 수정되었습니다.")
      } else {
        const { data: insertedContact, error: insertError } = await supabase
          .schema("drivermgm")
          .from("human_gw_emercall")
          .insert(contactValues)
          .select("id, vehicle_number, driver_name, phone_number, created_at")
          .single()

        if (insertError) throw insertError

        await mutate((currentContacts = []) => [insertedContact, ...currentContacts], { revalidate: false })
        window.alert("비상연락처가 등록되었습니다.")
      }

      setForm(EMPTY_FORM)
      setIsSpecialNumber(false)
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

  const handleEdit = (contact: EmergencyContact) => {
    const digitCount = contact.phone_number.replace(/\D/g, "").length
    const hasSpecialCharacters = /[^\d\s()+-]/.test(contact.phone_number)
    const shouldUseSpecialNumber = digitCount < 10 || hasSpecialCharacters

    setEditingId(contact.id)
    setIsSpecialNumber(shouldUseSpecialNumber)
    setForm({
      vehicleNumber: contact.vehicle_number,
      driverName: contact.driver_name,
      phoneNumber: shouldUseSpecialNumber ? contact.phone_number : formatPhoneNumber(contact.phone_number),
    })
    document.getElementById("contact-form-title")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setIsSpecialNumber(false)
    setForm(EMPTY_FORM)
  }

  const handleDelete = async (contact: EmergencyContact) => {
    if (!window.confirm(`${contact.driver_name}님의 연락처를 삭제하시겠습니까?`)) return

    setDeletingId(contact.id)

    try {
      const supabase = createClient()
      const { data: deletedRows, error: deleteError } = await supabase
        .schema("drivermgm")
        .from("human_gw_emercall")
        .delete()
        .eq("id", contact.id)
        .select("id")

      if (deleteError) throw deleteError
      if (!deletedRows?.length) throw new Error("삭제할 연락처를 찾지 못했습니다.")

      await mutate(
        (currentContacts = []) => currentContacts.filter((currentContact) => currentContact.id !== contact.id),
        { revalidate: false },
      )
      void mutate()
      window.alert("연락처가 삭제되었습니다.")
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
            <p className="text-sm leading-6 text-muted-foreground">비상연락망을 관리하려면 관리자 정보를 입력해 주세요.</p>
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
            <button type="button" onClick={() => router.push("/emergency-contact")} className="h-11 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
        <button type="button" onClick={() => router.push("/emergency-contact")} className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="비상연락망 목록으로 이동">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">비상연락망 관리</h1>
      </header>

      <section className="flex flex-col gap-6 px-4 py-6" aria-labelledby="contact-form-title">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">관리자 연락처함</p>
          <h2 id="contact-form-title" className="text-balance text-2xl font-bold tracking-tight">
            {editingId ? "연락처 수정" : "새 연락처 등록"}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {editingId ? "선택한 연락처 정보를 변경한 뒤 저장해 주세요." : "운전자와 차량 정보를 정확하게 입력해 주세요."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <label className="flex flex-col gap-2" htmlFor="vehicle-number">
            <span className="text-sm font-semibold">차량번호</span>
            <input id="vehicle-number" type="text" value={form.vehicleNumber} onChange={(event) => setForm((current) => ({ ...current, vehicleNumber: event.target.value }))} placeholder="예: 부산80바1234" className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" required />
          </label>

          <label className="flex flex-col gap-2" htmlFor="driver-name">
            <span className="text-sm font-semibold">성명</span>
            <input id="driver-name" type="text" value={form.driverName} onChange={(event) => setForm((current) => ({ ...current, driverName: event.target.value }))} placeholder="운전자 성명" className="h-12 rounded-xl border border-input bg-background px-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" required />
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold" htmlFor="phone-number">연락처</label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground" htmlFor="special-number">
                <input
                  id="special-number"
                  type="checkbox"
                  checked={isSpecialNumber}
                  onChange={(event) => {
                    const isChecked = event.target.checked
                    setIsSpecialNumber(isChecked)
                    if (!isChecked) {
                      setForm((current) => ({ ...current, phoneNumber: formatPhoneNumber(current.phoneNumber) }))
                    }
                  }}
                  className="size-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                특수번호
              </label>
            </div>
            <span className="relative block">
              <Phone className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="phone-number"
                type="tel"
                inputMode={isSpecialNumber ? "text" : "numeric"}
                autoComplete="tel"
                value={form.phoneNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phoneNumber: isSpecialNumber ? event.target.value : formatPhoneNumber(event.target.value),
                  }))
                }
                placeholder={isSpecialNumber ? "예: 1577-8278 또는 119" : "010-1234-5678"}
                maxLength={isSpecialNumber ? undefined : 13}
                className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </span>
          </div>

          <div className="flex gap-2">
            {editingId ? (
              <button type="button" onClick={handleCancelEdit} disabled={isSaving} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="size-5" aria-hidden="true" />
                취소
              </button>
            ) : null}
            <button type="submit" disabled={isSaving} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {isSaving ? (
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              ) : editingId ? (
                <Save className="size-5" aria-hidden="true" />
              ) : (
                <Plus className="size-5" aria-hidden="true" />
              )}
              {isSaving ? (editingId ? "저장 중..." : "등록 중...") : editingId ? "수정 저장" : "등록하기"}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-3" aria-labelledby="registered-contacts-title">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-primary">등록 현황</p>
              <h2 id="registered-contacts-title" className="text-xl font-bold tracking-tight">등록된 연락처</h2>
            </div>
            <span className="text-sm text-muted-foreground">총 {contacts.length}건</span>
          </div>

          {isLoadingContacts ? (
            <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground" role="status">연��처를 불러오는 중입니다.</p>
          ) : contactsError ? (
            <p className="rounded-xl bg-muted p-6 text-center text-sm text-destructive" role="alert">연락처 목록을 불러오지 못했습니다.</p>
          ) : contacts.length === 0 ? (
            <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">등록된 연락처가 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {contacts.map((contact, index) => {
                const isDeleting = deletingId === contact.id
                return (
                  <li key={contact.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted font-mono text-sm font-semibold text-muted-foreground">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold leading-6">{contact.driver_name} · {contact.vehicle_number}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone_number}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => handleEdit(contact)} disabled={isSaving || deletingId !== null} className="flex size-10 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${contact.driver_name} 연락처 수정`}>
                        <Pencil className="size-5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => void handleDelete(contact)} disabled={isSaving || deletingId !== null} className="flex size-10 items-center justify-center rounded-xl text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${contact.driver_name} 연락처 삭제`}>
                        {isDeleting ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Trash2 className="size-5" aria-hidden="true" />}
                      </button>
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
