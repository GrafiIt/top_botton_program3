"use client"

import { ArrowLeft, BriefcaseBusiness, MapPin, Search, Settings, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import useSWR from "swr"
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

async function fetchBunkeringRecords(): Promise<BunkeringRecord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .schema("drivermgm")
    .from("human_gw_bunkering")
    .select("id, agent, barge_name, loading_point, port, manager_name, contact, task_details, created_at")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

function normalizeSearchValue(value: string) {
  return value.normalize("NFC").toLocaleLowerCase("ko-KR").replaceAll(" ", "")
}

export default function BunkeringPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: records = [], error, isLoading } = useSWR("bunkering-records", fetchBunkeringRecords)

  const filteredRecords = useMemo(() => {
    const normalizedTerm = normalizeSearchValue(searchTerm)
    if (!normalizedTerm) return records

    return records.filter((record) =>
      [record.agent, record.barge_name, record.loading_point, record.port, record.manager_name, record.contact, record.task_details]
        .some((value) => normalizeSearchValue(value).includes(normalizedTerm)),
    )
  }, [records, searchTerm])

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
      <header className="flex h-16 items-center justify-between border-b border-border px-4">
        <button type="button" onClick={() => router.push("/")} className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="메인 페이지로 돌아가기">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">벙커링 현황</h1>
        <button type="button" onClick={() => router.push("/bunkering/admin")} className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="벙커링 관리자 페이지로 이동">
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <section className="flex flex-col gap-5 px-4 py-6" aria-labelledby="bunkering-title">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">현장 운항 정보</p>
          <h2 id="bunkering-title" className="text-balance text-2xl font-bold tracking-tight">벙커링 현황을 확인하세요</h2>
          <p className="text-sm leading-6 text-muted-foreground">선박, 항구, 담당자 및 업무 내용으로 검색할 수 있습니다.</p>
        </div>

        <label className="relative block" htmlFor="bunkering-search">
          <span className="sr-only">벙커링 현황 검색</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input id="bunkering-search" type="search" inputMode="search" autoComplete="off" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="전체 항목 검색" className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>

        {isLoading ? <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground" role="status">벙커링 현황을 불러오는 중입니다.</p> : error ? <p className="rounded-2xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive" role="alert">벙커링 현황을 불러오지 못했습니다.</p> : filteredRecords.length === 0 ? <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">{searchTerm ? "검색 결과가 없습니다." : "등록된 벙커링 현황이 없습니다."}</p> : (
          <div className="flex flex-col gap-3" aria-live="polite">
            {filteredRecords.map((record, index) => (
              <article key={record.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">{index + 1}</span>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{record.barge_name || "선박명 미입력"}</h3>
                      <p className="truncate text-sm text-muted-foreground">{record.agent || "Bunkering Agent 미입력"}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{record.port || "Port 미입력"}</span>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="flex min-w-0 flex-col gap-1"><dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"><MapPin className="size-3.5" aria-hidden="true" />선적지</dt><dd className="break-words font-medium">{record.loading_point || "-"}</dd></div>
                  <div className="flex min-w-0 flex-col gap-1"><dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"><UserRound className="size-3.5" aria-hidden="true" />담당자</dt><dd className="break-words font-medium">{record.manager_name || "-"}</dd></div>
                  <div className="flex min-w-0 flex-col gap-1"><dt className="text-xs font-semibold text-muted-foreground">연락처</dt><dd className="break-words font-medium">{record.contact || "-"}</dd></div>
                  <div className="flex min-w-0 flex-col gap-1"><dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"><BriefcaseBusiness className="size-3.5" aria-hidden="true" />담당내역</dt><dd className="break-words font-medium">{record.task_details || "-"}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        )}
        {!isLoading && !error ? <p className="text-right text-sm text-muted-foreground">총 {filteredRecords.length}건</p> : null}
      </section>
    </main>
  )
}

