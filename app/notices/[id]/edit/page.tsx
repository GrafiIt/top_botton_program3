"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, ArrowLeft, Save } from "lucide-react"

interface Notice {
  id: string
  title: string
  content: string
  images?: string[]
  attachments?: any[]
}

export default function EditNoticePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [password, setPassword] = useState(searchParams.get("password") || "")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchNotice()
    }
  }, [params.id])

  const fetchNotice = async () => {
    try {
      const response = await fetch(`/api/notices/${params.id}`)
      const data = await response.json()
      setNotice(data)
      setTitle(data.title)
      setContent(data.content)
      setImages(data.images || [])
      setAttachments(data.attachments || [])
    } catch {
      // silently handle fetch error
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", files[0])
      formData.append("adminPassword", password)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "업로드 실패")
        return
      }

      const data = await response.json()
      setImages([...images, data.url])
    } catch {
      alert("이미지 업로드 중 오류가 발생했습니다.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append("file", files[i])
        formData.append("adminPassword", password)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          alert(error.error || "업로드 실패")
          continue
        }

        const data = await response.json()
        setAttachments([...attachments, { name: files[i].name, url: data.url, path: data.path }])
      }
    } catch {
      alert("파일 업로드 중 오류가 발생했습니다.")
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      alert("관리자 비밀번호를 입력해주세요.")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/notices/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          images,
          attachments,
          adminPassword: password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "수정 실패")
        return
      }

      alert("공지사항이 수정되었습니다.")
      router.push(`/notices/${params.id}`)
    } catch {
      alert("수정 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in")
    alert("로그아웃되었습니다.")
    router.push("/notices")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">공지사항 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="password">관리자 비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="title">제목</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  required
                />
              </div>

              <div>
                <Label>이미지</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="mb-4"
                  />
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>첨부파일</Label>
                <div className="mt-2">
                  <Input type="file" multiple onChange={handleFileUpload} disabled={isUploading} className="mb-4" />
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm">{file.name}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving || isUploading} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? "저장 중..." : "수정 완료"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  취소
                </Button>
              </div>

              <div className="flex justify-center">
                <Button type="button" size="sm" variant="ghost" onClick={handleLogout} className="text-xs">
                  로그아웃
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
