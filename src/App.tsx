/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  Users,
  HelpCircle,
  LogOut,
  Plus,
  Trash2,
  User as UserIcon,
  Tag,
  Briefcase,
  Activity,
  MessageSquare,
  Rocket,
  Search,
  BookOpen,
  Calendar,
  Settings,
  BookMarked,
  Download,
  FileText,
  Sparkles
} from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const LinkifyText = ({ text, className = 'text-blue-500 hover:underline' }: { text: string, className?: string }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) => 
        urlRegex.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={className}>
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
};

import { 
  Header,
  ProjectBoard, 
  KnowhowSection, 
  MeetingBoard,
  ActivityFeed,
  Board,
  BuilderLog,
  Scratchpad
} from './components/dashboard';
import { BuilderChat } from './components/BuilderChat';
import { Modal } from './components/ui/modal';
import { supabase } from './lib/supabase';
import { projects as initialProjects } from './data/projects';
import { knowhows as initialKnowhows } from './data/knowhows';
import { members as initialMembers } from './data/members';
import { meeting as initialMeeting } from './data/meeting';
import { 
  Project, 
  Knowhow, 
  Member, 
  Meeting, 
  ProjectFeedback, 
  FreeBoardPost, 
  FreeBoardComment,
  MarketingPost,
  MarketingComment,
  BuilderMemo
} from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('isClubAuthenticated') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [activeTab, setActiveTab] = useState('성장 가속 엔진');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [knowhows, setKnowhows] = useState<Knowhow[]>(initialKnowhows);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [meeting, setMeeting] = useState<Meeting>(initialMeeting);
  const [posts, setPosts] = useState<FreeBoardPost[]>([]);
  const [comments, setComments] = useState<FreeBoardComment[]>([]);
  const [marketingPosts, setMarketingPosts] = useState<MarketingPost[]>([]);
  const [marketingComments, setMarketingComments] = useState<MarketingComment[]>([]);
  const [memos, setMemos] = useState<BuilderMemo[]>([]);
  const [scratchpadNotes, setScratchpadNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase Data Fetching
  React.useEffect(() => {
    const fetchData = async () => {
      // Check if Supabase is properly configured via environment variables
      const rawUrl = import.meta.env.VITE_SUPABASE_URL;
      const isPlaceholder = !rawUrl || rawUrl.includes('placeholder.supabase.co');
      
      if (isPlaceholder) {
        console.warn('Supabase is not configured. Data will not be persisted.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch Members
        const { data: mData, error: mError } = await supabase.from('members').select('*');
        if (mError) throw mError;
        if (mData && mData.length > 0) {
          setMembers(mData.map(m => ({
            id: m.id,
            name: m.name,
            role: m.role,
            avatarUrl: m.avatar_url,
            specialties: m.specialties || []
          })));
        }

        // Fetch Projects
        const { data: pData, error: pError } = await supabase.from('projects').select('*');
        if (pError) throw pError;
        if (pData) setProjects(pData.map(p => ({
          id: p.id,
          ownerId: p.owner_id,
          title: p.title,
          description: p.description,
          problemDefinition: p.problem_definition,
          coreFeatures: p.core_features,
          status: p.status,
          progress: p.progress,
          thisWeekGoal: p.this_week_goal,
          thisWeekResult: p.this_week_result,
          blocker: p.blocker,
          helpRequest: p.help_request,
          actionType: p.action_type,
          actionLabel: p.action_label,
          milestones: p.milestones || [],
          feedbacks: p.feedbacks || []
        })));

        // Fetch Knowhows
        const { data: kData, error: kError } = await supabase.from('knowhows').select('*');
        if (kError) throw kError;
        if (kData) setKnowhows(kData.map(k => ({
          id: k.id,
          authorId: k.author_id,
          title: k.title,
          category: k.category,
          summary: k.summary,
          content: k.content
        })));

        // Fetch Posts
        const { data: psData, error: psError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (psError) throw psError;
        if (psData) setPosts(psData.map(p => ({
          id: p.id,
          authorId: p.author_id,
          content: p.content,
          createdAt: p.created_at
        })));

        // Fetch Comments
        const { data: cmData, error: cmError } = await supabase.from('comments').select('*').order('created_at', { ascending: true });
        if (cmError) throw cmError;
        if (cmData) setComments(cmData.map(c => ({
          id: c.id,
          postId: c.post_id,
          authorId: c.author_id,
          content: c.content,
          createdAt: c.created_at
        })));

        // Fetch Meeting Info
        const { data: mtData } = await supabase.from('meeting_info').select('*').limit(1);
        if (mtData && mtData.length > 0) {
          const m = mtData[0];
          setMeeting({
            title: m.title,
            principle: m.principle,
            schedule: m.schedule || [],
            commonQuestions: m.common_questions || []
          });
        }

        // Fetch Marketing Data
        const { data: mpsData, error: mpsError } = await supabase.from('marketing_posts').select('*').order('created_at', { ascending: false });
        if (mpsError) throw mpsError;
        if (mpsData) setMarketingPosts(mpsData.map(p => ({
          id: p.id,
          authorId: p.author_id,
          content: p.content,
          createdAt: p.created_at
        })));

        const { data: mcmData, error: mcmError } = await supabase.from('marketing_comments').select('*').order('created_at', { ascending: true });
        if (mcmError) throw mcmError;
        if (mcmData) setMarketingComments(mcmData.map(c => ({
          id: c.id,
          postId: c.post_id,
          authorId: c.author_id,
          content: c.content,
          createdAt: c.created_at
        })));

        // Fetch Memo Data
        const { data: memoData, error: memoError } = await supabase.from('builder_memos').select('*').order('created_at', { ascending: false });
        if (memoError) throw memoError;
        if (memoData) setMemos(memoData.map(m => ({
          id: m.id,
          authorId: m.author_id,
          projectId: m.project_id,
          content: m.content,
          tags: m.tags || [],
          createdAt: m.created_at
        })));

        // Fetch Scratchpad Notes
        const { data: sData, error: sError } = await supabase.from('scratchpad_notes').select('*').order('created_at', { ascending: false });
        if (sError) throw sError;
        if (sData) setScratchpadNotes(sData.map(s => ({
          id: s.id,
          author_id: s.author_id,
          content: s.content,
          created_at: s.created_at
        })));
      } catch (error: any) {
        console.error('Error fetching data:', error);
        // Only alert once on initial load failure
        if (error.message !== 'Failed to fetch') {
           alert(`데이터를 불러오는 중 오류가 발생했습니다: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const CORRECT_PASSWORD = 'builder123'; // 기본 비밀번호 설정

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const inputPassword = password.trim();
    if (inputPassword === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
      try {
        sessionStorage.setItem('isClubAuthenticated', 'true');
      } catch (e) {
        console.error("Session storage error", e);
      }
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      setIsAuthenticated(false);
      setPassword('');
      sessionStorage.removeItem('isClubAuthenticated');
      setActiveTab('성장 가속 엔진');
    }
  };

  const handleCreatePost = async (content: string, authorId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{ content, author_id: authorId, created_at: new Date().toISOString() }])
        .select();
      
      if (error) throw error;
      if (data) {
        setPosts([{
          id: data[0].id,
          authorId: data[0].author_id,
          content: data[0].content,
          createdAt: data[0].created_at
        }, ...posts]);
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(`게시글 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('이 글을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      setPosts(posts.filter(p => p.id !== id));
      setComments(comments.filter(c => c.postId !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleCreateComment = async (postId: string, content: string, authorId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, content, author_id: authorId, created_at: new Date().toISOString() }])
        .select();
      
      if (error) throw error;
      if (data) {
        setComments([...comments, {
          id: data[0].id,
          postId: data[0].post_id,
          authorId: data[0].author_id,
          content: data[0].content,
          createdAt: data[0].created_at
        }]);
      }
    } catch (error: any) {
      console.error('Error creating comment:', error);
      alert(`댓글 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      setComments(comments.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setComments(comments.filter(c => c.id !== id));
    }
  };

  const handleCreateMarketingPost = async (content: string, authorId: string) => {
    try {
      const { data, error } = await supabase
        .from('marketing_posts')
        .insert([{ content, author_id: authorId, created_at: new Date().toISOString() }])
        .select();
      
      if (error) throw error;
      if (data) {
        setMarketingPosts([{
          id: data[0].id,
          authorId: data[0].author_id,
          content: data[0].content,
          createdAt: data[0].created_at
        }, ...marketingPosts]);
      }
    } catch (error: any) {
      console.error('Error creating marketing post:', error);
      alert(`마케팅 실행 글 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleDeleteMarketingPost = async (id: string) => {
    if (!window.confirm('이 항목을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('marketing_posts').delete().eq('id', id);
      if (error) throw error;
      setMarketingPosts(marketingPosts.filter(p => p.id !== id));
      setMarketingComments(marketingComments.filter(c => c.postId !== id));
    } catch (error) {
      console.error('Error deleting marketing post:', error);
      setMarketingPosts(marketingPosts.filter(p => p.id !== id));
    }
  };

  const handleCreateMarketingComment = async (postId: string, content: string, authorId: string) => {
    try {
      const { data, error } = await supabase
        .from('marketing_comments')
        .insert([{ post_id: postId, content, author_id: authorId, created_at: new Date().toISOString() }])
        .select();
      
      if (error) throw error;
      if (data) {
        setMarketingComments([...marketingComments, {
          id: data[0].id,
          postId: data[0].post_id,
          authorId: data[0].author_id,
          content: data[0].content,
          createdAt: data[0].created_at
        }]);
      }
    } catch (error) {
      console.error('Error creating marketing comment:', error);
      const newComment: MarketingComment = {
        id: Math.random().toString(36).substring(2, 9),
        postId,
        authorId: authorId,
        content,
        createdAt: new Date().toISOString()
      };
      setMarketingComments([...marketingComments, newComment]);
    }
  };

  const handleDeleteMarketingComment = async (id: string) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('marketing_comments').delete().eq('id', id);
      if (error) throw error;
      setMarketingComments(marketingComments.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting marketing comment:', error);
      setMarketingComments(marketingComments.filter(c => c.id !== id));
    }
  };

  const handleCreateMemo = async (content: string, tags: string[], authorId: string, projectId?: string) => {
    try {
      const { data, error } = await supabase
        .from('builder_memos')
        .insert([{ content, tags, author_id: authorId, project_id: projectId, created_at: new Date().toISOString() }])
        .select();
      
      if (error) throw error;
      if (data) {
        setMemos([{
          id: data[0].id,
          authorId: data[0].author_id,
          projectId: data[0].project_id,
          content: data[0].content,
          tags: data[0].tags || [],
          createdAt: data[0].created_at
        }, ...memos]);
      }
    } catch (error: any) {
      console.error('Error creating memo:', error);
      alert(`메모 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleDeleteMemo = async (id: string) => {
    if (!window.confirm('이 메모를 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('builder_memos').delete().eq('id', id);
      if (error) throw error;
      setMemos(memos.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting memo:', error);
      setMemos(memos.filter(m => m.id !== id));
    }
  };

  const handleCreateScratchpadNote = async (content: string, authorId: string) => {
    try {
      const { data, error } = await supabase
        .from('scratchpad_notes')
        .insert([{ content, author_id: authorId, created_at: new Date().toISOString() }])
        .select();
      if (error) throw error;
      if (data) {
        setScratchpadNotes([{
          id: data[0].id,
          author_id: data[0].author_id,
          content: data[0].content,
          created_at: data[0].created_at
        }, ...scratchpadNotes]);
      }
    } catch (error: any) {
      console.error('Error creating scratchpad note:', error);
      alert(`메모 저장 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleUpdateScratchpadNote = async (id: string, content: string) => {
    try {
      const { error } = await supabase
        .from('scratchpad_notes')
        .update({ content })
        .eq('id', id);
      if (error) throw error;
      setScratchpadNotes(scratchpadNotes.map(n => n.id === id ? { ...n, content } : n));
    } catch (error: any) {
      console.error('Error updating scratchpad note:', error);
      alert(`메모 수정 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleDeleteScratchpadNote = async (id: string) => {
    if (!window.confirm('이 메모를 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('scratchpad_notes').delete().eq('id', id);
      if (error) throw error;
      setScratchpadNotes(scratchpadNotes.filter(n => n.id !== id));
    } catch (error: any) {
      console.error('Error deleting scratchpad note:', error);
    }
  };

  // Modals state
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isProjectDetailModalOpen, setProjectDetailModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isKnowhowModalOpen, setKnowhowModalOpen] = useState(false);
  const [isKnowhowViewModalOpen, setKnowhowViewModalOpen] = useState(false);
  const [selectedKnowhow, setSelectedKnowhow] = useState<Knowhow | null>(null);
  const [knowhowModalTab, setKnowhowModalTab] = useState<'write' | 'preview'>('write');
  const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingModalType, setMeetingModalType] = useState<'schedule' | 'question' | 'title_principle'>('schedule');

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberSpecialties, setNewMemberSpecialties] = useState('');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    ownerId: '',
    title: '',
    description: '',
    problemDefinition: '',
    coreFeatures: '',
    status: '기획',
    progress: 0,
    thisWeekGoal: '',
    thisWeekResult: '',
    blocker: '',
    helpRequest: '',
    actionType: 'demo',
    actionLabel: '데모',
    milestones: []
  });
  const [newKnowhow, setNewKnowhow] = useState<Partial<Knowhow>>({
    authorId: '',
    title: '',
    category: '개발',
    summary: '',
    content: ''
  });
  const [feedbackContent, setFeedbackContent] = useState('');

  const handleAddFeedback = async (projectId: string) => {
    if (!feedbackContent.trim()) return;

    const feedback: ProjectFeedback = {
      id: `f${Date.now()}`,
      authorId: 'u1', // Default or logical author id
      content: feedbackContent,
      createdAt: new Date().toISOString()
    };

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedFeedbacks = [...(project.feedbacks || []), feedback];

    const { error } = await supabase.from('projects').update({
      feedbacks: updatedFeedbacks
    }).eq('id', projectId);

    if (!error) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, feedbacks: updatedFeedbacks } : p));
      setSelectedProject(prev => prev?.id === projectId ? { ...prev, feedbacks: updatedFeedbacks } : prev);
      setFeedbackContent('');
    }
  };
  const [meetingForm, setMeetingForm] = useState({
    time: '',
    activity: '',
    question: '',
    title: '',
    principle: ''
  });

  const handleOpenMeetingModal = (type: 'schedule' | 'question' | 'title_principle') => {
    setMeetingModalType(type);
    setMeetingForm({
      time: '',
      activity: '',
      question: '',
      title: meeting.title,
      principle: meeting.principle
    });
    setMeetingModalOpen(true);
  };

  const handleMeetingFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedMeeting = { ...meeting };

    if (meetingModalType === 'schedule') {
      if (!meetingForm.time || !meetingForm.activity) return;
      updatedMeeting = {
        ...meeting,
        schedule: [...meeting.schedule, { time: meetingForm.time, activity: meetingForm.activity }]
      };
    } else if (meetingModalType === 'question') {
      if (!meetingForm.question) return;
      updatedMeeting = {
        ...meeting,
        commonQuestions: [...meeting.commonQuestions, meetingForm.question]
      };
    } else if (meetingModalType === 'title_principle') {
      updatedMeeting = {
        ...meeting,
        title: meetingForm.title,
        principle: meetingForm.principle
      };
    }

    // Sync with Supabase (assuming single row with id=1)
    const { error } = await supabase.from('meeting_info').upsert({
      id: 1,
      title: updatedMeeting.title,
      principle: updatedMeeting.principle,
      schedule: updatedMeeting.schedule,
      common_questions: updatedMeeting.commonQuestions,
      updated_at: new Date().toISOString()
    });

    if (!error) {
      setMeeting(updatedMeeting);
      setMeetingModalOpen(false);
    } else {
      alert('데이터 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSchedule = async (index: number) => {
    const updatedSchedule = meeting.schedule.filter((_, i) => i !== index);
    const { error } = await supabase.from('meeting_info').update({
      schedule: updatedSchedule,
      updated_at: new Date().toISOString()
    }).eq('id', 1);

    if (!error) {
      setMeeting(prev => ({ ...prev, schedule: updatedSchedule }));
    }
  };

  const handleDeleteQuestion = async (index: number) => {
    const updatedQuestions = meeting.commonQuestions.filter((_, i) => i !== index);
    const { error } = await supabase.from('meeting_info').update({
      common_questions: updatedQuestions,
      updated_at: new Date().toISOString()
    }).eq('id', 1);

    if (!error) {
      setMeeting(prev => ({ ...prev, commonQuestions: updatedQuestions }));
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('이 프로젝트를 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id));
    } else {
      console.error('Delete error:', error);
      alert(`프로젝트 삭제 중 오류가 발생했습니다: ${error.message}\n(테이블 'projects'가 생성되어 있는지 확인해 주세요)`);
    }
  };

  const handleDeleteKnowhow = async (id: string) => {
    if (!window.confirm('이 노하우를 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('knowhows').delete().eq('id', id);
    if (!error) {
      setKnowhows(prev => prev.filter(k => k.id !== id));
    } else {
      console.error('Delete error:', error);
      alert(`노하우 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('이 멤버를 삭제하시겠습니까? 멤버 정보와 연결된 아바타 등이 목록에서 제거됩니다.')) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== id));
    } else {
      console.error('Delete error:', error);
      alert(`멤버 삭제 중 오류가 발생했습니다: ${error.message}\n(멤버가 생성한 프로젝트가 있으면 삭제되지 않을 수 있습니다)`);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    
    const specialties = newMemberSpecialties.split(',').map(s => s.trim()).filter(s => s !== '');
    
    if (editingMemberId) {
      // Update existing member
      const { error } = await supabase.from('members').update({
        name: newMemberName,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMemberName}`,
        specialties: specialties
      }).eq('id', editingMemberId);

      if (!error) {
        setMembers(prev => prev.map(m => m.id === editingMemberId ? {
          ...m,
          name: newMemberName,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMemberName}`,
          specialties: specialties
        } : m));
        setMemberModalOpen(false);
        setEditingMemberId(null);
        setNewMemberName('');
        setNewMemberSpecialties('');
      } else {
        console.error('Member update error:', error);
        alert(`멤버 수정 중 오류가 발생했습니다: ${error.message}`);
      }
    } else {
      // Create new member
      const newMember: Member = {
        id: `${Date.now()}`,
        name: newMemberName,
        role: 'Builder',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMemberName}`,
        specialties: specialties
      };

      const { error } = await supabase.from('members').insert({
        id: newMember.id,
        name: newMember.name,
        role: newMember.role,
        avatar_url: newMember.avatarUrl,
        specialties: specialties
      });

      if (!error) {
        setMembers([...members, newMember]);
        setNewMemberName('');
        setNewMemberSpecialties('');
        setMemberModalOpen(false);
      } else {
        console.error('Member create error:', error);
        alert(`멤버 추가 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  const handleEditMemberOpen = (member: Member) => {
    setEditingMemberId(member.id);
    setNewMemberName(member.name);
    setNewMemberSpecialties(member.specialties?.join(', ') || '');
    setMemberModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    const owner = members.find(m => m.id === project.ownerId);
    setNewProject({
      ...project,
      ownerId: owner ? owner.name : project.ownerId,
      milestones: project.milestones || []
    });
    setProjectModalOpen(true);
  };

  const handleViewProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setProjectDetailModalOpen(true);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title?.trim() || !newProject.ownerId?.trim()) return;
    
    let finalOwnerId = '';
    const existingMember = members.find(m => m.name === newProject.ownerId);
    
    if (existingMember) {
      finalOwnerId = existingMember.id;
    } else {
      const newId = `${Date.now()}`;
      const newMember: Member = {
        id: newId,
        name: newProject.ownerId || '',
        role: 'Builder',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newProject.ownerId}`
      };
      
      const { error: mError } = await supabase.from('members').insert({
        id: newMember.id,
        name: newMember.name,
        role: newMember.role,
        avatar_url: newMember.avatarUrl
      });
      
      if (!mError) {
        setMembers(prev => [...prev, newMember]);
        finalOwnerId = newId;
      } else {
        alert('멤버 생성 중 오류가 발생했습니다.');
        return;
      }
    }

    if (newProject.id) {
      // Update existing project
      const updatedProject = { ...newProject as Project, ownerId: finalOwnerId };
      const { error: pError } = await supabase.from('projects').update({
        owner_id: updatedProject.ownerId,
        title: updatedProject.title,
        description: updatedProject.description,
        problem_definition: updatedProject.problemDefinition,
        core_features: updatedProject.coreFeatures,
        status: updatedProject.status,
        progress: updatedProject.progress,
        this_week_goal: updatedProject.thisWeekGoal,
        this_week_result: updatedProject.thisWeekResult,
        blocker: updatedProject.blocker,
        help_request: updatedProject.helpRequest,
        action_type: updatedProject.actionType,
        action_label: updatedProject.actionLabel,
        milestones: updatedProject.milestones
      }).eq('id', updatedProject.id);

      if (!pError) {
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } else {
      // Create new project
      const project: Project = {
        ...(newProject as Project),
        id: `p${Date.now() + 1}`,
        ownerId: finalOwnerId,
      };

      const { error: pError } = await supabase.from('projects').insert({
        id: project.id,
        owner_id: project.ownerId,
        title: project.title,
        description: project.description,
        problem_definition: project.problemDefinition,
        core_features: project.coreFeatures,
        status: project.status,
        progress: project.progress,
        this_week_goal: project.thisWeekGoal,
        this_week_result: project.thisWeekResult,
        blocker: project.blocker,
        help_request: project.helpRequest,
        action_type: project.actionType,
        action_label: project.actionLabel,
        milestones: project.milestones || []
      });

      if (!pError) {
        setProjects([project, ...projects]);
      }
    }

    setProjectModalOpen(false);
    setNewProject({
      ownerId: '',
      title: '',
      description: '',
      problemDefinition: '',
      coreFeatures: '',
      status: '기획',
      progress: 0,
      thisWeekGoal: '',
      thisWeekResult: '',
      blocker: '',
      helpRequest: '',
      actionType: 'demo',
      actionLabel: '데모',
      milestones: []
    });
  };

  const handleEditKnowhow = (kh: Knowhow) => {
    const author = members.find(m => m.id === kh.authorId);
    setNewKnowhow({
      ...kh,
      authorId: author ? author.name : kh.authorId,
      content: kh.content || ''
    });
    setKnowhowModalOpen(true);
  };

  const handleViewKnowhow = (kh: Knowhow) => {
    setSelectedKnowhow(kh);
    setKnowhowViewModalOpen(true);
  };

  const handleAddKnowhow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKnowhow.title?.trim() || !newKnowhow.authorId?.trim()) return;

    let finalAuthorId = '';
    const existingMember = members.find(m => m.name === newKnowhow.authorId);
    
    if (existingMember) {
      finalAuthorId = existingMember.id;
    } else {
      const newId = `${Date.now() + 2}`;
      const newMember: Member = {
        id: newId,
        name: newKnowhow.authorId || '',
        role: 'Builder',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newKnowhow.authorId}`
      };
      
      const { error: mError } = await supabase.from('members').insert({
        id: newMember.id,
        name: newMember.name,
        role: newMember.role,
        avatar_url: newMember.avatarUrl
      });
      
      if (!mError) {
        setMembers(prev => [...prev, newMember]);
        finalAuthorId = newId;
      } else {
        alert('멤버 생성 중 오류가 발생했습니다.');
        return;
      }
    }

    if (newKnowhow.id) {
      // Update existing knowhow
      const kh: Knowhow = {
        ...(newKnowhow as Knowhow),
        authorId: finalAuthorId,
      };

      const { error: kError } = await supabase.from('knowhows').update({
        author_id: kh.authorId,
        title: kh.title,
        category: kh.category,
        summary: kh.summary,
        content: kh.content
      }).eq('id', kh.id);

      if (!kError) {
        setKnowhows(prev => prev.map(k => k.id === kh.id ? kh : k));
        setKnowhowModalOpen(false);
        setNewKnowhow({
          authorId: '',
          title: '',
          category: '개발',
          summary: '',
          content: ''
        });
      } else {
        alert('노하우 수정 중 오류가 발생했습니다.');
      }
    } else {
      // Create new knowhow
      const kh: Knowhow = {
        ...(newKnowhow as Knowhow),
        id: `k${Date.now() + 3}`,
        authorId: finalAuthorId,
      };

      const { error: kError } = await supabase.from('knowhows').insert({
        id: kh.id,
        author_id: kh.authorId,
        title: kh.title,
        category: kh.category,
        summary: kh.summary,
        content: kh.content
      });

      if (!kError) {
        setKnowhows([kh, ...knowhows]);
        setKnowhowModalOpen(false);
        setNewKnowhow({
          authorId: '',
          title: '',
          category: '개발',
          summary: '',
          content: ''
        });
      } else {
        alert('노하우 등록 중 오류가 발생했습니다.');
      }
    }
  };

  const handleOpenAddProject = (memberId?: string) => {
    if (memberId) {
      const member = members.find(m => m.id === memberId);
      if (member) {
        setNewProject(prev => ({ 
          ...prev, 
          ownerId: member.name 
        }));
      }
    } else {
      setNewProject(prev => ({ ...prev, ownerId: '' }));
    }
    setProjectModalOpen(true);
  };

  const sidebarGroups = [
    {
      title: 'MAIN',
      items: [
        { name: '성장 가속 엔진', icon: LayoutDashboard },
      ]
    },
    {
      title: 'WORKSPACE',
      items: [
        { name: '프로젝트 현황', icon: Briefcase },
        { name: '마케팅 실행', icon: Rocket },
        { name: '빌더 로그', icon: BookMarked },
        { name: '빌더의 낙서장', icon: FileText },
        { name: '지식 공유', icon: Tag },
        { name: '빌더 AI 챗', icon: Sparkles },
      ]
    },
    {
      title: 'COMMUNITY',
      items: [
        { name: '빌더 모임', icon: Calendar },
        { name: '자유 게시판', icon: MessageSquare },
        { name: '멤버 관리', icon: Users },
      ]
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case '성장 가속 엔진':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <ActivityFeed projects={projects} knowhows={knowhows} members={members} />
            
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">GROWTH ENGINE BOARD</h2>
                  <p className="text-slate-400 font-bold text-sm">빌더 클럽의 성장을 가속하는 에너지가 모이는 곳입니다.</p>
                </div>
              </div>
            </div>
            {projects.length > 0 ? (
              <ProjectBoard 
                projects={projects} 
                onDelete={handleDeleteProject} 
                onEdit={handleEditProject}
                onViewDetail={handleViewProjectDetail}
                onAddProject={handleOpenAddProject}
                members={members} 
                viewMode="global" 
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center transition-colors">
                <LayoutDashboard className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">등록된 프로젝트가 없습니다.</p>
                <button 
                  onClick={() => setActiveTab('프로젝트 현황')}
                  className="mt-4 text-blue-600 dark:text-blue-400 font-black hover:underline"
                >
                  프로젝트 추가하러 가기
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <KnowhowSection 
                  knowhows={knowhows} 
                  onDelete={handleDeleteKnowhow} 
                  onEdit={handleEditKnowhow}
                  onView={handleViewKnowhow}
                  members={members} 
                />
              </div>
              <div>
                <MeetingBoard 
                  meeting={meeting} 
                  onUpdatePrinciple={() => handleOpenMeetingModal('title_principle')}
                  onUpdateTitle={() => handleOpenMeetingModal('title_principle')}
                  onAddSchedule={() => handleOpenMeetingModal('schedule')}
                  onDeleteSchedule={handleDeleteSchedule}
                  onAddQuestion={() => handleOpenMeetingModal('question')}
                  onDeleteQuestion={handleDeleteQuestion}
                />
              </div>
            </div>
          </motion.div>
        );
      case '프로젝트 현황':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter transition-colors`}>멤버별 전용 스페이스</h2>
              <button 
                onClick={() => handleOpenAddProject()}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                새 프로젝트 추가
              </button>
            </div>
            <ProjectBoard 
              projects={projects} 
              onDelete={handleDeleteProject} 
              onEdit={handleEditProject}
              onViewDetail={handleViewProjectDetail}
              onAddProject={handleOpenAddProject}
              members={members} 
              viewMode="member" 
            />
          </div>
        );
      case '마케팅 실행':
        return (
          <Board 
            title="마케팅 실행 공유" 
            description="실제 진행 중인 마케팅 실행 내용과 결과를 공유하고 인사이트를 나누세요." 
            icon={Rocket}
            placeholder="마케팅 캠페인, 광고 집행 결과, 성과 측정 등을 공유해 주세요."
            posts={marketingPosts} 
            comments={marketingComments}
            members={members} 
            onDelete={handleDeleteMarketingPost} 
            onCreate={handleCreateMarketingPost}
            onDeleteComment={handleDeleteMarketingComment}
            onCreateComment={handleCreateMarketingComment}
            isDarkMode={isDarkMode}
          />
        );
      case '빌더 로그':
        return (
          <BuilderLog 
            memos={memos}
            members={members}
            projects={projects}
            onDelete={handleDeleteMemo}
            onCreate={handleCreateMemo}
            isDarkMode={isDarkMode}
          />
        );
      case '빌더의 낙서장':
        return (
          <Scratchpad 
            notes={scratchpadNotes} 
            members={members} 
            onCreate={handleCreateScratchpadNote}
            onUpdate={handleUpdateScratchpadNote}
            onDelete={handleDeleteScratchpadNote}
            isDarkMode={isDarkMode}
          />
        );
      case '빌더 AI 챗':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BuilderChat 
              isDarkMode={isDarkMode} 
              context={{
                members,
                projects,
                knowhows,
                scratchpadNotes
              }} 
            />
          </div>
        );
      case '지식 공유': // This is a trick to find a good spot if needed, but I'll use the existing switch.
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter transition-colors`}>지식 및 노하우 저장소</h2>
              <button 
                onClick={() => setKnowhowModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                노하우 작성
              </button>
            </div>
            {knowhows.length > 0 ? (
              <KnowhowSection 
                knowhows={knowhows} 
                onDelete={handleDeleteKnowhow} 
                onEdit={handleEditKnowhow}
                onView={handleViewKnowhow}
                members={members} 
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-20 text-center transition-colors">
                <Tag className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">공유된 노하우가 없습니다.</p>
              </div>
            )}
          </div>
        );
      case '빌더 모임':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter mb-8 transition-colors`}>빌더 클럽 모임 일지</h2>
            <MeetingBoard 
              meeting={meeting} 
              onUpdatePrinciple={() => handleOpenMeetingModal('title_principle')}
              onUpdateTitle={() => handleOpenMeetingModal('title_principle')}
              onAddSchedule={() => handleOpenMeetingModal('schedule')}
              onDeleteSchedule={handleDeleteSchedule}
              onAddQuestion={() => handleOpenMeetingModal('question')}
              onDeleteQuestion={handleDeleteQuestion}
            />
          </div>
        );
      case '자유 게시판':
        return (
          <Board 
            title="자유 게시판" 
            description="빌더들의 자유로운 생각과 이야기를 나누어주세요." 
            icon={MessageSquare}
            placeholder="어떤 이야기를 나누고 싶으신가요?"
            posts={posts} 
            comments={comments}
            members={members} 
            onDelete={handleDeletePost} 
            onCreate={handleCreatePost}
            onDeleteComment={handleDeleteComment}
            onCreateComment={handleCreateComment}
            isDarkMode={isDarkMode}
          />
        );
      case '멤버 관리':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter transition-colors`}>커뮤니티 멤버 관리</h2>
              <button 
                onClick={() => {
                  setEditingMemberId(null);
                  setNewMemberName('');
                  setNewMemberSpecialties('');
                  setMemberModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                멤버 추가
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => handleEditMemberOpen(member)}
                  className={`p-6 flex items-center gap-4 group transition-all rounded-3xl border cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-800' : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'}`}
                >
                  <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full bg-slate-100 group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <div className={`font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} text-sm tracking-tight`}>{member.name}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{member.role}</div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMember(member.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-all hover:scale-110 active:scale-95"
                      title="멤버 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className={`col-span-full py-20 text-center ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'} border border-dashed rounded-3xl`}>
                  <p className="text-slate-400 font-bold">멤버를 먼저 등록해 주세요.</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // --- Global Loading Gating ---
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">빌더 클럽 공간을 불러오는 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-md w-full"
        >
          <div className="bg-blue-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(37,99,235,0.2)]">
            <LayoutDashboard className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter leading-none">빌더클럽 보드</h1>
          <p className="text-slate-400 font-bold mb-10 tracking-tight">커뮤니티 운영을 위해 로그인하세요.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 (기본: builder123)"
                className={`w-full px-8 py-5 rounded-2xl border ${loginError ? 'border-rose-300 ring-4 ring-rose-50' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'} outline-none transition-all font-bold text-slate-700 bg-slate-50/50 text-base placeholder:text-slate-300 placeholder:font-normal`}
                autoFocus
              />
              {loginError && (
                <p className="text-rose-500 text-xs font-black mt-3 ml-2 uppercase tracking-widest">비밀번호가 올바르지 않습니다.</p>
              )}
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:translate-y-[-2px] active:translate-y-[0] text-lg">
              입장하기
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans overflow-hidden transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`w-72 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col py-12 shadow-sm relative z-50 transition-colors`}>
        <div className="px-10 mb-16 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <span className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>BUILDERS<br/><span className="text-blue-600">CLUB</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pb-8">
          {sidebarGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="px-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-4">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full px-6 py-3.5 flex items-center gap-4 transition-all duration-300 rounded-2xl group relative ${
                      activeTab === item.name 
                        ? (isDarkMode ? 'text-blue-400 bg-blue-900/30 ring-1 ring-blue-800' : 'text-blue-600 bg-blue-50/80 shadow-sm ring-1 ring-blue-100')
                        : (isDarkMode ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50')
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.name ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'group-hover:text-slate-300' : 'group-hover:text-slate-600')}`} />
                    <span className="font-black text-sm tracking-tight">{item.name}</span>
                    {activeTab === item.name && (
                      <motion.div 
                        layoutId="active-indicator"
                        className={`absolute right-4 w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`} 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto px-6 space-y-3">
          <button 
            onClick={handleLogout}
            className={`w-full px-6 py-5 flex items-center gap-4 text-sm ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-900/20' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'} rounded-2xl transition-all group`}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-black tracking-tight">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-slate-950' : 'bg-[#F8FAFC]'} p-16 pb-24 transition-colors`}>
        <Header isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
        
        {renderContent()}

        {/* Dynamic Modals */}
        <Modal
          isOpen={isProjectDetailModalOpen}
          onClose={() => setProjectDetailModalOpen(false)}
          title={selectedProject?.title || '프로젝트 상세 정보'}
          maxWidth="4xl"
        >
          {selectedProject && (
            <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                  selectedProject.status === '기획' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  selectedProject.status === '제작중' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  selectedProject.status === '완료' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                  'bg-purple-50 text-purple-600 border-purple-100'
                }`}>
                  {selectedProject.status}
                </div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Progress: {selectedProject.progress}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">프로젝트 개요</h4>
                    <p className={`text-sm font-bold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {selectedProject.description}
                    </p>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-3xl p-8">
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">문제 정의</h4>
                    <p className={`text-sm font-bold leading-relaxed italic ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      "{selectedProject.problemDefinition}"
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                    주차별 개발 로드맵
                  </h4>
                  
                  <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                    {selectedProject.milestones && selectedProject.milestones.length > 0 ? (
                      selectedProject.milestones.map((ms, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-10 w-6 h-6 rounded-full border-4 ${
                            ms.status === '완료' ? 'bg-emerald-500 border-emerald-100' :
                            ms.status === '진행중' ? 'bg-blue-500 border-blue-100' :
                            'bg-slate-200 border-slate-50 dark:border-slate-800'
                          } z-10`} />
                          <div className={`p-6 rounded-[2rem] border ${
                            ms.status === '준비중' ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                          }`}>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Week {ms.week}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                ms.status === '완료' ? 'bg-emerald-100 text-emerald-700' :
                                ms.status === '진행중' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {ms.status}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                              {ms.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 font-bold text-sm bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-3xl">
                        등록된 주차별 계획이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                <img 
                  src={members.find(m => m.id === selectedProject.ownerId)?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProject.ownerId}`} 
                  alt="owner" 
                  className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    Created by {members.find(m => m.id === selectedProject.ownerId)?.name || selectedProject.ownerId}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Owner</div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  동료들의 피드백 ({selectedProject.feedbacks?.length || 0})
                </h4>
                
                <div className="space-y-4">
                  {selectedProject.feedbacks?.map((fb) => {
                    const fbAuthor = members.find(m => m.id === fb.authorId);
                    return (
                      <div key={fb.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl flex gap-4">
                        <img 
                          src={fbAuthor?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fb.authorId}`} 
                          alt="fbAuthor" 
                          className="w-8 h-8 rounded-full"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{fbAuthor?.name || fb.authorId}</span>
                            <span className="text-[10px] font-bold text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                            <LinkifyText text={fb.content} />
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="mt-6 flex gap-3">
                    <input 
                      type="text"
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      placeholder="프로젝트에 대해 응원이나 피드백을 남겨주세요!"
                      className={`flex-1 px-6 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all text-sm`}
                    />
                    <button 
                      onClick={() => handleAddFeedback(selectedProject.id)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                      등록
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isKnowhowViewModalOpen}
          onClose={() => setKnowhowViewModalOpen(false)}
          title={selectedKnowhow?.title || '지식 공유'}
          maxWidth="4xl"
        >
          {selectedKnowhow && (
            <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-3">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-blue-100">
                  {selectedKnowhow.category}
                </span>
                <span className="text-[10px] font-black text-slate-300 uppercase">
                  ID: {selectedKnowhow.id}
                </span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">요약</h4>
                <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                  <LinkifyText text={selectedKnowhow.summary} />
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">상세 내용</h4>
                <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'} font-medium leading-loose`}>
                  <div className="markdown-content prose dark:prose-invert max-w-none">
                    {selectedKnowhow.content ? (
                      <ReactMarkdown>{selectedKnowhow.content}</ReactMarkdown>
                    ) : (
                      <span className="text-slate-400">작성된 상세 내용이 없습니다.</span>
                    )}
                  </div>
                </div>
              </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img 
                      src={members.find(m => m.id === selectedKnowhow.authorId)?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedKnowhow.authorId}`} 
                      alt="author" 
                      className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                      {members.find(m => m.id === selectedKnowhow.authorId)?.name || selectedKnowhow.authorId}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const authorName = members.find(m => m.id === selectedKnowhow.authorId)?.name || selectedKnowhow.authorId;
                        const content = `# ${selectedKnowhow.title}\n\nCategory: ${selectedKnowhow.category}\nAuthor: ${authorName}\nDate: ${new Date().toLocaleDateString()}\n\n## Summary\n${selectedKnowhow.summary}\n\n## Content\n${selectedKnowhow.content || selectedKnowhow.summary}\n\nTags: ${selectedKnowhow.tags?.join(', ') || ''}`;
                        const blob = new Blob([content], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedKnowhow.title}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      MD
                    </button>
                    <button 
                      onClick={() => {
                        const authorName = members.find(m => m.id === selectedKnowhow.authorId)?.name || selectedKnowhow.authorId;
                        const html = `
                          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                          <head><meta charset='utf-8'><title>${selectedKnowhow.title}</title></head>
                          <body>
                            <h1>${selectedKnowhow.title}</h1>
                            <p><b>카테고리:</b> ${selectedKnowhow.category}</p>
                            <p><b>작성자:</b> ${authorName}</p>
                            <p><b>요약:</b> ${selectedKnowhow.summary}</p>
                            <hr/>
                            <div>${selectedKnowhow.content || selectedKnowhow.summary}</div>
                          </body>
                          </html>
                        `;
                        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${selectedKnowhow.title}.doc`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      DOCX
                    </button>
                    <button 
                      onClick={async () => {
                        if (!selectedKnowhow) return;
                        const authorName = members.find(m => m.id === selectedKnowhow.authorId)?.name || selectedKnowhow.authorId;
                        
                        const element = document.createElement('div');
                        element.style.position = 'absolute';
                        element.style.left = '-9999px';
                        element.style.padding = '40px';
                        element.style.width = '800px';
                        element.style.background = 'white';
                        element.style.color = 'black';
                        element.style.fontFamily = 'sans-serif';
                        element.innerHTML = `
                          <div style="font-family: sans-serif;">
                            <h1 style="font-size: 24px; margin-bottom: 10px;">${selectedKnowhow.title}</h1>
                            <div style="font-size: 14px; color: #666; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                              카테고리: ${selectedKnowhow.category} | 작성자: ${authorName} | 날짜: ${new Date().toLocaleDateString()}
                            </div>
                            <div style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px;">
                              <h3 style="font-size: 16px; margin-bottom: 5px;">요약</h3>
                              <p style="font-size: 14px; line-height: 1.6;">${selectedKnowhow.summary}</p>
                            </div>
                            <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;">
                              ${selectedKnowhow.content || selectedKnowhow.summary}
                            </div>
                          </div>
                        `;
                        document.body.appendChild(element);
                        
                        try {
                          const canvas = await html2canvas(element, { scale: 2 });
                          const imgData = canvas.toDataURL('image/png');
                          const pdf = new jsPDF('p', 'mm', 'a4');
                          const pdfWidth = pdf.internal.pageSize.getWidth();
                          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                          
                          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                          pdf.save(`${selectedKnowhow.title}.pdf`);
                        } catch (err) {
                          console.error('PDF generation failed:', err);
                          alert('PDF 생성 중 오류가 발생했습니다.');
                        } finally {
                          document.body.removeChild(element);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </div>
                </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isKnowhowModalOpen}
          onClose={() => {
            setKnowhowModalOpen(false);
            setKnowhowModalTab('write');
            setNewKnowhow({
              authorId: '',
              title: '',
              category: '개발',
              summary: '',
              content: ''
            });
          }}
          title={newKnowhow.id ? '노하우 수정' : '노하우 아카이빙'}
          maxWidth="xl"
        >
          <div className="mb-6 flex gap-2">
            <button 
              onClick={() => setKnowhowModalTab('write')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${knowhowModalTab === 'write' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              편집
            </button>
            <button 
              onClick={() => setKnowhowModalTab('preview')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${knowhowModalTab === 'preview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              미리보기
            </button>
          </div>

          <form onSubmit={handleAddKnowhow} className="space-y-6 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar">
            {knowhowModalTab === 'write' ? (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">작성자</label>
                    <input 
                      type="text" 
                      list="members-list"
                      value={newKnowhow.authorId}
                      onChange={(e) => setNewKnowhow({...newKnowhow, authorId: e.target.value})}
                      placeholder="작성자 성함을 입력하세요"
                      className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                      required
                    />
                    <datalist id="members-list">
                      {members.map(m => <option key={m.id} value={m.name} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">분야 선택</label>
                    <select 
                      value={newKnowhow.category}
                      onChange={(e) => setNewKnowhow({...newKnowhow, category: e.target.value})}
                      className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                    >
                      {['개발', '코딩', '프롬프트', '디자인', '기획', '마케팅', '비즈니스', '투자/지표', '기타'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">지식의 열쇠 (제목)</label>
                  <input 
                    type="text" 
                    value={newKnowhow.title}
                    onChange={(e) => setNewKnowhow({...newKnowhow, title: e.target.value})}
                    className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-black transition-all`}
                    placeholder="노하우의 핵심 주제를 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">핵심 요약</label>
                  <input 
                    type="text" 
                    value={newKnowhow.summary}
                    onChange={(e) => setNewKnowhow({...newKnowhow, summary: e.target.value})}
                    className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                    placeholder="간략하게 한 줄로 설명해 주세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">상세 내용 (Markdown 지원)</label>
                  <textarea 
                    value={newKnowhow.content}
                    onChange={(e) => setNewKnowhow({...newKnowhow, content: e.target.value})}
                    className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 h-64 font-medium leading-relaxed transition-all resize-none`}
                    placeholder="마크다운 형식을 사용하여 상세한 노하우를 입력하세요. # 제목, - 목록 등을 사용할 수 있습니다."
                  />
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 min-h-[400px]">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">미리보기</h4>
                  <div className={`prose dark:prose-invert max-w-none ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} font-medium`}>
                    {newKnowhow.content ? (
                      <ReactMarkdown>{newKnowhow.content}</ReactMarkdown>
                    ) : (
                      <div className="text-slate-400 italic text-center pt-20">내용을 입력하면 여기에 미리보기가 표시됩니다.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all text-lg">
              {newKnowhow.id ? '수정 완료' : '지식 저장하기'}
            </button>
          </form>
        </Modal>

        <Modal 
          isOpen={isMeetingModalOpen}
          onClose={() => setMeetingModalOpen(false)}
          title={
            meetingModalType === 'schedule' ? '모임 일정 추가' :
            meetingModalType === 'question' ? '공통 질문 추가' : '모임 정보 편집'
          }
        >
          <form onSubmit={handleMeetingFormSubmit} className="space-y-6">
            {meetingModalType === 'schedule' && (
              <>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">진행 시간</label>
                  <input 
                    type="text" 
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({...meetingForm, time: e.target.value})}
                    placeholder="예: 14:00 - 15:00"
                    className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">활동 내역</label>
                  <input 
                    type="text" 
                    value={meetingForm.activity}
                    onChange={(e) => setMeetingForm({...meetingForm, activity: e.target.value})}
                    placeholder="활동 내용을 입력하세요"
                    className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                    required
                  />
                </div>
              </>
            )}
            {meetingModalType === 'question' && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">질문 문구</label>
                <textarea 
                  value={meetingForm.question}
                  onChange={(e) => setMeetingForm({...meetingForm, question: e.target.value})}
                  className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-slate-50/50 border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 h-32 font-bold leading-relaxed shadow-inner transition-all`}
                  placeholder="모두 함께 고민해볼 질문을 입력하세요"
                  required
                />
              </div>
            )}
            {meetingModalType === 'title_principle' && (
              <>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">모임명</label>
                  <input 
                    type="text" 
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                    className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-black text-lg transition-all`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">오늘의 가이드</label>
                  <input 
                    type="text" 
                    value={meetingForm.principle}
                    onChange={(e) => setMeetingForm({...meetingForm, principle: e.target.value})}
                    className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-blue-900/40' : 'bg-white border-slate-200 text-slate-600 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                    required
                  />
                </div>
              </>
            )}
            <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
              수정 사항 적용하기
            </button>
          </form>
        </Modal>

        <Modal 
          isOpen={isMemberModalOpen} 
          onClose={() => {
            setMemberModalOpen(false);
            setEditingMemberId(null);
          }} 
          title={editingMemberId ? "빌더 정보 수정" : "새로운 빌더 등록"}
        >
          <form onSubmit={handleAddMember} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">멤버 실명</label>
              <input 
                type="text" 
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="실명 또는 닉네임을 입력하세요"
                className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-black transition-all`}
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">전문 분야 (쉼표로 구분)</label>
              <input 
                type="text" 
                value={newMemberSpecialties}
                onChange={(e) => setNewMemberSpecialties(e.target.value)}
                placeholder="예: React, 디자인, 기획"
                className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
              />
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all">
              {editingMemberId ? "수정 완료" : "멤버 추가 완료"}
            </button>
          </form>
        </Modal>

        <Modal 
          isOpen={isProjectModalOpen} 
          onClose={() => setProjectModalOpen(false)} 
          title={newProject.id ? "프로젝트 정보 수정" : "새 프로젝트 하우스"}
          maxWidth="2xl"
        >
          <form onSubmit={handleAddProject} className="space-y-8 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">프로젝트 리더 (멤버 이름)</label>
                <input 
                  type="text" 
                  value={newProject.ownerId}
                  onChange={(e) => setNewProject({...newProject, ownerId: e.target.value})}
                  placeholder="이미 등록된 멤버의 이름을 입력하세요"
                  className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">프로젝트 이름</label>
                <input 
                  type="text" 
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-black text-lg transition-all`}
                  placeholder="무엇을 만드나요?"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">문제 정의 (Problem Definition)</label>
                <textarea 
                  value={newProject.problemDefinition}
                  onChange={(e) => setNewProject({...newProject, problemDefinition: e.target.value})}
                  className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 h-24 font-bold leading-relaxed transition-all`}
                  placeholder="어떤 문제를 해결하려고 하나요? (예: 기존 서비스의 복잡함, 수작업의 비효율성 등)"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">핵심 기능 (Core Features)</label>
                <textarea 
                  value={newProject.coreFeatures}
                  onChange={(e) => setNewProject({...newProject, coreFeatures: e.target.value})}
                  className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 h-24 font-bold leading-relaxed transition-all`}
                  placeholder="프로젝트의 주요 기능 3가지를 적어보세요"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">상세 설명</label>
                <textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 h-32 font-bold leading-relaxed transition-all`}
                  placeholder="프로젝트 전반에 대한 추가 설명이 필요하다면 적어주세요"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">현재 상태</label>
                <select 
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
                  className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 text-slate-600 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                >
                  <option>기획</option>
                  <option>제작중</option>
                  <option>테스트중</option>
                  <option>배포준비</option>
                  <option>완료</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">완성도 (%)</label>
                <input 
                  type="number" 
                  value={newProject.progress}
                  onChange={(e) => setNewProject({...newProject, progress: parseInt(e.target.value)})}
                  className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                />
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">주차별 개발 로드맵</label>
                  <button 
                    type="button"
                    onClick={() => {
                      const currentMilestones = newProject.milestones || [];
                      const nextWeek = currentMilestones.length > 0 
                        ? Math.max(...currentMilestones.map(m => m.week)) + 1 
                        : 1;
                      setNewProject({
                        ...newProject,
                        milestones: [...currentMilestones, { week: nextWeek, content: '', status: '준비중' }] as any
                      });
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-widest"
                  >
                    <Plus className="w-3 h-3" />
                    주차 추가
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {(newProject.milestones || []).map((ms, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 relative">
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = (newProject.milestones || []).filter((_, i) => i !== idx);
                          setNewProject({ ...newProject, milestones: updated });
                        }}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">주차</label>
                          <input 
                            type="number" 
                            value={ms.week}
                            onChange={(e) => {
                              const updated = [...(newProject.milestones || [])];
                              updated[idx] = { ...updated[idx], week: parseInt(e.target.value) };
                              setNewProject({ ...newProject, milestones: updated });
                            }}
                            className={`w-full px-4 py-2 text-sm rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} outline-none focus:ring-2 focus:ring-blue-500/20 font-bold transition-all`}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">상태</label>
                          <select 
                            value={ms.status}
                            onChange={(e) => {
                              const updated = [...(newProject.milestones || [])];
                              updated[idx] = { ...updated[idx], status: e.target.value as any };
                              setNewProject({ ...newProject, milestones: updated });
                            }}
                            className={`w-full px-4 py-2 text-sm rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} outline-none focus:ring-2 focus:ring-blue-500/20 font-bold transition-all`}
                          >
                            <option value="준비중">준비중</option>
                            <option value="진행중">진행중</option>
                            <option value="완료">완료</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">개발 내용</label>
                        <textarea 
                          value={ms.content}
                          onChange={(e) => {
                            const updated = [...(newProject.milestones || [])];
                            updated[idx] = { ...updated[idx], content: e.target.value };
                            setNewProject({ ...newProject, milestones: updated });
                          }}
                          className={`w-full px-4 py-3 text-sm rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'} outline-none focus:ring-2 focus:ring-blue-500/20 font-bold h-20 resize-none transition-all`}
                          placeholder="해당 주차에 진행할 구체적인 개발 내용을 입력하세요"
                        />
                      </div>
                    </div>
                  ))}
                  {(newProject.milestones || []).length === 0 && (
                    <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl transition-colors">
                      <p className="text-xs font-bold text-slate-400">주차별 개발 로드맵을 추가해 보세요.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all text-lg">
              {newProject.id ? "수정 완료" : "프로젝트 런칭하기"}
            </button>
          </form>
        </Modal>

        {/* Floating Help Button */}
        <button className={`fixed bottom-12 right-12 w-16 h-16 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group z-[60]`}>
          <HelpCircle className={`w-8 h-8 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} group-hover:text-blue-600 group-hover:rotate-12 transition-all`} />
          <div className="absolute right-20 bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap tracking-widest">
            운영팀 문의하기
          </div>
        </button>
      </main>
    </div>
  );
}
