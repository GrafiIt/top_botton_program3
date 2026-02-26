-- 새로운 Supabase 데이터베이스에서 실행할 notices 테이블 생성 스크립트
-- 이 스크립트는 새 DB에서 실행해야 합니다.

-- notices 테이블 생성
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 공지사항을 읽을 수 있도록 정책 생성
CREATE POLICY "Anyone can read notices" ON notices
  FOR SELECT USING (true);

-- 모든 사용자가 공지사항을 생성할 수 있도록 정책 생성 (관리자 인증은 앱에서 처리)
CREATE POLICY "Anyone can insert notices" ON notices
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 공지사항을 수정할 수 있도록 정책 생성 (관리자 인증은 앱에서 처리)
CREATE POLICY "Anyone can update notices" ON notices
  FOR UPDATE USING (true);

-- 모든 사용자가 공지사항을 삭제할 수 있도록 정책 생성 (관리자 인증은 앱에서 처리)
CREATE POLICY "Anyone can delete notices" ON notices
  FOR DELETE USING (true);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
