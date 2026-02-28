-- top_botton_program 테이블에 video_url 컬럼 추가
ALTER TABLE top_botton_program
  ADD COLUMN IF NOT EXISTS video_url text DEFAULT NULL;
