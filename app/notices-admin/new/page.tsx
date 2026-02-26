"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, ArrowLeft, Save } from "lucide-react"

const PAGE_VERSION = "v2024-01-19-ADMIN"

export default function NewNoticePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in")
    if (!isLoggedIn) {
      router.push("/notices-admin/login")
    }
  }, [router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append("file", files[i])
        formData.append("adminPassword", "ener1004@")

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          alert(`${files[i].name} 업로드 실패: ${error.error || "알 수 없는 오류"}`)
          continue
        }

        const data = await response.json()
        setImages((prev) => [...prev, data.url])
      }
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
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
        formData.append("adminPassword", "ener1004@")

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          alert(`${files[i].name} 업로드 실패: ${error.error || "알 수 없는 오류"}`)
          continue
        }

        const data = await response.json()
        setAttachments((prev) => [...prev, { name: files[i].name, url: data.url, path: data.path }])
      }
    } catch (error) {
      console.error("[v0] Error uploading file:", error)
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

    setIsSaving(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error } = await supabase
        .schema("all_use_programs")
        .from("top_botton_program")
        .insert({ title, content, images: images || [], attachments: attachments || [] })

      if (error) {
        alert("저장 실패: " + error.message)
        return
      }

      alert("공지사항이 등록되었습니다.")
      router.push("/")
    } catch (error: any) {
      alert("공지사항 등록 중 오류가 발생했습니다: " + error?.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in")
    alert("로그아웃되었습니다.")
    router.push("/notices")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-xs text-muted-foreground mb-2 text-right">Version: {PAGE_VERSION}</div>

        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">새 공지사항 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="공지사항 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="공지사항 내용을 입력하세요"
                  rows={60}
                  required
                  className="min-h-[600px]"
                />
              </div>

              <div>
                <Label>이미지 추가</Label>
                <p className="text-sm text-muted-foreground mb-2">첨부된 이미지는 본문 첫머리에 표시됩니다</p>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
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
                <p className="text-sm text-muted-foreground mb-2">첨부파일은 다운로드할 수 있습니다</p>
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
                  {isSaving ? "저장 중..." : "저장하기"}
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
