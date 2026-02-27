"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowLeft, Download } from "lucide-react"
import { NoticeAdminPanel } from "@/components/notice-admin-panel"
import { createClient } from "@/lib/supabase/client"

interface Notice {
  id: string
  title: string
  content: string
  created_at: string
  images?: string[]
  attachments?: any[]
}

export default function NoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [notice, setNotice] = useState<Notice | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id || id === "new") return
    const fetchNotice = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("top_botton_program")
        .select("*")
        .eq("id", id)
        .single()
      if (error || !data) {
        router.push("/")
      } else {
        setNotice(data)
      }
      setIsLoading(false)
    }
    fetchNotice()
  }, [id, router])

  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 정보 없음"
    try {
      const date = new Date(dateString.replace(" ", "T"))
      if (isNaN(date.getTime())) return "날짜 형식 오류"
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "날짜 형식 오류"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  if (!notice) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              목록으로
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <CardTitle className="text-3xl">{notice.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(notice.created_at)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {notice.images && notice.images.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {notice.images.map((img, index) => (
                  <img key={index} src={img} alt={`Image ${index + 1}`} className="w-full rounded-lg" />
                ))}
              </div>
            )}

            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-lg leading-relaxed">{notice.content}</p>
            </div>

            {notice.attachments && notice.attachments.length > 0 && (
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">첨부파일</h3>
                <div className="space-y-2">
                  {notice.attachments.map((file: any, index: number) => (
                    <a
                      key={index}
                      href={file.url}
                      download={file.name}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <span className="text-sm font-medium">{file.name}</span>
                      <Download className="w-5 h-5 text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t">
              <NoticeAdminPanel noticeId={id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
