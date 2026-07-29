"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextAlign } from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Heading } from "@tiptap/extension-heading"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
} from "lucide-react"

const TEXT_COLORS = [
  { label: "기본", value: "#000000" },
  { label: "빨강", value: "#ef4444" },
  { label: "주황", value: "#f97316" },
  { label: "노랑", value: "#eab308" },
  { label: "초록", value: "#22c55e" },
  { label: "파랑", value: "#3b82f6" },
  { label: "남색", value: "#6366f1" },
  { label: "보라", value: "#a855f7" },
  { label: "회색", value: "#6b7280" },
]

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요",
  className,
  minHeight = "300px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Heading extension을 별도로 사용하므로 비활성화
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-4 py-3",
        style: `min-height: ${minHeight}`,
      },
    },
  })

  // 외부에서 value가 변경될 때 (예: 수정 페이지에서 DB 데이터 로드 시) 에디터 내용 동기화
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    isActive,
    title,
    children,
  }: {
    onClick: () => void
    isActive?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "p-1.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors",
        isActive && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </button>
  )

  return (
    <div className={cn("border border-input rounded-lg overflow-hidden bg-background", className)}>
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-input bg-muted/40">
        {/* 단락/제목 */}
        <ToolbarButton
          title="본문"
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive("paragraph")}
        >
          <Pilcrow className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="제목 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="제목 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="제목 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* 글자 스타일 */}
        <ToolbarButton
          title="굵게 (Bold)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="기울임 (Italic)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* 정렬 */}
        <ToolbarButton
          title="왼쪽 정렬"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="가운데 정렬"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="오른쪽 정렬"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* 글자 색상 */}
        <div className="flex items-center gap-0.5">
          {TEXT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              title={`글자 색상: ${color.label}`}
              onClick={() => editor.chain().focus().setColor(color.value).run()}
              className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>
      </div>

      {/* 에디터 본문 */}
      <EditorContent
        editor={editor}
        className="[&_.ProseMirror]:min-h-[300px] [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_p.is-empty::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-empty::before]:text-muted-foreground [&_.ProseMirror_p.is-empty::before]:pointer-events-none [&_.ProseMirror_p.is-empty::before]:float-left"
      />
    </div>
  )
}
