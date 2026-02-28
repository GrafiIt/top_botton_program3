"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react"

const PAGE_SIZE = 20
const PAGE_WINDOW = 4

interface Notice {
  id: string
  title: string
  created_at: string
}

export default function NoticesListPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data, error } = await supabase
          .schema("all_use_programs")
          .from("top_botton_program")
          .select("id, title, created_at")
        if (!error && Array.isArray(data)) {
          const sorted = [...data].sort((a, b) =>
            a.title.localeCompare(b.title, ["ko", "en"], { numeric: true, sensitivity: "base" })
          )
          setNotices(sorted)
        } else {
          setNotices([])
        }
      } catch {
        setNotices([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotices()
  }, [])

  const totalPages = Math.ceil(notices.length / PAGE_SIZE)
  const pagedNotices = notices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // 4개 페이지 번호 윈도우 계산
  const windowStart = Math.max(1, Math.min(currentPage - Math.floor(PAGE_WINDOW / 2), totalPages - PAGE_WINDOW + 1))
  const windowEnd = Math.min(totalPages, windowStart + PAGE_WINDOW - 1)
  const pageNumbers = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i)

  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 정보 없음"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "날짜 형식 오류"
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "날짜 형식 오류"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="홈으로 돌아가기">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">상하차지 목록</h1>
            <p className="text-muted-foreground mt-1">상하차지 제목 리스트</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">아직 등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border border rounded-lg overflow-hidden">
            {pagedNotices.map((notice, index) => (
              <li key={notice.id}>
                <Link
                  href={`/notices/${notice.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm text-muted-foreground w-6 shrink-0 text-right">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </span>
                    <span className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {notice.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-sm text-muted-foreground hidden sm:block">
                      {formatDate(notice.created_at)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* 페이지네이션 */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </Button>

            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className="min-w-[36px]"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="다음 페이지"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-4">
          총 {notices.length}개의 상하차지 ({currentPage} / {totalPages || 1} 페이지)
        </p>
      </div>
    </div>
  )
}
