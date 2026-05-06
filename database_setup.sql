-- 1. 자유 게시판 테이블 생성
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 자유 게시판 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 마케팅 실행 테이블 생성
CREATE TABLE IF NOT EXISTS public.marketing_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 마케팅 실행 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS public.marketing_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.marketing_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 빌더 로그(메모) 테이블 생성
CREATE TABLE IF NOT EXISTS public.builder_memos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 빌더의 낙서장(A4 메모) 테이블 생성
CREATE TABLE IF NOT EXISTS public.scratchpad_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    color_hint TEXT DEFAULT 'white',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 데이터 (필요 시)
-- RLS (보안 정책) 해제하여 누구나 읽고 쓸 수 있게 설정 (팀 협업용)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.marketing_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to marketing_posts" ON public.marketing_posts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.marketing_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to marketing_comments" ON public.marketing_comments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.builder_memos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to builder_memos" ON public.builder_memos FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.scratchpad_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to scratchpad_notes" ON public.scratchpad_notes FOR ALL USING (true) WITH CHECK (true);
