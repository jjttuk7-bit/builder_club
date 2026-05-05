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
  Briefcase
} from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Header,
  ProjectBoard, 
  KnowhowSection, 
  MeetingBoard 
} from './components/dashboard';
import { Modal } from './components/ui/modal';
import { supabase } from './lib/supabase';
import { projects as initialProjects } from './data/projects';
import { knowhows as initialKnowhows } from './data/knowhows';
import { members as initialMembers } from './data/members';
import { meeting as initialMeeting } from './data/meeting';
import { Project, Knowhow, Member, Meeting } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [activeTab, setActiveTab] = useState('종합 대시보드');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [knowhows, setKnowhows] = useState<Knowhow[]>(initialKnowhows);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [meeting, setMeeting] = useState<Meeting>(initialMeeting);
  const [isLoading, setIsLoading] = useState(true);

  // Supabase Data Fetching
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Members
        const { data: mData } = await supabase.from('members').select('*');
        if (mData) setMembers(mData.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          avatarUrl: m.avatar_url
        })));

        // Fetch Projects
        const { data: pData } = await supabase.from('projects').select('*');
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
          actionLabel: p.action_label
        })));

        // Fetch Knowhows
        const { data: kData } = await supabase.from('knowhows').select('*');
        if (kData) setKnowhows(kData.map(k => ({
          id: k.id,
          authorId: k.author_id,
          title: k.title,
          category: k.category,
          summary: k.summary
        })));

        // Fetch Meeting Info
        const { data: mtData } = await supabase.from('meeting_info').select('*').single();
        if (mtData) setMeeting({
          title: mtData.title,
          principle: mtData.principle,
          schedule: mtData.schedule,
          commonQuestions: mtData.common_questions
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const CORRECT_PASSWORD = 'builder123'; // 기본 비밀번호 설정

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      setIsAuthenticated(false);
      setPassword('');
      setActiveTab('종합 대시보드');
    }
  };

  // Modals state
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isKnowhowModalOpen, setKnowhowModalOpen] = useState(false);
  const [isMeetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingModalType, setMeetingModalType] = useState<'schedule' | 'question' | 'title_principle'>('schedule');

  const [newMemberName, setNewMemberName] = useState('');
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
    actionLabel: '데모'
  });
  const [newKnowhow, setNewKnowhow] = useState<Partial<Knowhow>>({
    authorId: '',
    title: '',
    category: '개발',
    summary: ''
  });
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
      alert('프로젝트 삭제 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleDeleteKnowhow = async (id: string) => {
    if (!window.confirm('이 노하우를 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('knowhows').delete().eq('id', id);
    if (!error) {
      setKnowhows(prev => prev.filter(k => k.id !== id));
    } else {
      alert('노하우 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('이 멤버를 삭제하시겠습니까? 멤버 정보와 연결된 아바타 등이 목록에서 제거됩니다.')) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== id));
    } else {
      alert('멤버 삭제 중 오류가 발생했습니다. (멤버가 생성한 프로젝트가 있으면 삭제되지 않을 수 있습니다)');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newMember: Member = {
      id: `${Date.now()}`,
      name: newMemberName,
      role: 'Builder',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMemberName}`
    };

    const { error } = await supabase.from('members').insert({
      id: newMember.id,
      name: newMember.name,
      role: newMember.role,
      avatar_url: newMember.avatarUrl
    });

    if (!error) {
      setMembers([...members, newMember]);
      setNewMemberName('');
      setMemberModalOpen(false);
    } else {
      alert('멤버 추가 중 오류가 발생했습니다.');
    }
  };

  const handleEditProject = (project: Project) => {
    const owner = members.find(m => m.id === project.ownerId);
    setNewProject({
      ...project,
      ownerId: owner ? owner.name : project.ownerId
    });
    setProjectModalOpen(true);
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
        action_label: updatedProject.actionLabel
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
        action_label: project.actionLabel
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
      actionLabel: '데모'
    });
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
      summary: kh.summary
    });

    if (!kError) {
      setKnowhows([kh, ...knowhows]);
      setKnowhowModalOpen(false);
      setNewKnowhow({
        authorId: '',
        title: '',
        category: '개발',
        summary: ''
      });
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

  const navItems = [
    { name: '종합 대시보드', icon: LayoutDashboard },
    { name: '멤버별 스페이스', icon: UserIcon },
    { name: '지식 공유', icon: Tag },
    { name: '빌더 모임', icon: Briefcase },
    { name: '멤버 관리', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case '종합 대시보드':
        return (
          <div className="space-y-12">
            {projects.length > 0 ? (
              <ProjectBoard 
                projects={projects} 
                onDelete={handleDeleteProject} 
                onEdit={handleEditProject}
                onAddProject={handleOpenAddProject}
                members={members} 
                viewMode="global" 
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center transition-colors">
                <LayoutDashboard className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">등록된 프로젝트가 없습니다.</p>
                <button 
                  onClick={() => setActiveTab('멤버별 스페이스')}
                  className="mt-4 text-blue-600 dark:text-blue-400 font-black hover:underline"
                >
                  프로젝트 추가하러 가기
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <KnowhowSection knowhows={knowhows} onDelete={handleDeleteKnowhow} members={members} />
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
          </div>
        );
      case '멤버별 스페이스':
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
              onAddProject={handleOpenAddProject}
              members={members} 
              viewMode="member" 
            />
          </div>
        );
      case '지식 공유':
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
              <KnowhowSection knowhows={knowhows} onDelete={handleDeleteKnowhow} members={members} />
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
      case '멤버 관리':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter transition-colors`}>커뮤니티 멤버 관리</h2>
              <button 
                onClick={() => setMemberModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                멤버 추가
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map(member => (
                <div key={member.id} className={`p-6 flex items-center gap-4 group transition-all rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-800' : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'}`}>
                  <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full bg-slate-100" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <div className={`font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} text-sm tracking-tight`}>{member.name}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{member.role}</div>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMember(member.id);
                    }}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
                    title="멤버 삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
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

        <nav className="flex-1 px-6 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full px-6 py-5 flex items-center gap-4 transition-all duration-300 rounded-[1.5rem] group relative ${
                activeTab === item.name 
                  ? (isDarkMode ? 'text-blue-400 bg-blue-900/40 ring-1 ring-blue-800' : 'text-blue-600 bg-blue-50/80 shadow-sm ring-1 ring-blue-100')
                  : (isDarkMode ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50')
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
          onClose={() => setMemberModalOpen(false)} 
          title="새로운 빌더 등록"
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
            <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all">
              멤버 추가 완료
            </button>
          </form>
        </Modal>

        <Modal 
          isOpen={isProjectModalOpen} 
          onClose={() => setProjectModalOpen(false)} 
          title={newProject.id ? "프로젝트 정보 수정" : "새 프로젝트 하우스"}
        >
          <form onSubmit={handleAddProject} className="space-y-8">
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
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all text-lg">
              {newProject.id ? "수정 완료" : "프로젝트 런칭하기"}
            </button>
          </form>
        </Modal>

        <Modal 
          isOpen={isKnowhowModalOpen} 
          onClose={() => setKnowhowModalOpen(false)} 
          title="노하우 아카이빙"
        >
          <form onSubmit={handleAddKnowhow} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">작성자</label>
              <input 
                type="text" 
                value={newKnowhow.authorId}
                onChange={(e) => setNewKnowhow({...newKnowhow, authorId: e.target.value})}
                placeholder="본인의 이름을 입력하세요"
                className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-slate-50/50 border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">지식의 열쇠 (제목)</label>
              <input 
                type="text" 
                value={newKnowhow.title}
                onChange={(e) => setNewKnowhow({...newKnowhow, title: e.target.value})}
                className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 font-black text-lg transition-all`}
                placeholder="핵심 노하우를 한 문장으로 표현하세요"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">분야 선택</label>
              <select 
                value={newKnowhow.category}
                onChange={(e) => setNewKnowhow({...newKnowhow, category: e.target.value})}
                className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 text-slate-600 focus:ring-blue-50'} outline-none focus:ring-4 font-bold transition-all`}
              >
                <option>개발</option>
                <option>코딩</option>
                <option>프롬프트</option>
                <option>디자인</option>
                <option>기획</option>
                <option>마케팅</option>
                <option>투자/지표</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">핵심 요약</label>
              <textarea 
                value={newKnowhow.summary}
                onChange={(e) => setNewKnowhow({...newKnowhow, summary: e.target.value})}
                className={`w-full px-6 py-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-900/40' : 'bg-white border-slate-200 focus:ring-blue-50'} outline-none focus:ring-4 h-40 font-bold leading-relaxed transition-all`}
                placeholder="동료들이 바로 적용할 수 있도록 요약해 주세요"
                required
              />
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all">
              지식 저장하기
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
