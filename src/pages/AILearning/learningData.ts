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

type LessonSpecificContent = {
  overviewTitle: string;
  overview: string;
  checklistTitle: string;
  checklist: string[];
  practiceTitle: string;
  practice: string;
  quiz: LessonContent["quiz"];
};

const formatBullets = (items: string[]) => items.map((item) => `• ${item}`).join("\n");

const lessonSpecificContent: Record<string, LessonSpecificContent> = {
  "stable-1": {
    overviewTitle: "안정형의 첫 기준",
    overview: "안정형 투자는 수익을 포기하는 방식이 아니라, 감당 가능한 변동성 안에서 오래 살아남는 방식입니다. 가격이 흔들려도 버틸 수 있는 종목과 비중을 먼저 정합니다.",
    checklistTitle: "안정형 투자자가 먼저 보는 것",
    checklist: ["최근 3년 이상 꾸준한 매출과 이익", "부채비율과 현금흐름", "가격 변동폭이 너무 큰지 여부"],
    practiceTitle: "시뮬레이터 적용",
    practice: "종목 상세에서 현재가보다 먼저 거래대금, 변동률, 장기 차트를 확인해보세요. 안정형은 빨리 사는 것보다 오래 보유할 수 있는 이유를 찾는 연습이 중요합니다.",
    quiz: [
      { question: "안정형 투자자가 가장 먼저 정해야 하는 기준은?", options: ["하루 수익률 목표", "감당 가능한 손실과 변동성", "가장 급등한 종목", "게시판 인기 순위"], correctAnswer: 1, explanation: "안정형은 수익보다 먼저 위험 허용 범위를 정해야 오래 버틸 수 있습니다." },
      { question: "안정형 종목을 볼 때 상대적으로 중요한 항목은?", options: ["종목명의 유행성", "현금흐름과 부채 수준", "당일 검색량", "차트 색깔"], correctAnswer: 1, explanation: "재무 안정성과 현금흐름은 안정형 투자 판단의 핵심입니다." },
      { question: "안정형 투자에 어울리는 태도는?", options: ["전액 단기 매수", "분산하고 오래 점검하기", "손실 나면 기준 없이 물타기", "뉴스 제목만 보고 매수"], correctAnswer: 1, explanation: "분산과 장기 점검은 안정형 투자자의 기본 습관입니다." },
    ],
  },
  "stable-2": {
    overviewTitle: "배당은 현금흐름입니다",
    overview: "배당주는 주가 상승만 기다리는 대신 기업이 벌어들인 이익 일부를 현금으로 받는 투자입니다. 배당률만 높다고 좋은 것은 아니며, 배당을 계속 줄 수 있는 체력이 더 중요합니다.",
    checklistTitle: "배당주 체크포인트",
    checklist: ["배당수익률이 지나치게 높아진 이유", "순이익과 영업현금흐름", "배당성향이 무리하지 않은지"],
    practiceTitle: "실전 판단",
    practice: "배당주는 가격이 급락해서 배당률만 높아 보이는 함정이 있습니다. 차트가 무너진 이유와 실적 흐름을 함께 확인해야 합니다.",
    quiz: [
      { question: "배당주에서 배당률만 보고 사면 위험한 이유는?", options: ["배당률은 항상 고정이라서", "주가 급락으로 착시가 생길 수 있어서", "배당주는 거래가 안 돼서", "배당주는 차트가 없어서"], correctAnswer: 1, explanation: "주가가 크게 떨어지면 배당률이 높아 보일 수 있지만 기업 체력이 약해졌을 수도 있습니다." },
      { question: "배당 지속 가능성을 볼 때 중요한 것은?", options: ["기업 로고", "현금흐름", "당일 호가창 색", "주주 게시판 수"], correctAnswer: 1, explanation: "배당은 실제 현금이 나가는 일이므로 현금흐름 확인이 중요합니다." },
      { question: "배당성향이 너무 높다는 것은?", options: ["이익 대부분을 배당으로 써서 부담이 클 수 있음", "항상 좋은 신호", "거래량이 낮다는 뜻", "상장폐지 확정"], correctAnswer: 0, explanation: "이익 대비 배당 지급이 과하면 미래 투자나 배당 유지에 부담이 됩니다." },
    ],
  },
  "stable-3": {
    overviewTitle: "우량주의 조건",
    overview: "우량주는 유명한 회사라는 뜻만은 아닙니다. 시장 지위, 재무 체력, 이익 지속성, 위기 대응력이 함께 확인되어야 합니다.",
    checklistTitle: "우량주 선별 순서",
    checklist: ["업종 내 점유율과 경쟁력", "매출과 이익의 꾸준함", "큰 하락 후 회복한 이력"],
    practiceTitle: "종목 리스트 활용",
    practice: "인기 종목보다 거래대금 상위와 장기 차트를 함께 보세요. 우량주는 단기 급등보다 꾸준한 수급과 실적 기반이 중요합니다.",
    quiz: [
      { question: "우량주 판단에서 가장 가까운 기준은?", options: ["이름이 익숙함", "지속적인 이익과 시장 지위", "오늘만 급등", "가격이 제일 낮음"], correctAnswer: 1, explanation: "우량주는 익숙함이 아니라 사업 경쟁력과 이익 지속성으로 판단합니다." },
      { question: "우량주도 손실이 날 수 있나요?", options: ["절대 안 난다", "시장 상황에 따라 손실 가능하다", "상장사라면 무조건 오른다", "거래량이 있으면 안전하다"], correctAnswer: 1, explanation: "우량주도 가격 변동과 경기 영향을 받으므로 비중 관리가 필요합니다." },
      { question: "우량주를 고를 때 피해야 할 태도는?", options: ["실적 확인", "업종 비교", "이름만 보고 매수", "장기 차트 확인"], correctAnswer: 2, explanation: "브랜드 인지도만으로 투자하면 실제 가치와 가격을 놓칠 수 있습니다." },
    ],
  },
  "stable-4": {
    overviewTitle: "장기 투자의 핵심",
    overview: "장기 투자는 그냥 오래 들고 있는 것이 아니라, 좋은 이유가 유지되는 동안 시간을 내 편으로 만드는 전략입니다. 기준이 깨지면 장기 보유도 다시 검토해야 합니다.",
    checklistTitle: "장기 보유 전 확인",
    checklist: ["투자 아이디어가 1년 뒤에도 유효한지", "실적이 꾸준히 쌓이는 구조인지", "하락 구간에서 추가 점검 기준이 있는지"],
    practiceTitle: "복리 관점",
    practice: "수익률보다 손실을 크게 피하는 것이 장기 성과를 지킵니다. 시뮬레이터에서 한 종목 몰빵보다 여러 종목 비중을 나눠보세요.",
    quiz: [
      { question: "장기 투자의 올바른 의미는?", options: ["아무 종목이나 오래 방치", "투자 이유가 유지되는 동안 보유", "손실 종목만 계속 보유", "뉴스를 전혀 안 보기"], correctAnswer: 1, explanation: "장기 투자는 근거가 유지될 때 의미가 있습니다." },
      { question: "복리 효과를 해치는 행동은?", options: ["큰 손실을 방치", "분산 투자", "정기 점검", "비중 관리"], correctAnswer: 0, explanation: "큰 손실은 회복에 더 큰 수익률을 요구하므로 복리 성과를 훼손합니다." },
      { question: "장기 투자자가 정기적으로 해야 할 일은?", options: ["매분 매수", "투자 아이디어 점검", "호가창만 보기", "종목명 바꾸기"], correctAnswer: 1, explanation: "장기 보유 중에도 실적과 투자 근거는 정기적으로 확인해야 합니다." },
    ],
  },
  "stable-5": {
    overviewTitle: "안정형 리스크 관리",
    overview: "안정형에게 리스크 관리는 수익을 줄이는 장치가 아니라, 다음 기회를 남기는 장치입니다. 종목 수, 현금 비중, 손절 기준을 사전에 정합니다.",
    checklistTitle: "위험을 낮추는 세 가지",
    checklist: ["한 종목 비중 제한", "업종 분산", "현금 여력 확보"],
    practiceTitle: "주문 전 마지막 질문",
    practice: "매수 버튼을 누르기 전 '이 종목이 10% 하락해도 계획이 있는가?'를 확인하세요. 답이 없으면 수량을 줄이는 것이 안정형에 맞습니다.",
    quiz: [
      { question: "리스크 관리의 목적은?", options: ["수익 기회를 모두 없애기", "다음 기회를 남기기", "무조건 현금만 보유", "거래를 금지하기"], correctAnswer: 1, explanation: "리스크 관리는 손실을 통제해 다음 투자 기회를 지키는 과정입니다." },
      { question: "분산 투자의 효과는?", options: ["모든 손실 제거", "특정 종목 충격 완화", "수익률 고정", "차트 삭제"], correctAnswer: 1, explanation: "분산은 한 종목 리스크가 전체 자산에 미치는 충격을 줄입니다." },
      { question: "안정형에게 현금 비중이 필요한 이유는?", options: ["아무것도 안 하기 위해", "변동성과 기회에 대응하기 위해", "수익률 계산을 피하기 위해", "배당을 못 받기 위해"], correctAnswer: 1, explanation: "현금은 하락장 방어와 좋은 가격의 매수 기회를 동시에 줍니다." },
    ],
  },
  "balanced-1": {
    overviewTitle: "균형형의 생각법",
    overview: "균형형은 안정성과 성장성을 둘 다 봅니다. 한쪽으로 치우치지 않기 위해 기대수익, 손실 가능성, 투자 기간을 함께 비교합니다.",
    checklistTitle: "균형 판단 질문",
    checklist: ["이 종목의 상승 이유가 명확한가", "하락했을 때 버틸 근거가 있는가", "포트폴리오 안에서 비중이 과하지 않은가"],
    practiceTitle: "수익과 위험 같이 보기",
    practice: "현재가와 등락률만 보지 말고 거래대금, 장기 추세, 업종 흐름을 함께 확인하세요. 균형형은 여러 신호를 합쳐 판단합니다.",
    quiz: [
      { question: "균형형 투자자가 중시하는 것은?", options: ["수익만 보기", "위험과 수익의 균형", "가장 싼 가격", "친구 추천"], correctAnswer: 1, explanation: "균형형은 기대수익과 리스크를 동시에 비교합니다." },
      { question: "균형형 포트폴리오에 가까운 것은?", options: ["한 종목 100%", "성장주와 안정주 조합", "현금 0%", "무조건 급등주"], correctAnswer: 1, explanation: "서로 다른 성격의 자산을 섞어 변동성을 낮춥니다." },
      { question: "균형형이 피해야 할 행동은?", options: ["비중 조절", "근거 확인", "한쪽 스타일 몰빵", "분산 투자"], correctAnswer: 2, explanation: "균형형은 특정 스타일에 과도하게 몰리는 것을 조심해야 합니다." },
    ],
  },
  "balanced-2": {
    overviewTitle: "가치주와 성장주",
    overview: "가치주는 현재 가치보다 싸게 거래되는 기업을 찾고, 성장주는 앞으로 커질 이익을 봅니다. 둘은 장단점이 달라 함께 비교해야 합니다.",
    checklistTitle: "스타일별 확인 포인트",
    checklist: ["가치주: 저평가 이유가 해소될 수 있는가", "성장주: 성장률이 둔화되지 않았는가", "두 스타일의 비중이 내 성향에 맞는가"],
    practiceTitle: "종목 비교",
    practice: "같은 업종 안에서 PER/PBR이 낮은 기업과 매출 성장률이 높은 기업을 비교해보세요. 숫자가 싼 이유와 비싼 이유를 찾는 것이 핵심입니다.",
    quiz: [
      { question: "가치주에 가까운 설명은?", options: ["미래 성장만 보는 기업", "현재 가치 대비 싸게 거래될 가능성", "항상 적자 기업", "거래량 없는 기업"], correctAnswer: 1, explanation: "가치주는 기업 가치 대비 낮은 가격에 주목합니다." },
      { question: "성장주에서 특히 확인할 것은?", options: ["성장률 지속 가능성", "종목 코드 길이", "게시글 수", "액면가"], correctAnswer: 0, explanation: "성장주는 미래 성장 기대가 가격에 반영되므로 성장 지속성이 중요합니다." },
      { question: "균형형에게 적절한 접근은?", options: ["가치주만 전액", "성장주만 전액", "두 스타일을 목적에 맞게 조합", "아무거나 랜덤 매수"], correctAnswer: 2, explanation: "균형형은 스타일을 섞어 리스크와 수익 기회를 조절합니다." },
    ],
  },
  "balanced-3": {
    overviewTitle: "PER와 PBR 읽기",
    overview: "PER는 이익 대비 가격, PBR은 자산 대비 가격을 보는 지표입니다. 낮다고 무조건 좋은 것도, 높다고 무조건 나쁜 것도 아닙니다.",
    checklistTitle: "지표 해석 순서",
    checklist: ["동일 업종 평균과 비교", "이익이 일시적인지 확인", "낮은 지표가 구조적 문제 때문인지 점검"],
    practiceTitle: "숫자에 이유 붙이기",
    practice: "PER/PBR은 결론이 아니라 질문입니다. 왜 싸거나 비싼지 뉴스, 실적, 업종 사이클을 함께 봐야 합니다.",
    quiz: [
      { question: "PER는 무엇을 비교하는 지표인가요?", options: ["거래량과 가격", "이익과 주가", "배당일과 날짜", "종목명과 업종"], correctAnswer: 1, explanation: "PER는 주가가 이익 대비 어느 정도 평가받는지 보는 지표입니다." },
      { question: "PBR이 낮을 때 바로 매수하면 안 되는 이유는?", options: ["항상 오류라서", "자산 가치가 훼손 중일 수 있어서", "거래가 불가능해서", "배당이 금지돼서"], correctAnswer: 1, explanation: "낮은 PBR은 저평가일 수도 있지만 사업 부진 신호일 수도 있습니다." },
      { question: "PER/PBR을 해석할 때 가장 좋은 비교 대상은?", options: ["전혀 다른 업종", "동일 업종 평균", "랜덤 종목", "해외 환율"], correctAnswer: 1, explanation: "업종마다 적정 밸류에이션이 달라 같은 업종 비교가 필요합니다." },
    ],
  },
  "balanced-4": {
    overviewTitle: "이동평균과 추세",
    overview: "기술적 분석은 미래를 맞히는 마법이 아니라, 가격 흐름과 참여자 심리를 정리하는 도구입니다. 이동평균선은 추세의 방향을 보는 기본 도구입니다.",
    checklistTitle: "차트에서 보는 순서",
    checklist: ["현재 가격이 주요 이동평균 위인지 아래인지", "거래량이 추세를 뒷받침하는지", "지지선과 저항선이 어디인지"],
    practiceTitle: "진입 타이밍 조절",
    practice: "좋은 기업도 너무 급등한 자리에서는 위험할 수 있습니다. 차트를 통해 매수 가격을 나누는 연습을 해보세요.",
    quiz: [
      { question: "기술적 분석의 역할은?", options: ["무조건 정답 제공", "가격 흐름과 심리 정리", "재무제표 삭제", "시장 폐쇄"], correctAnswer: 1, explanation: "기술적 분석은 매수·매도 타이밍과 흐름을 이해하는 도구입니다." },
      { question: "이동평균선이 주로 보여주는 것은?", options: ["기업 대표 이름", "가격 추세", "배당금 지급일", "상장일"], correctAnswer: 1, explanation: "이동평균선은 일정 기간 가격 평균으로 추세를 보여줍니다." },
      { question: "거래량이 함께 중요한 이유는?", options: ["참여 강도를 보여주기 때문", "항상 가격을 고정해서", "뉴스를 없애서", "종목 코드를 바꿔서"], correctAnswer: 0, explanation: "거래량은 가격 움직임에 참여한 힘의 크기를 가늠하게 해줍니다." },
    ],
  },
  "balanced-5": {
    overviewTitle: "포트폴리오 구성",
    overview: "포트폴리오는 좋은 종목을 모아두는 것 이상입니다. 서로 다른 업종과 스타일을 섞어 전체 변동성을 관리하는 구조입니다.",
    checklistTitle: "구성 원칙",
    checklist: ["핵심 종목과 보조 종목 구분", "업종 쏠림 확인", "정기적으로 비중 리밸런싱"],
    practiceTitle: "비중 조절 연습",
    practice: "시뮬레이터에서 보유 종목 탭을 보며 특정 종목 비중이 지나치게 커지는지 확인하세요. 균형형은 수익 난 종목도 비중을 점검합니다.",
    quiz: [
      { question: "포트폴리오의 목적은?", options: ["종목 수만 늘리기", "전체 위험과 수익 구조 관리", "관심종목 숨기기", "뉴스 저장"], correctAnswer: 1, explanation: "포트폴리오는 전체 자산의 변동성과 기대수익을 조절하는 틀입니다." },
      { question: "리밸런싱이 필요한 경우는?", options: ["한 종목 비중이 과도하게 커졌을 때", "앱을 종료할 때", "종목명이 길 때", "검색 결과가 많을 때"], correctAnswer: 0, explanation: "가격 변동으로 비중이 틀어지면 원래 계획에 맞게 조정해야 합니다." },
      { question: "균형형 포트폴리오에서 피해야 할 것은?", options: ["업종 분산", "비중 관리", "동일 테마 과도 집중", "현금 일부 보유"], correctAnswer: 2, explanation: "같은 테마에 몰리면 실제로는 분산 효과가 약해집니다." },
    ],
  },
  "aggressive-1": {
    overviewTitle: "공격형의 전제",
    overview: "공격형 투자는 더 큰 수익을 노리는 대신 더 큰 변동성을 감수합니다. 중요한 것은 용기가 아니라 손실 제한 기준입니다.",
    checklistTitle: "공격 전 체크",
    checklist: ["손절 가격을 정했는가", "왜 오를 수 있는지 근거가 있는가", "비중이 전체 자산을 위협하지 않는가"],
    practiceTitle: "수익보다 먼저 손실 계산",
    practice: "매수 전 예상 손실액을 먼저 계산하세요. 공격형은 방향이 틀렸을 때 빠르게 인정하는 능력이 중요합니다.",
    quiz: [
      { question: "공격형 투자에서 가장 먼저 필요한 것은?", options: ["무조건 자신감", "손실 제한 기준", "최대 대출", "랜덤 매수"], correctAnswer: 1, explanation: "변동성이 큰 전략일수록 손실 제한 기준이 먼저 필요합니다." },
      { question: "공격형에게 큰 비중 투자가 위험한 이유는?", options: ["수익률 계산이 안 돼서", "한 번의 실패가 전체 자산을 크게 흔들 수 있어서", "차트가 사라져서", "거래가 금지돼서"], correctAnswer: 1, explanation: "고변동 종목은 비중이 커질수록 계좌 전체 위험이 커집니다." },
      { question: "좋은 공격형 매매에 가까운 것은?", options: ["근거와 손절선을 같이 설정", "소문만 보고 전액 매수", "손실을 무조건 방치", "익절 기준 없음"], correctAnswer: 0, explanation: "공격형도 계획과 기준이 있어야 지속 가능합니다." },
    ],
  },
  "aggressive-2": {
    overviewTitle: "성장주 발굴",
    overview: "성장주는 현재 이익보다 앞으로 커질 시장과 매출을 봅니다. 다만 기대가 이미 가격에 많이 반영되어 있는지 확인해야 합니다.",
    checklistTitle: "성장성 체크",
    checklist: ["매출 성장률", "시장 규모와 침투율", "영업이익 개선 가능성"],
    practiceTitle: "비싼 이유 찾기",
    practice: "성장주는 PER가 높아도 설명 가능한 경우가 있습니다. 반대로 성장 둔화가 보이면 높은 가격이 부담이 됩니다.",
    quiz: [
      { question: "성장주에서 중요한 것은?", options: ["과거 가격만", "미래 매출과 시장 확장성", "종목명 길이", "액면가"], correctAnswer: 1, explanation: "성장주는 미래 실적 확대 가능성이 핵심입니다." },
      { question: "성장주가 급락할 수 있는 상황은?", options: ["성장률 둔화", "거래소 개장", "앱 로그인", "종목 코드 유지"], correctAnswer: 0, explanation: "높은 기대가 꺾이면 주가가 크게 조정될 수 있습니다." },
      { question: "성장주 투자에서 필요한 질문은?", options: ["왜 비싼가 설명 가능한가", "왜 이름이 짧은가", "왜 색이 빨간가", "왜 알림이 뜨는가"], correctAnswer: 0, explanation: "높은 밸류에이션을 정당화할 성장 근거가 필요합니다." },
    ],
  },
  "aggressive-3": {
    overviewTitle: "테마주의 흐름",
    overview: "테마주는 뉴스, 정책, 산업 기대, 수급이 결합해 빠르게 움직입니다. 테마가 실제 실적으로 연결되는지와 단기 과열 여부를 함께 봐야 합니다.",
    checklistTitle: "테마 확인 순서",
    checklist: ["테마가 일회성 뉴스인지 구조적 변화인지", "대장주와 후발주의 차이", "거래대금이 실제로 붙는지"],
    practiceTitle: "뉴스와 거래대금 연결",
    practice: "홈의 테마/뉴스와 종목 리스트 거래대금을 함께 보세요. 테마는 말보다 돈이 들어오는지가 중요합니다.",
    quiz: [
      { question: "테마주에서 거래대금이 중요한 이유는?", options: ["시장 관심과 수급 강도를 보여줘서", "기업 이름을 바꿔서", "배당금을 확정해서", "차트를 숨겨서"], correctAnswer: 0, explanation: "거래대금은 테마에 실제 참여가 있는지 확인하는 지표입니다." },
      { question: "테마주 투자에서 조심할 점은?", options: ["뉴스가 실적으로 이어지는지 확인", "뉴스 제목만 보고 전액 매수", "손절 기준 설정", "과열 여부 확인"], correctAnswer: 1, explanation: "뉴스 제목만 보고 따라가면 고점 매수 위험이 큽니다." },
      { question: "대장주의 의미에 가까운 것은?", options: ["테마 내 수급과 관심이 가장 강한 종목", "가격이 가장 싼 종목", "이름이 가장 긴 종목", "항상 손실인 종목"], correctAnswer: 0, explanation: "대장주는 테마 흐름에서 시장의 관심과 자금이 집중되는 종목입니다." },
    ],
  },
  "aggressive-4": {
    overviewTitle: "레버리지의 양면",
    overview: "레버리지는 수익과 손실을 동시에 확대합니다. 작은 방향 오류도 큰 손실로 커질 수 있어 진입 기준과 청산 기준이 더 엄격해야 합니다.",
    checklistTitle: "레버리지 전제 조건",
    checklist: ["최대 손실액 계산", "강제 청산 위험 이해", "짧은 기간에만 제한적으로 사용"],
    practiceTitle: "가상 투자에서 먼저 실험",
    practice: "실제 레버리지를 쓰기 전 시뮬레이터에서 같은 비중 확대 상황을 가정해보세요. 손실이 얼마나 빨리 커지는지 체감하는 것이 중요합니다.",
    quiz: [
      { question: "레버리지의 핵심 특징은?", options: ["손실만 줄임", "수익과 손실을 모두 확대", "위험이 없음", "장기 보유 필수"], correctAnswer: 1, explanation: "레버리지는 방향이 맞으면 수익, 틀리면 손실을 모두 키웁니다." },
      { question: "레버리지 사용 전 반드시 필요한 것은?", options: ["최대 손실액 계산", "감으로 매수", "뉴스 제목 저장", "앱 재설치"], correctAnswer: 0, explanation: "레버리지는 손실 속도가 빠르므로 사전 손실 계산이 필수입니다." },
      { question: "레버리지에 부적절한 태도는?", options: ["손절 기준 설정", "비중 제한", "무한 보유", "짧은 기간 점검"], correctAnswer: 2, explanation: "레버리지는 장기 방치 시 손실이 커질 수 있어 관리가 필요합니다." },
    ],
  },
  "aggressive-5": {
    overviewTitle: "모멘텀과 스윙",
    overview: "고급 트레이딩은 상승 흐름이 살아있는 구간을 포착하고, 흐름이 꺾이면 빠르게 나오는 전략입니다. 진입보다 청산이 더 어렵습니다.",
    checklistTitle: "트레이딩 규칙",
    checklist: ["진입 근거", "목표가와 손절가", "거래량 감소 시 대응"],
    practiceTitle: "기록하기",
    practice: "매매 후 왜 들어갔고 왜 나왔는지 기록하세요. 공격형은 성공보다 반복 가능한 규칙을 만드는 것이 중요합니다.",
    quiz: [
      { question: "모멘텀 매매의 핵심은?", options: ["흐름이 살아있는 구간 활용", "거래량 없는 종목 고르기", "손절가 없음", "항상 최저가 매수"], correctAnswer: 0, explanation: "모멘텀은 가격과 수급 흐름이 강한 구간을 활용합니다." },
      { question: "스윙 전략에서 중요한 것은?", options: ["보유 기간과 청산 기준", "종목명", "로고 색상", "회원가입 날짜"], correctAnswer: 0, explanation: "스윙은 며칠에서 몇 주의 흐름을 보므로 청산 기준이 중요합니다." },
      { question: "반복 가능한 트레이딩을 위해 필요한 것은?", options: ["매매 기록", "감정적 추격매수", "기준 없는 물타기", "결과 숨기기"], correctAnswer: 0, explanation: "기록은 어떤 규칙이 통하는지 확인하게 해줍니다." },
    ],
  },
  "daytrader-1": {
    overviewTitle: "데이트레이딩의 현실",
    overview: "데이트레이딩은 하루 안의 가격 변동을 이용하지만, 수수료와 실수 비용이 빠르게 쌓입니다. 빠른 판단보다 더 중요한 것은 매매하지 않을 기준입니다.",
    checklistTitle: "단타 전 확인",
    checklist: ["오늘 거래대금이 충분한가", "손절선이 짧고 명확한가", "진입 이유가 차트와 수급으로 설명되는가"],
    practiceTitle: "무리한 진입 줄이기",
    practice: "급등률만 보지 말고 거래대금 순위와 분봉 흐름을 같이 보세요. 단타는 움직이는 종목을 찾되 늦게 따라붙지 않는 것이 핵심입니다.",
    quiz: [
      { question: "데이트레이딩에서 특히 중요한 것은?", options: ["매매하지 않을 기준", "무조건 많은 거래", "장기 배당률", "종목명"], correctAnswer: 0, explanation: "단타는 기회가 많아 보여도 기준 없는 진입이 손실을 키웁니다." },
      { question: "단타 종목에서 거래대금이 중요한 이유는?", options: ["체결과 탈출 가능성을 높여서", "배당을 늘려서", "PER를 고정해서", "뉴스를 없애서"], correctAnswer: 0, explanation: "거래대금이 부족하면 원하는 가격에 사고팔기 어렵습니다." },
      { question: "단타에서 피해야 할 행동은?", options: ["손절선 설정", "추격 매수 남발", "거래량 확인", "진입 이유 기록"], correctAnswer: 1, explanation: "늦은 추격 매수는 고점 매수로 이어질 수 있습니다." },
    ],
  },
  "daytrader-2": {
    overviewTitle: "캔들은 심리의 흔적",
    overview: "캔들스틱은 한 기간 동안의 시가, 고가, 저가, 종가를 보여줍니다. 긴 꼬리, 장대양봉, 장대음봉은 참여자 심리를 읽는 단서가 됩니다.",
    checklistTitle: "캔들 해석 포인트",
    checklist: ["몸통과 꼬리의 길이", "이전 캔들과의 위치", "거래량 동반 여부"],
    practiceTitle: "패턴만 믿지 않기",
    practice: "같은 장대양봉도 거래량이 없으면 신뢰도가 낮습니다. 캔들은 반드시 위치와 거래량을 함께 봐야 합니다.",
    quiz: [
      { question: "캔들스틱이 보여주는 기본 정보는?", options: ["시가·고가·저가·종가", "기업 직원 수", "배당 기준일", "뉴스 개수"], correctAnswer: 0, explanation: "캔들은 한 기간의 네 가지 가격 정보를 보여줍니다." },
      { question: "긴 윗꼬리가 의미할 수 있는 것은?", options: ["고가에서 매도 압력이 나왔을 가능성", "무조건 상승 확정", "거래 정지", "배당 지급"], correctAnswer: 0, explanation: "윗꼬리는 위에서 밀렸다는 심리적 흔적일 수 있습니다." },
      { question: "캔들 패턴을 볼 때 함께 확인할 것은?", options: ["거래량", "앱 색상", "로그인 시간", "종목명 길이"], correctAnswer: 0, explanation: "거래량이 패턴의 신뢰도를 보강합니다." },
    ],
  },
  "daytrader-3": {
    overviewTitle: "볼린저 밴드와 거래량",
    overview: "볼린저 밴드는 가격이 평균에서 얼마나 벗어났는지 보여줍니다. 밴드 상단 돌파가 항상 매수 신호는 아니며, 거래량과 위치를 같이 봐야 합니다.",
    checklistTitle: "과열과 침체 구분",
    checklist: ["밴드 폭이 넓어지는지", "상단 돌파에 거래량이 붙는지", "중심선 이탈 시 힘이 약해지는지"],
    practiceTitle: "돌파와 되돌림",
    practice: "돌파 직후 추격하기보다 되돌림에서 지지되는지 확인해보세요. 거래량 없는 돌파는 실패할 가능성이 큽니다.",
    quiz: [
      { question: "볼린저 밴드는 무엇을 보는 도구인가요?", options: ["평균 대비 가격 위치와 변동성", "기업 배당 정책", "환율 고정", "회원 수"], correctAnswer: 0, explanation: "볼린저 밴드는 평균선과 변동성 범위를 함께 보여줍니다." },
      { question: "상단 밴드 돌파가 항상 매수 신호가 아닌 이유는?", options: ["과열 후 되돌림이 나올 수 있어서", "차트가 틀려서", "거래가 불가능해서", "종목 코드가 바뀌어서"], correctAnswer: 0, explanation: "돌파가 과열 신호일 수도 있어 거래량과 지지 확인이 필요합니다." },
      { question: "돌파 신뢰도를 높이는 요소는?", options: ["동반 거래량", "로고 색", "종목명", "앱 알림"], correctAnswer: 0, explanation: "거래량은 돌파에 실제 수급이 붙었는지 보여줍니다." },
    ],
  },
  "daytrader-4": {
    overviewTitle: "스캘핑은 속도보다 규칙",
    overview: "스캘핑은 아주 짧은 가격 차이를 노립니다. 수익폭이 작기 때문에 진입 가격, 체결 속도, 손절 기준이 조금만 흔들려도 손익이 바뀝니다.",
    checklistTitle: "스캘핑 체크",
    checklist: ["호가 간격과 스프레드", "즉시 손절 가능한 위치", "거래대금과 체결 강도"],
    practiceTitle: "초단기 매매 연습",
    practice: "가상 주문으로 목표가와 손절가를 먼저 정하고 진입하세요. 스캘핑은 오래 고민하는 전략이 아니라 미리 정한 규칙을 실행하는 전략입니다.",
    quiz: [
      { question: "스캘핑에서 수익폭이 작을 때 중요한 것은?", options: ["정확한 진입과 빠른 손절", "무조건 장기 보유", "배당락일", "기업 로고"], correctAnswer: 0, explanation: "작은 가격 차이를 노리므로 진입과 손절이 매우 중요합니다." },
      { question: "스프레드가 넓으면 위험한 이유는?", options: ["사고팔 때 비용이 커져서", "뉴스가 많아서", "배당이 줄어서", "차트가 커져서"], correctAnswer: 0, explanation: "호가 차이가 크면 짧은 매매에서 비용 부담이 커집니다." },
      { question: "스캘핑에 부적절한 행동은?", options: ["손절 기준 사전 설정", "체결 강도 확인", "손실을 장기 투자로 바꾸기", "목표가 설정"], correctAnswer: 2, explanation: "단타 실패를 장기 보유로 바꾸면 전략이 무너집니다." },
    ],
  },
  "daytrader-5": {
    overviewTitle: "실시간 대응 루틴",
    overview: "실시간 시장 대응은 빠른 클릭이 아니라 준비된 루틴입니다. 장 시작 전 관심종목, 기준 가격, 손절선, 뉴스 변수를 미리 정해야 합니다.",
    checklistTitle: "장중 루틴",
    checklist: ["관심종목 3~5개로 제한", "돌발 뉴스 확인", "손익 기준 도달 시 즉시 실행"],
    practiceTitle: "마지막 단계",
    practice: "시뮬레이터에서 예약주문과 즉시주문을 나눠 사용해보세요. 빠른 시장일수록 주문 전 기준이 명확해야 실수를 줄입니다.",
    quiz: [
      { question: "실시간 대응에서 가장 중요한 준비는?", options: ["관심종목과 기준 가격 사전 설정", "장중에 아무거나 찾기", "전액 매수", "차트 끄기"], correctAnswer: 0, explanation: "빠른 시장에서는 미리 정한 기준이 있어야 즉흥 매매를 줄일 수 있습니다." },
      { question: "관심종목을 너무 많이 두면 생기는 문제는?", options: ["집중력이 분산됨", "수익률이 자동 상승", "손실이 사라짐", "뉴스가 안 보임"], correctAnswer: 0, explanation: "단타는 빠른 판단이 필요하므로 관찰 대상을 줄이는 것이 좋습니다." },
      { question: "손익 기준에 도달했을 때 필요한 태도는?", options: ["계획대로 실행", "계속 미루기", "이유 없이 추가 매수", "기록 삭제"], correctAnswer: 0, explanation: "실시간 대응은 감정이 아니라 미리 정한 규칙 실행이 핵심입니다." },
    ],
  },
};

const buildLesson = (lesson: LessonStep): LessonContent => {
  const specific = lessonSpecificContent[lesson.id];
  if (specific) {
    return {
      sections: [
        { title: specific.overviewTitle, content: specific.overview },
        { title: specific.checklistTitle, content: formatBullets(specific.checklist) },
        { title: specific.practiceTitle, content: specific.practice },
      ],
      quiz: specific.quiz,
    };
  }

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
