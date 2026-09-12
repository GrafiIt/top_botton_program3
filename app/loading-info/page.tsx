"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PlusCircle, Calendar, Eye, List, Search, X } from "lucide-react"

interface Notice {
  id: string
  title: string
  content: string
  created_at: string
  images?: string[]
  attachments?: any[]
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, "")   // HTML 태그 제거
    .replace(/&nbsp;/g, " ")     // HTML 엔티티 → 공백
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n/g, " ")         // 과거 데이터의 \n 줄바꿈 → 공백
    .replace(/\s+/g, " ")        // 연속 공백 정리
    .trim()
}

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const adminLoggedIn = sessionStorage.getItem("admin_logged_in")
    setIsAdmin(adminLoggedIn === "true")
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data, error } = await supabase
        .schema("all_use_programs")
        .from("top_botton_program")
        .select("*")
        .order("created_at", { ascending: false })
      if (!error && Array.isArray(data)) {
        setNotices(data)
      } else {
        setNotices([])
      }
    } catch (error) {
      setNotices([])
    } finally {
      setIsLoading(false)
    }
  }

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

  const filteredNotices = notices.filter((notice) =>
    notice.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in")
    setIsAdmin(false)
    alert("로그아웃되었습니다.")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 md:py-12 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">상하차지정보</h1>
            <p className="mt-2 text-muted-foreground">상하차지 최신 소식을 확인하세요</p>
          </div>
          <div className="flex w-full flex-col items-start gap-2 md:w-auto md:items-end">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap md:w-auto">
              <Link href="/notices/list" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full gap-2 sm:w-auto">
                  <List className="w-5 h-5" />리스트 보기
                </Button>
              </Link>
              <Link href="/notices-admin/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  <PlusCircle className="w-5 h-5" />새 공지 작성
                </Button>
              </Link>
            </div>
            {isAdmin && (
              <Button size="sm" variant="ghost" onClick={handleLogout} className="text-xs">
                로그아웃
              </Button>
            )}
          </div>
        </div>

        {/* 검색 바 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="제목으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12 text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="검색어 지우기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : notices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">아직 등록된 공지사항이 없습니다.</p>
            </CardContent>
          </Card>
        ) : filteredNotices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">&ldquo;{searchQuery}&rdquo;</span> 에 해당하는 공지사항이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">&ldquo;{searchQuery}&rdquo;</span> 검색 결과 {filteredNotices.length}건
              </p>
            )}
          <div className="grid gap-6">
            {filteredNotices.map((notice) => (
              <Card key={notice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Link href={`/notices/${notice.id}`}>
                    <CardTitle className="text-2xl hover:text-primary transition-colors cursor-pointer">
                      {notice.title}
                    </CardTitle>
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(notice.created_at)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">
                    {stripHtml(notice.content ?? "").substring(0, 200)}
                    {stripHtml(notice.content ?? "").length > 200 && "..."}
                  </p>
                  <Link href={`/notices/${notice.id}`}>
                    <Button variant="ghost" className="mt-4 gap-2">
                      <Eye className="w-4 h-4" />
                      자세히 보기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  )
}
