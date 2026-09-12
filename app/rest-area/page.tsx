"use client"

import { ArrowLeft, MapPin, Search, Settings, ShowerHead, Waves } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/utils/supabase/client"

type RestArea = {
  id: string
  name: string
  address: string
  has_shower: boolean
  has_sleep: boolean
  created_at: string
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

function normalizeSearchValue(value: string) {
  return value.normalize("NFC").toLocaleLowerCase("ko-KR").replaceAll(" ", "")
}

export default function RestAreaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: restAreas = [], error, isLoading } = useSWR("rest-areas", fetchRestAreas)

  const filteredRestAreas = useMemo(() => {
    const normalizedTerm = normalizeSearchValue(searchTerm)
    if (!normalizedTerm) return restAreas

    return restAreas.filter((restArea) =>
      normalizeSearchValue(restArea.name).includes(normalizedTerm),
    )
  }, [restAreas, searchTerm])

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
        <h1 className="text-lg font-bold tracking-tight">휴게소 정보</h1>
        <button
          type="button"
          onClick={() => router.push("/rest-area/admin")}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="휴게소 관리자 페이지로 이동"
        >
          <Settings className="size-5" aria-hidden="true" />
        </button>
      </header>

      <section className="flex flex-col gap-5 px-4 py-6" aria-labelledby="rest-area-list-title">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary">운행 편의 정보</p>
          <h2 id="rest-area-list-title" className="text-balance text-2xl font-bold tracking-tight">
            가까운 휴게소 찾기
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            휴게소 이름을 검색하고 편의시설을 확인하세요.
          </p>
        </div>

        <label className="relative block" htmlFor="rest-area-search">
          <span className="sr-only">휴게소명 검색</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="rest-area-search"
            type="search"
            inputMode="search"
            autoComplete="off"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="휴게소명 검색"
            className="h-12 w-full rounded-xl border border-input bg-card pl-12 pr-4 text-base outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        {isLoading ? (
          <p className="rounded-2xl bg-muted p-8 text-center text-sm text-muted-foreground" role="status">
            휴게소 정보를 불러오는 중입니다.
          </p>
        ) : error ? (
          <p className="rounded-2xl bg-muted p-8 text-center text-sm text-destructive" role="alert">
            휴게소 정보를 불러오지 못했습니다.
          </p>
        ) : filteredRestAreas.length === 0 ? (
          <p className="rounded-2xl bg-muted p-8 text-center text-sm text-muted-foreground">
            {searchTerm ? "검색 결과가 없습니다." : "등록된 휴게소가 없습니다."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredRestAreas.map((restArea) => (
              <li key={restArea.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <MapPin className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-pretty text-lg font-bold leading-6">{restArea.name}</h3>
                    <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{restArea.address}</p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-3">
                    <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ShowerHead className="size-4" aria-hidden="true" />
                      샤워실
                    </dt>
                    <dd className="font-mono text-sm font-bold text-foreground">{restArea.has_shower ? "O" : "X"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-3">
                    <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Waves className="size-4" aria-hidden="true" />
                      수면실
                    </dt>
                    <dd className="font-mono text-sm font-bold text-foreground">{restArea.has_sleep ? "O" : "X"}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !error ? (
          <p className="text-right text-sm text-muted-foreground" aria-live="polite">
            총 {filteredRestAreas.length}곳
          </p>
        ) : null}
      </section>
    </main>
  )
}
