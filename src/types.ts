/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  specialties?: string[];
}

export interface Milestone {
  week: number;
  content: string;
  status: '준비중' | '진행중' | '완료';
}

export interface ProjectFeedback {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  problemDefinition: string;
  coreFeatures: string;
  status: '기획' | '제작중' | '테스트중' | '배포준비' | '완료';
  progress: number;
  thisWeekGoal: string;
  thisWeekResult: string;
  blocker: string;
  helpRequest: string;
  actionType: 'demo' | 'link' | 'none';
  actionLabel: string;
  milestones?: Milestone[];
  feedbacks?: ProjectFeedback[];
}

export interface Knowhow {
  id: string;
  authorId: string;
  title: string;
  category: string;
  summary: string;
  content?: string;
  tags?: string[];
}

export interface Meeting {
  title: string;
  principle: string;
  schedule: {
    time: string;
    activity: string;
  }[];
  commonQuestions: string[];
}

export interface FreeBoardPost {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface FreeBoardComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface MarketingPost {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface MarketingComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface BuilderMemo {
  id: string;
  authorId: string;
  projectId?: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface ScratchpadNote {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}
