import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 'p1',
    ownerId: 'm1',
    title: 'AI 디자인 어시스턴트 "Canvas AI"',
    description: '디자이너의 의도를 파악하여 레이아웃을 추천해주는 피그마 플러그인 프로젝트입니다.',
    problemDefinition: '디자이너들이 반복적인 레이아웃 작업에 너무 많은 시간을 할애하고 있습니다.',
    coreFeatures: '의도 파악 AI, 자동 레이아웃 생성, 커스텀 스타일 적용',
    status: '제작중',
    progress: 65,
    thisWeekGoal: 'AI 레이아웃 추천 알고리즘 고도화',
    thisWeekResult: '기본적인 레이션 배치 로직 구현 완료',
    blocker: 'OpenAI API 응답 속도 지연 이슈',
    helpRequest: 'Prompt Engineering에 능숙하신 분의 조언이 필요합니다.',
    actionType: 'demo',
    actionLabel: '데모'
  },
  {
    id: 'p2',
    ownerId: 'm3',
    title: '동네 러닝 매칭 플랫폼 "런토더"',
    description: '가까운 이웃과 함께 달릴 수 있도록 러닝 크루를 매칭해주는 서비스입니다.',
    problemDefinition: '혼자 달리기를 지속하기 어려운 초보 러너들이 동기부여를 얻을 곳이 부족합니다.',
    coreFeatures: '러닝 크루 매칭, 실시간 위치 공유, 거리 측정 및 랭킹',
    status: '배포준비',
    progress: 90,
    thisWeekGoal: '푸시 알림 기능 QA 및 버그 수정',
    thisWeekResult: '안드로이드/iOS 알림 전송 테스트 통과',
    blocker: '없음',
    helpRequest: '마케팅 전략 수립에 도움 주실 분!',
    actionType: 'link',
    actionLabel: '서비스'
  }
];
