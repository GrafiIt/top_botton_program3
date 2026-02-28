"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight } from "lucide-react"

interface Notice {
  id: string
  title: string
  created_at: string
}

export default function NoticesListPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data, error } = await supabase
          .schema("all_use_programs")
          .from("top_botton_program")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
        if (!error && Array.isArray(data)) {
          setNotices(data)
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
            <h1 className="text-3xl font-bold text-foreground">공지사항 목록</h1>
            <p className="text-muted-foreground mt-1">전체 공지 제목 리스트</p>
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
            {notices.map((notice, index) => (
              <li key={notice.id}>
                <Link
                  href={`/notices/${notice.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm text-muted-foreground w-6 shrink-0 text-right">
                      {index + 1}
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

        <p className="text-center text-sm text-muted-foreground mt-6">
          총 {notices.length}개의 공지사항
        </p>
      </div>
    </div>
  )
}
