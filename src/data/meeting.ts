import { Meeting } from '../types';

export const meeting: Meeting = {
  title: '제 12회 빌더스 정기 모임',
  principle: '오늘의 목표: 각 프로젝트의 핵심 가치 명확화 및 네트워킹',
  schedule: [
    { time: '14:00 - 14:10', activity: '모임 오프닝 및 환영사' },
    { time: '14:10 - 15:30', activity: '프로젝트 주차별 성과 공유 (피치)' },
    { time: '15:30 - 16:00', activity: '네트워킹 및 집중 커피 톡' },
    { time: '16:00 - 17:50', activity: '그룹별 코워킹 및 협업 논의' },
    { time: '17:50 - 18:00', activity: '랩업 및 다음 모임 안내' }
  ],
  commonQuestions: [
    '지난 한 주간 가장 어려웠던 문제는 무엇인가요?',
    '팀원들에게 도움을 요청하고 싶은 부분이 있나요?',
    '다음 주에 반드시 달성하고 싶은 "One Thing"은?'
  ]
};
