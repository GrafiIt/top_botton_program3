-- Supabase Storage 버킷 생성 스크립트
-- notices 버킷을 공개(public) 버킷으로 생성

-- 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('notices', 'notices', true)
ON CONFLICT (id) DO NOTHING;

-- 모든 사용자가 읽을 수 있도록 정책 설정
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'notices' );

-- 관리자만 업로드할 수 있도록 정책 설정 (인증된 사용자)
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'notices' );

-- 관리자만 삭제할 수 있도록 정책 설정
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'notices' );
