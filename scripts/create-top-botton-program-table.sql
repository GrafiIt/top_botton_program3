-- all_use_programs 스키마 생성 (없는 경우)
CREATE SCHEMA IF NOT EXISTS all_use_programs;

-- all_use_programs.top_botton_program 테이블 생성 (notices 테이블과 동일한 구조)
CREATE TABLE IF NOT EXISTS all_use_programs.top_botton_program (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  images text[] DEFAULT '{}',
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE all_use_programs.top_botton_program ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "Allow public read" ON all_use_programs.top_botton_program
  FOR SELECT USING (true);

-- 인증된 사용자만 삽입/수정/삭제 (서비스 롤 키로 처리)
CREATE POLICY "Allow service role all" ON all_use_programs.top_botton_program
  FOR ALL USING (true) WITH CHECK (true);
