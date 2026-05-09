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

-- 7. 빌더의 갤러리 테이블 생성
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    author_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 멤버 테이블 생성 (중요: specialties 컬럼 포함)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT,
    specialties TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 프로젝트 테이블 생성
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    owner_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    problem_definition TEXT,
    core_features TEXT,
    status TEXT DEFAULT '기획',
    progress INTEGER DEFAULT 0,
    this_week_goal TEXT,
    this_week_result TEXT,
    blocker TEXT,
    help_request TEXT,
    action_type TEXT DEFAULT 'demo',
    action_label TEXT DEFAULT '데모',
    milestones JSONB DEFAULT '[]',
    feedbacks JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 지식 공유(노하우) 테이블 생성
CREATE TABLE IF NOT EXISTS public.knowhows (
    id TEXT PRIMARY KEY,
    author_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. 모임 정보 테이블 생성
CREATE TABLE IF NOT EXISTS public.meeting_info (
    id INTEGER PRIMARY KEY, -- 일반적으로 1번 행만 사용
    title TEXT NOT NULL,
    principle TEXT,
    schedule JSONB DEFAULT '[]',
    common_questions JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
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

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to gallery_images" ON public.gallery_images FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to members" ON public.members FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.knowhows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to knowhows" ON public.knowhows FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.meeting_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to meeting_info" ON public.meeting_info FOR ALL USING (true) WITH CHECK (true);
