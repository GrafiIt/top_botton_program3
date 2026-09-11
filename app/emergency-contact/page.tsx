"use client"

import { ArrowLeft, Search, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

type EmergencyContact = {
  id: string
  vehicle_number: string
  driver_name: string
  phone_number: string
  created_at: string
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

function normalizeSearchValue(value: string) {
  return value.normalize("NFC").toLocaleLowerCase("ko-KR").replaceAll("-", "").replaceAll(" ", "")
}

export default function EmergencyContactPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: contacts = [], error, isLoading } = useSWR(
    "emergency-contacts",
    fetchEmergencyContacts,
  )

  const filteredContacts = useMemo(() => {
    const normalizedTerm = normalizeSearchValue(searchTerm)
    if (!normalizedTerm) return contacts

    return contacts.filter((contact) =>
      [contact.vehicle_number, contact.driver_name, contact.phone_number].some((value) =>
        normalizeSearchValue(value).includes(normalizedTerm),
      ),
    )
  }, [contacts, searchTerm])

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
      <header className="flex h-16 items-center justify-between border-b border-border px-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="메인 페이지로 돌아가기"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">비상연락망</h1>
        <button
          type="button"
          onClick={() => router.push("/emergency-contact/admin")}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="비상연락망 관리자 페이지로 이동"
        >
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <section className="flex flex-col gap-5 px-4 py-6" aria-labelledby="contact-list-title">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">긴급 연락처</p>
          <h2 id="contact-list-title" className="text-balance text-2xl font-bold tracking-tight">
            운전자 비상연락망
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">차량번호, 성명 또는 연락처로 빠르게 찾을 수 있습니다.</p>
        </div>

        <label className="relative block" htmlFor="emergency-contact-search">
          <span className="sr-only">비상연락망 검색</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="emergency-contact-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="차량번호, 성명, 연락처 검색"
            className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="grid grid-cols-[2.75rem_1.15fr_0.8fr_1.25fr] items-center bg-primary px-2 py-3 text-center text-sm font-semibold text-primary-foreground">
            <span>순번</span>
            <span>차량번호</span>
            <span>성명</span>
            <span>연락처</span>
          </div>

          {isLoading ? (
            <p className="p-8 text-center text-sm text-muted-foreground" role="status">연락처를 불러오는 중입니다.</p>
          ) : error ? (
            <p className="p-8 text-center text-sm text-destructive" role="alert">연락처를 불러오지 못했습니다.</p>
          ) : filteredContacts.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              {searchTerm ? "검색 결과가 없습니다." : "등록된 비상연락망이 없습니다."}
            </p>
          ) : (
            <ol>
              {filteredContacts.map((contact, index) => (
                <li
                  key={contact.id}
                  className="grid min-h-14 grid-cols-[2.75rem_1.15fr_0.8fr_1.25fr] items-center border-t border-border px-2 py-2 text-center text-sm first:border-t-0"
                >
                  <span className="font-mono text-sm text-muted-foreground">{index + 1}</span>
                  <span className="break-words font-semibold">{contact.vehicle_number}</span>
                  <span className="break-words">{contact.driver_name}</span>
                  <a
                    href={`tel:${contact.phone_number.replace(/[^0-9+]/g, "")}`}
                    className="break-all text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`${contact.driver_name}에게 전화하기: ${contact.phone_number}`}
                  >
                    {contact.phone_number}
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>

        {!isLoading && !error ? (
          <p className="text-right text-sm text-muted-foreground" aria-live="polite">
            총 {filteredContacts.length}건
          </p>
        ) : null}
      </section>
    </main>
  )
}
