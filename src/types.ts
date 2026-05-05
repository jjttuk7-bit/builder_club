/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Member {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
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
