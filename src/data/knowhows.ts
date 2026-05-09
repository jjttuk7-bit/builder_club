import { Knowhow } from '../types';

export const knowhows: Knowhow[] = [
  {
    id: 'k1',
    authorId: 'm2',
    title: 'Vite 6와 React 19 마이그레이션 삽질기',
    category: '개발',
    summary: '새로운 라이브러리 호환성 문제와 HMR 최적화 팁을 공유합니다.',
    tags: ['React', 'Vite', 'Frontend']
  },
  {
    id: 'k2',
    authorId: 'm4',
    title: '초기 유저 100명 모으는 가장 빠른 방법',
    category: '기획',
    summary: '비용 없이 커뮤니티만을 활용해 초기 트래픽을 확보한 전략입니다.',
    tags: ['Marketing', 'Growth']
  },
  {
    id: 'k3',
    authorId: 'm1',
    title: 'Tailwind CSS로 2배 더 빠르게 디자인하기',
    category: '디자인',
    summary: '디자인 시스템 없이도 일관성 있는 UI를 구축하는 클래스 사용 노하우.',
    tags: ['Design', 'Tailwind']
  }
];
