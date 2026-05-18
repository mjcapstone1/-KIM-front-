export type InvestmentType = "stable" | "balanced" | "aggressive" | "daytrader";

export interface LessonStep {
  id: string;
  type: InvestmentType;
  step: number;
  title: string;
  duration: string;
  description: string;
}

export interface LessonContent {
  sections: Array<{ title: string; content: string }>;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

export const investmentTypes: Record<InvestmentType, {
  name: string;
  shortName: string;
  badge: string;
  tone: string;
  border: string;
  bg: string;
  description: string;
  points: string[];
}> = {
  stable: {
    name: "안정형 투자자",
    shortName: "안정형",
    badge: "방어",
    tone: "from-emerald-400 to-teal-500",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    description: "원금 보존과 장기적 안정성을 우선합니다.",
    points: ["우량주와 배당주 중심", "분산 투자", "긴 호흡의 자산 관리"],
  },
  balanced: {
    name: "균형형 투자자",
    shortName: "균형형",
    badge: "균형",
    tone: "from-sky-400 to-blue-500",
    border: "border-sky-300",
    bg: "bg-sky-50",
    description: "수익성과 리스크의 균형을 함께 봅니다.",
    points: ["가치주와 성장주 조합", "PER/PBR 분석", "포트폴리오 리밸런싱"],
  },
  aggressive: {
    name: "공격형 투자자",
    shortName: "공격형",
    badge: "성장",
    tone: "from-violet-400 to-fuchsia-500",
    border: "border-violet-300",
    bg: "bg-violet-50",
    description: "높은 성장성과 변동성을 적극적으로 활용합니다.",
    points: ["성장주 발굴", "테마 흐름 파악", "손실 제한 규칙"],
  },
  daytrader: {
    name: "단타형 투자자",
    shortName: "단타형",
    badge: "속도",
    tone: "from-amber-400 to-rose-500",
    border: "border-amber-300",
    bg: "bg-amber-50",
    description: "짧은 시간 안의 가격 흐름과 거래량을 중시합니다.",
    points: ["캔들 패턴", "기술적 지표", "빠른 손절과 익절"],
  },
};

export const learningCurriculum: Record<InvestmentType, LessonStep[]> = {
  stable: [
    { id: "stable-1", type: "stable", step: 1, title: "안정형 투자자란?", duration: "5분", description: "위험을 최소화하는 투자 철학 이해하기" },
    { id: "stable-2", type: "stable", step: 2, title: "배당주 투자 기초", duration: "10분", description: "안정적인 현금흐름을 만드는 방법" },
    { id: "stable-3", type: "stable", step: 3, title: "우량주 선별 방법", duration: "15분", description: "재무 안정성과 시장 지위를 확인하기" },
    { id: "stable-4", type: "stable", step: 4, title: "장기 투자 전략", duration: "10분", description: "복리와 시간의 힘을 활용하기" },
    { id: "stable-5", type: "stable", step: 5, title: "리스크 관리", duration: "10분", description: "분산 투자와 손실 제한 원칙" },
  ],
  balanced: [
    { id: "balanced-1", type: "balanced", step: 1, title: "균형형 투자자란?", duration: "5분", description: "위험과 수익의 균형점 찾기" },
    { id: "balanced-2", type: "balanced", step: 2, title: "가치주 vs 성장주", duration: "10분", description: "두 스타일의 장단점 비교" },
    { id: "balanced-3", type: "balanced", step: 3, title: "PER & PBR 분석", duration: "15분", description: "기본 투자 지표로 기업 바라보기" },
    { id: "balanced-4", type: "balanced", step: 4, title: "기술적 분석 기초", duration: "15분", description: "이동평균선과 추세 확인" },
    { id: "balanced-5", type: "balanced", step: 5, title: "포트폴리오 구성", duration: "10분", description: "비중 조절로 변동성 낮추기" },
  ],
  aggressive: [
    { id: "aggressive-1", type: "aggressive", step: 1, title: "공격형 투자자란?", duration: "5분", description: "고수익 전략의 전제 조건" },
    { id: "aggressive-2", type: "aggressive", step: 2, title: "성장주 발굴", duration: "15분", description: "매출 성장과 시장 확장성 보기" },
    { id: "aggressive-3", type: "aggressive", step: 3, title: "테마주 투자 전략", duration: "15분", description: "뉴스와 수급의 연결 읽기" },
    { id: "aggressive-4", type: "aggressive", step: 4, title: "레버리지 이해", duration: "10분", description: "수익 확대와 손실 확대를 함께 이해" },
    { id: "aggressive-5", type: "aggressive", step: 5, title: "고급 트레이딩", duration: "15분", description: "모멘텀과 스윙 전략 정리" },
  ],
  daytrader: [
    { id: "daytrader-1", type: "daytrader", step: 1, title: "데이트레이딩의 실체", duration: "5분", description: "단기 매매의 장점과 위험" },
    { id: "daytrader-2", type: "daytrader", step: 2, title: "캔들스틱 완전정복", duration: "15분", description: "캔들 패턴으로 심리 읽기" },
    { id: "daytrader-3", type: "daytrader", step: 3, title: "볼린저 밴드와 거래량 분석", duration: "15분", description: "과열과 침체 구간 확인" },
    { id: "daytrader-4", type: "daytrader", step: 4, title: "스캘핑 전략", duration: "15분", description: "초단기 진입과 청산 기준" },
    { id: "daytrader-5", type: "daytrader", step: 5, title: "실시간 시장 대응", duration: "10분", description: "빠른 판단과 손절 원칙" },
  ],
};

const buildLesson = (lesson: LessonStep): LessonContent => {
  const type = investmentTypes[lesson.type];
  return {
    sections: [
      {
        title: `${lesson.step}단계 핵심 개념`,
        content: `${lesson.title}은 ${type.shortName} 투자자가 실제 시뮬레이터에 들어가기 전에 반드시 알아야 하는 기초입니다.\n\n${lesson.description}\n\n발표용 흐름에서는 투자 성향에 맞는 5단계 학습을 먼저 완료하고, 이후 가상 투자 화면으로 진입합니다.`,
      },
      {
        title: "실전 적용 포인트",
        content: `${type.points.map((point) => `• ${point}`).join("\n")}\n\n학습 후에는 종목 리스트, 차트, 호가창, 주문 패널에서 같은 원칙을 적용해볼 수 있습니다.`,
      },
      {
        title: "핵심 정리",
        content: `• 투자 판단은 성향에 맞는 기준에서 시작합니다.\n• 손실 가능성을 먼저 확인한 뒤 수익 기회를 봅니다.\n• 퀴즈를 통과하면 다음 단계가 열립니다.`,
      },
    ],
    quiz: [
      {
        question: `${type.shortName} 투자자가 가장 먼저 확인해야 할 것은 무엇인가요?`,
        options: ["유행하는 종목명", "자신의 투자 기준과 위험 허용 범위", "친구가 산 종목", "가격이 가장 싼 종목"],
        correctAnswer: 1,
        explanation: "발표용 학습 흐름의 핵심은 투자 성향에 맞는 기준을 먼저 세우는 것입니다.",
      },
      {
        question: "학습 단계를 순서대로 완료해야 하는 이유는 무엇인가요?",
        options: ["시뮬레이터 접근을 단계적으로 해금하기 위해", "화면을 느리게 만들기 위해", "회원가입을 다시 하기 위해", "뉴스 기능을 없애기 위해"],
        correctAnswer: 0,
        explanation: "index.html 기준 플로우는 학습 완료 기록을 기준으로 시뮬레이터 접근을 열어줍니다.",
      },
      {
        question: "가상 투자에서 가장 적절한 태도는 무엇인가요?",
        options: ["무조건 전액 매수", "규칙 없이 빠르게 매매", "학습한 기준을 적용하고 결과를 점검", "손실 종목만 계속 추가 매수"],
        correctAnswer: 2,
        explanation: "시뮬레이터는 학습한 내용을 위험 없이 연습하는 공간입니다.",
      },
    ],
  };
};

export const lessonContent = Object.values(learningCurriculum)
  .flat()
  .reduce<Record<string, LessonContent>>((acc, lesson) => {
    acc[lesson.id] = buildLesson(lesson);
    return acc;
  }, {});

type LearningUser = {
  userId?: string | null;
  email?: string | null;
} | null | undefined;

const LEGACY_INVESTMENT_TYPE_KEY = "investmentType";
const LEGACY_COMPLETED_LESSONS_KEY = "completedLessons";
const LEARNING_STORAGE_PREFIX = "aiLearning";

export const getLearningStorageScope = (user?: LearningUser) => {
  const raw = user?.userId || user?.email || "anonymous";
  return String(raw).trim().replace(/[^a-zA-Z0-9_.@-]/g, "_") || "anonymous";
};

const investmentTypeKey = (scope = "anonymous") => `${LEARNING_STORAGE_PREFIX}:${scope}:investmentType`;
const completedLessonsKey = (scope = "anonymous") => `${LEARNING_STORAGE_PREFIX}:${scope}:completedLessons`;

export const readInvestmentType = (scope = "anonymous"): InvestmentType | null => {
  const value = localStorage.getItem(investmentTypeKey(scope));
  return value === "stable" || value === "balanced" || value === "aggressive" || value === "daytrader"
    ? value
    : null;
};

export const saveInvestmentType = (type: InvestmentType | null, scope = "anonymous") => {
  if (type) {
    localStorage.setItem(investmentTypeKey(scope), type);
  } else {
    localStorage.removeItem(investmentTypeKey(scope));
  }
};

export const getCompletedLessons = (scope = "anonymous") => {
  try {
    const parsed = JSON.parse(localStorage.getItem(completedLessonsKey(scope)) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

export const saveCompletedLessons = (lessons: string[], scope = "anonymous") => {
  localStorage.setItem(completedLessonsKey(scope), JSON.stringify(lessons));
};

export const resetCompletedLessonsForType = (type: InvestmentType, scope = "anonymous") => {
  const typeLessonIds = new Set(learningCurriculum[type].map((lesson) => lesson.id));
  const next = getCompletedLessons(scope).filter((lessonId) => !typeLessonIds.has(lessonId));
  saveCompletedLessons(next, scope);
  return next;
};

export const clearLegacyLearningStorage = () => {
  localStorage.removeItem(LEGACY_INVESTMENT_TYPE_KEY);
  localStorage.removeItem(LEGACY_COMPLETED_LESSONS_KEY);
};

export const isLearningCompleted = (type: InvestmentType | null, scope = "anonymous") => {
  if (!type) return false;
  const completed = getCompletedLessons(scope);
  return learningCurriculum[type].every((lesson) => completed.includes(lesson.id));
};
