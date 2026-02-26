-- 공지사항 테이블 생성
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 공지사항은 모든 사용자가 읽을 수 있지만, 관리자만 수정/삭제 가능
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 공지사항 조회 가능
CREATE POLICY "notices_select_all"
  ON public.notices FOR SELECT
  USING (true);

-- 관리자만 공지사항 작성 가능 (RLS는 활성화하지만 실제 권한은 API에서 체크)
CREATE POLICY "notices_insert_admin"
  ON public.notices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "notices_update_admin"
  ON public.notices FOR UPDATE
  USING (true);

CREATE POLICY "notices_delete_admin"
  ON public.notices FOR DELETE
  USING (true);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
