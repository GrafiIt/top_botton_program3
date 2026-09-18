"use client"

import { ArrowLeft, MapPin, Search, Settings, Ship } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

type ShipOilRecord = {
  id: string
  agent: string
  pier_name: string
  address: string
  created_at: string
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

export default function ShipOilPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: records = [], error, isLoading } = useSWR(
    "ship-oil-records",
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

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background text-foreground shadow-sm">
      <header className="sticky top-0 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="메인 페이지로 돌아가기"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">선박유 도착지 정보</h1>
        <button
          type="button"
          onClick={() => router.push("/ship-oil/admin")}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="선박유 도착지 관리자 페이지로 이동"
        >
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <section className="flex flex-col gap-5 px-4 py-6" aria-labelledby="ship-oil-heading">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">PORT DIRECTORY</p>
          <h2 id="ship-oil-heading" className="text-balance text-2xl font-bold tracking-tight">
            도착지 부두를 빠르게 확인하세요
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Agent 또는 도착지 부두명으로 검색할 수 있습니다.
          </p>
        </div>

        <label className="relative block" htmlFor="ship-oil-search">
          <span className="sr-only">Agent 또는 도착지 부두명 검색</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="ship-oil-search"
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
            도착지 정보를 불러오는 중입니다.
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
              <article
                key={record.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3 border-b border-border pb-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agent</p>
                    <h3 className="truncate text-base font-bold">{record.agent}</h3>
                  </div>
                </div>

                <dl className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      <Ship className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-muted-foreground">도착지 부두명</dt>
                      <dd className="break-words font-semibold leading-6">{record.pier_name}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      <MapPin className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold text-muted-foreground">상세 주소</dt>
                      <dd className="break-words text-sm leading-6">{record.address}</dd>
                    </div>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}

        {!isLoading && !error ? (
          <p className="text-right text-sm text-muted-foreground">총 {filteredRecords.length}건</p>
        ) : null}
      </section>
    </main>
  )
}
