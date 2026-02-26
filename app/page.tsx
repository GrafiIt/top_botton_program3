"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Calendar, Eye } from "lucide-react"

interface Notice {
  id: string
  title: string
  content: string
  created_at: string
  images?: string[]
  attachments?: any[]
}

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const adminLoggedIn = sessionStorage.getItem("admin_logged_in")
    setIsAdmin(adminLoggedIn === "true")
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const response = await fetch("/api/notices")
      const data = await response.json()
      if (Array.isArray(data)) {
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

  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in")
    setIsAdmin(false)
    alert("로그아웃되었습니다.")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">공지사항</h1>
            <p className="text-muted-foreground mt-2">에너플레이트의 최신 소식을 확인하세요</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Link href="/notices-admin/login">
              <Button size="lg" className="gap-2">
                <PlusCircle className="w-5 h-5" />새 공지 작성
              </Button>
            </Link>
            {isAdmin && (
              <Button size="sm" variant="ghost" onClick={handleLogout} className="text-xs">
                로그아웃
              </Button>
            )}
          </div>
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
        ) : (
          <div className="grid gap-6">
            {notices.map((notice) => (
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
                    {notice.content.substring(0, 200)}
                    {notice.content.length > 200 && "..."}
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
        )}
      </div>
    </div>
  )
}
