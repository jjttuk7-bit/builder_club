/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Plus, 
  Pencil,
  Trash2, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle,
  MoreHorizontal,
  ChevronRight,
  User as UserIcon,
  Tag,
  Monitor,
  Moon,
  Sun,
  Activity,
  MessageSquare
} from 'lucide-react';
import React from 'react';
import { Project, Knowhow, Member, Meeting } from '../types';

// --- Header ---
interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header = ({ isDarkMode, onToggleDarkMode }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between mb-12">
      <div>
        <h1 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter mb-2 transition-colors`}>
          Builder Club Space <span className="text-blue-600">.</span>
        </h1>
        <p className="text-slate-400 font-bold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          마지막 업데이트: 2026년 5월 5일 오전 11:30
        </p>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleDarkMode}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-white text-slate-400 hover:bg-slate-50 shadow-sm border border-slate-100'
          }`}
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <div className="flex -space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-10 h-10 rounded-full border-4 ${isDarkMode ? 'border-slate-950 bg-slate-800' : 'border-slate-50 bg-slate-200'} overflow-hidden transition-colors`}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" referrerPolicy="no-referrer" />
            </div>
          ))}
          <div className={`w-10 h-10 rounded-full border-4 ${isDarkMode ? 'border-slate-950' : 'border-slate-50'} bg-blue-600 flex items-center justify-center text-[10px] font-black text-white`}>
            +12
          </div>
        </div>
        <button className={`px-6 py-3 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center gap-2 ${
          isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
        }`}>
          공유하기
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

// --- Activity Feed ---
interface ActivityItem {
  id: string;
  type: 'project_update' | 'new_knowhow' | 'new_feedback';
  user: { name: string; avatar: string };
  target: string;
  timestamp: string;
}

export const ActivityFeed = ({ projects, knowhows, members }: { projects: Project[]; knowhows: Knowhow[]; members: Member[] }) => {
  // Generate mock-real activities combining latest data
  const activities: ActivityItem[] = [
    ...projects.flatMap(p => (p.feedbacks || []).map(f => ({
      id: f.id,
      type: 'new_feedback' as const,
      user: { 
        name: members.find(m => m.id === f.authorId)?.name || 'Unknown', 
        avatar: members.find(m => m.id === f.authorId)?.avatarUrl || ''
      },
      target: `Project: ${p.title}`,
      timestamp: f.createdAt
    }))),
    ...knowhows.slice(0, 3).map(k => ({
      id: k.id,
      type: 'new_knowhow' as const,
      user: {
        name: members.find(m => m.id === k.authorId)?.name || 'Unknown',
        avatar: members.find(m => m.id === k.authorId)?.avatarUrl || ''
      },
      target: `Knowhow: ${k.title}`,
      timestamp: new Date().toISOString() // Mocked for display
    }))
  ].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    const validB = isNaN(timeB) ? 0 : timeB;
    const validA = isNaN(timeA) ? 0 : timeA;
    return validB - validA;
  }).slice(0, 5);

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 mb-12 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          최근 커뮤니티 활동 (LIVE)
        </h3>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {activities.map(act => (
          <div key={act.id} className="flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 min-w-[300px]">
            <img src={act.user.avatar} alt={act.user.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800" />
            <div className="flex-1">
              <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
                {act.type === 'new_feedback' ? '새 댓글' : act.type === 'new_knowhow' ? '새 지식공유' : '업데이트'}
              </div>
              <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 line-clamp-1">{act.target}</div>
              <div className="text-[10px] font-bold text-slate-400 italic">by {act.user.name}</div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-4 text-slate-400 font-bold text-sm">최근 활동이 없습니다.</div>
        )}
      </div>
    </section>
  );
};

// --- Project Card ---
interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onEdit?: (project: Project) => void;
  onViewDetail?: (project: Project) => void;
  member?: Member;
  key?: string | number;
}

function ProjectCard({ project, onDelete, onEdit, onViewDetail, member }: ProjectCardProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case '기획': return 'bg-amber-50 text-amber-600 border-amber-100';
      case '제작중': return 'bg-blue-50 text-blue-600 border-blue-100';
      case '테스트중': return 'bg-purple-50 text-purple-600 border-purple-100';
      case '배포준비': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case '완료': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div 
      onClick={() => onViewDetail?.(project)}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl dark:hover:shadow-blue-900/20 transition-all group flex flex-col h-full relative cursor-pointer"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${getStatusColor(project.status)}`}>
          {project.status}
        </div>
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(project);
            }}
            className="p-2 text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-all hover:scale-110 active:scale-90 cursor-pointer z-20"
            title="프로젝트 수정"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-all hover:scale-110 active:scale-90 cursor-pointer z-20"
            title="프로젝트 삭제"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
        {project.title}
      </h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 font-bold mb-6 line-clamp-2">
        {project.description}
      </p>

      <div className="space-y-4 mb-8 flex-1">
        {project.problemDefinition && (
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">문제 정의</span>
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "{project.problemDefinition}"
            </p>
          </div>
        )}

        {project.coreFeatures && (
          <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100/50 dark:border-blue-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-black uppercase text-blue-400 dark:text-blue-500 tracking-wider">핵심 기능</span>
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
              {project.coreFeatures}
            </p>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500">이번주 성과</span>
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
            {project.thisWeekResult || '아직 기록된 내용이 없습니다.'}
          </p>
        </div>

        {project.blocker && project.blocker !== '없음' && (
          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span className="text-[11px] font-black uppercase text-rose-400 dark:text-rose-500/80">블로커</span>
            </div>
            <p className="text-xs font-bold text-rose-700 dark:text-rose-400 leading-relaxed">
              {project.blocker}
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={member?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.ownerId}`} 
            alt="owner" 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <span className="text-xs font-black text-slate-600 dark:text-slate-400">{member?.name || project.ownerId}</span>
        </div>
        {project.actionType !== 'none' && (
          <button className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
            <span className="text-xs font-black">{project.actionLabel}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// --- Project Board ---
interface ProjectBoardProps {
  projects: Project[];
  members: Member[];
  onDelete: (id: string) => void;
  onEdit?: (project: Project) => void;
  onViewDetail?: (project: Project) => void;
  onAddProject?: (memberId: string) => void;
  viewMode?: 'global' | 'member';
}

export const ProjectBoard = ({ projects, onDelete, onEdit, onViewDetail, members, onAddProject, viewMode = 'global' }: ProjectBoardProps) => {
  if (viewMode === 'member') {
    return (
      <section className="space-y-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white transition-colors">멤버별 프로젝트 스페이스</h2>
              <p className="text-sm text-slate-400 font-bold">각 빌더의 전용 공간에서 프로젝트를 관리합니다.</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-12">
          {members.map(member => {
            const memberProjects = projects.filter(p => p.ownerId === member.id);
            return (
              <div key={member.id} className="relative">
                <div className="flex items-center gap-4 mb-6 sticky top-0 z-10 py-2 bg-[#F8FAFC]/80 dark:bg-slate-950/80 backdrop-blur-md">
                  <img 
                    src={member.avatarUrl} 
                    alt={member.name} 
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                      {member.name}'s Space
                    </h3>
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {member.specialties.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-md border border-blue-100 dark:border-blue-900/40 uppercase tracking-widest">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 ml-4"></div>
                  <button 
                    onClick={() => onAddProject?.(member.id)}
                    className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all uppercase tracking-widest"
                  >
                    <Plus className="w-3 h-3" />
                    Add Project
                  </button>
                  <span className="text-xs font-black text-slate-400 uppercase ml-4">
                    {memberProjects.length} Projects
                  </span>
                </div>
                
                {memberProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {memberProjects.map(project => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onDelete={onDelete} 
                        onEdit={onEdit}
                        onViewDetail={onViewDetail}
                        member={member} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/40 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center">
                    <p className="text-slate-400 font-bold text-sm">아직 {member.name} 님이 등록한 프로젝트가 없습니다.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white transition-colors">공유 피드</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onDelete={onDelete} 
            onEdit={onEdit}
            onViewDetail={onViewDetail}
            member={members.find(m => m.id === project.ownerId)} 
          />
        ))}
      </div>
    </section>
  );
};

// --- Knowhow Section ---
interface KnowhowSectionProps {
  knowhows: Knowhow[];
  members: Member[];
  onDelete: (id: string) => void;
  onEdit?: (kh: Knowhow) => void;
  onView?: (kh: Knowhow) => void;
}

export const KnowhowSection = ({ knowhows, onDelete, members, onEdit, onView }: KnowhowSectionProps) => {
  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm relative overflow-hidden transition-colors">
      <div className="absolute top-0 right-0 p-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-opacity text-slate-400 dark:text-blue-400">
        <Tag className="w-64 h-64 rotate-12" />
      </div>
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white transition-colors">빌더들의 지식 저장소</h2>
        </div>
        <button className="text-sm font-black text-blue-600 dark:text-blue-400 hover:underline">전체보기</button>
      </div>

      <div className="space-y-6 relative z-10">
        {knowhows.map(kh => {
          const author = members.find(m => m.id === kh.authorId);
          return (
            <div 
              key={kh.id} 
              onClick={() => onView?.(kh)}
              className="group bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800/10 p-6 rounded-[2rem] hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer"
            >
              <div className="flex items-start gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-white dark:bg-slate-950 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest shadow-sm">
                      {kh.category}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">
                      ID: {kh.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors mb-2">
                    {kh.title}
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-bold leading-relaxed mb-4">
                    {kh.summary}
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <img 
                        src={author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${kh.authorId}`} 
                        alt="author" 
                        className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400">{author?.name || kh.authorId}</span>
                    </div>
                    {kh.tags?.map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-slate-300 dark:text-slate-700">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(kh);
                    }}
                    className="p-2 text-slate-300 dark:text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(kh.id);
                    }}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-all hover:scale-110 active:scale-90 cursor-pointer z-20"
                    title="노하우 삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// --- Meeting Board ---
interface MeetingBoardProps {
  meeting: Meeting;
  onUpdateTitle: () => void;
  onUpdatePrinciple: () => void;
  onAddSchedule: () => void;
  onDeleteSchedule: (index: number) => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (index: number) => void;
}

export const MeetingBoard = ({ 
  meeting, 
  onUpdateTitle, 
  onUpdatePrinciple, 
  onAddSchedule, 
  onDeleteSchedule, 
  onAddQuestion, 
  onDeleteQuestion 
}: MeetingBoardProps) => {
  return (
    <div className="space-y-8">
      {/* Principle Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-blue-500/20 pointer-events-none group-hover:scale-110 transition-transform">
          <Monitor className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-tighter">Current Meeting</span>
            <button onClick={onUpdateTitle} className="text-white/40 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-2xl font-black mb-4 leading-tight">{meeting.title}</h2>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
              <div>
                <p className="text-blue-100 text-sm font-bold leading-relaxed">
                  {meeting.principle}
                </p>
                <button 
                  onClick={onUpdatePrinciple}
                  className="mt-3 text-[11px] font-black text-blue-400 hover:text-blue-300 flex items-center gap-1 group/btn"
                >
                  내용 수정하기
                  <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-slate-800 dark:text-white">모임 일정</h3>
          <button 
            onClick={onAddSchedule}
            className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-black"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {meeting.schedule.map((item, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{item.time}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{item.activity}</span>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSchedule(i);
                }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-all hover:scale-110 active:scale-90 cursor-pointer z-20"
                title="일정 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Common Questions */}
      <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-[2.5rem] p-10 transition-colors">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-indigo-800 dark:text-indigo-300">공통 질문</h3>
          <button 
            onClick={onAddQuestion}
            className="w-8 h-8 rounded-full border border-indigo-200/50 dark:border-indigo-800/30 flex items-center justify-center text-indigo-400 dark:text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {meeting.commonQuestions.map((q, i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-900/80 border border-white dark:border-white/5 p-4 rounded-2xl shadow-sm text-sm font-bold text-indigo-900/70 dark:text-indigo-300/70 group flex items-start gap-3 transition-colors">
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-sm">
                {i + 1}
              </div>
              <span className="flex-1">{q}</span>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteQuestion(i);
                }}
                className="p-2 text-indigo-500 dark:text-indigo-400 hover:text-rose-500 transition-all hover:scale-110 active:scale-90 cursor-pointer z-20"
                title="질문 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Free Board ---
interface FreeBoardProps {
  posts: any[];
  members: Member[];
  onDelete: (id: string) => void;
  onCreate: (content: string) => void;
  isDarkMode: boolean;
}

export const FreeBoard = ({ posts, members, onDelete, onCreate, isDarkMode }: FreeBoardProps) => {
  const [content, setContent] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onCreate(content);
    setContent('');
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tighter transition-colors uppercase`}>자유 게시판</h2>
          <p className="text-slate-400 font-bold text-sm">빌더들의 자유로운 생각과 이야기를 나누어주세요.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 shadow-sm mb-12 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="어떤 이야기를 나누고 싶으신가요? (마크다운 지원)"
            className={`w-full min-h-[150px] p-8 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-800 placeholder:text-slate-300'} outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-lg leading-relaxed`}
          />
          <div className="flex justify-end">
            <button 
              type="submit"
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 text-lg"
            >
              이야기 등록하기
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {posts.map(post => {
          const author = members.find(m => m.id === post.authorId);
          return (
            <div key={post.id} className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} shadow-sm transition-all group`}>
              <div className="flex items-start gap-6">
                <img 
                  src={author?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} 
                  alt="author" 
                  className="w-14 h-14 rounded-full bg-slate-100 shadow-sm ring-4 ring-white dark:ring-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className={`font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} text-lg tracking-tight`}>{author?.name || '익명 빌더'}</div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                    <button 
                      onClick={() => onDelete(post.id)}
                      className="p-3 text-slate-300 hover:text-rose-500 transition-all hover:bg-rose-50 rounded-2xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className={`text-lg font-bold leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {post.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {posts.length === 0 && (
          <div className={`py-40 text-center border-2 border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} rounded-[3rem]`}>
            <MessageSquare className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
            <p className="text-slate-400 font-bold text-lg">아직 등록된 이야기가 없습니다.<br/>첫 번째 이야기를 들려주세요!</p>
          </div>
        )}
      </div>
    </section>
  );
};
