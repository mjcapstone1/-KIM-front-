import { useMemo, useState } from "react";
import { investmentTypes, type InvestmentType } from "../learningData";

interface InvestmentTypeModalProps {
  selectedType: InvestmentType | null;
  onSelect: (type: InvestmentType) => void;
  onConfirm: () => void;
  onSkip: () => void;
}

const typeEntries = Object.entries(investmentTypes) as Array<[InvestmentType, typeof investmentTypes[InvestmentType]]>;

type SurveyOption = {
  label: string;
  description: string;
  type: InvestmentType;
};

type SurveyQuestion = {
  question: string;
  helper: string;
  options: SurveyOption[];
};

const surveyQuestions: SurveyQuestion[] = [
  {
    question: "투자금이 하루에 5% 정도 흔들리면 어떤 생각이 먼저 드나요?",
    helper: "손실 상황에서의 감정 반응을 확인해요.",
    options: [
      { label: "불안해서 바로 줄이고 싶다", description: "원금 보존과 안정성을 우선합니다.", type: "stable" },
      { label: "이유를 보고 일부만 조정한다", description: "수익과 위험을 함께 비교합니다.", type: "balanced" },
      { label: "기회라면 추가 매수도 본다", description: "높은 변동성도 감수할 수 있습니다.", type: "aggressive" },
      { label: "짧게 손절하거나 재진입한다", description: "빠른 판단과 실행을 선호합니다.", type: "daytrader" },
    ],
  },
  {
    question: "가장 편한 투자 기간은 어느 쪽에 가깝나요?",
    helper: "보유 기간은 투자 성향을 가르는 중요한 기준이에요.",
    options: [
      { label: "몇 달에서 몇 년", description: "천천히 안정적으로 지켜봅니다.", type: "stable" },
      { label: "몇 주에서 몇 달", description: "중기 흐름과 비중 조절을 봅니다.", type: "balanced" },
      { label: "큰 테마는 오래, 기회는 적극적으로", description: "성장 가능성에 베팅합니다.", type: "aggressive" },
      { label: "하루 안 또는 며칠 안", description: "짧은 가격 흐름을 활용합니다.", type: "daytrader" },
    ],
  },
  {
    question: "종목을 고를 때 가장 먼저 보고 싶은 정보는 무엇인가요?",
    helper: "어떤 정보를 신뢰하는지에 따라 학습 방향이 달라져요.",
    options: [
      { label: "실적, 배당, 부채 안정성", description: "기업 체력과 안정성을 봅니다.", type: "stable" },
      { label: "가치와 성장성을 같이 비교", description: "한쪽으로 치우치지 않습니다.", type: "balanced" },
      { label: "성장률, 신사업, 테마 흐름", description: "미래 기대와 확장성을 봅니다.", type: "aggressive" },
      { label: "거래량, 캔들, 호가 흐름", description: "장중 수급과 타이밍을 봅니다.", type: "daytrader" },
    ],
  },
  {
    question: "수익 목표를 잡는다면 어떤 방식이 가장 자연스럽나요?",
    helper: "목표 수익률보다 중요한 건 그 과정의 리스크예요.",
    options: [
      { label: "작아도 꾸준한 수익", description: "크게 잃지 않는 것이 중요합니다.", type: "stable" },
      { label: "시장 평균보다 조금 더", description: "수익과 안정성의 균형을 봅니다.", type: "balanced" },
      { label: "높은 성장 수익", description: "변동성을 감수하고 큰 기회를 찾습니다.", type: "aggressive" },
      { label: "짧은 구간의 빠른 수익", description: "작은 기회를 반복적으로 노립니다.", type: "daytrader" },
    ],
  },
  {
    question: "계획과 다르게 손실이 커질 때 가장 가까운 행동은 무엇인가요?",
    helper: "손실 관리 방식은 실제 투자에서 가장 중요해요.",
    options: [
      { label: "위험 자산 비중을 낮춘다", description: "방어적으로 계좌를 지킵니다.", type: "stable" },
      { label: "원인을 확인하고 리밸런싱한다", description: "포트폴리오 전체를 조정합니다.", type: "balanced" },
      { label: "근거가 살아 있으면 버틴다", description: "큰 그림의 성장성을 중시합니다.", type: "aggressive" },
      { label: "기준가 이탈 시 바로 정리한다", description: "손절과 재진입 기준을 빠르게 씁니다.", type: "daytrader" },
    ],
  },
  {
    question: "앱을 켰을 때 가장 자주 확인하고 싶은 화면은 무엇인가요?",
    helper: "평소 관심사가 맞춤형 교육 코스를 결정해요.",
    options: [
      { label: "내 자산과 안정적인 종목", description: "계좌 안정성과 장기 관리를 봅니다.", type: "stable" },
      { label: "포트폴리오 비중과 수익률", description: "전체 균형을 꾸준히 점검합니다.", type: "balanced" },
      { label: "테마, 급등, 성장 섹터", description: "강한 성장 흐름을 찾습니다.", type: "aggressive" },
      { label: "실시간 거래대금과 차트", description: "장중 움직임과 타이밍을 봅니다.", type: "daytrader" },
    ],
  },
];

const InvestmentTypeModal = ({
  selectedType,
  onSelect,
  onConfirm,
  onSkip,
}: InvestmentTypeModalProps) => {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<InvestmentType[]>([]);

  const recommendedType = useMemo<InvestmentType | null>(() => {
    if (answers.length < surveyQuestions.length) return null;
    const scores = answers.reduce<Record<InvestmentType, number>>(
      (acc, type) => {
        acc[type] += 1;
        return acc;
      },
      { stable: 0, balanced: 0, aggressive: 0, daytrader: 0 },
    );
    return (Object.keys(scores) as InvestmentType[]).reduce((best, type) => (
      scores[type] > scores[best] ? type : best
    ), "balanced");
  }, [answers]);

  const currentQuestion = surveyQuestions[currentQuestionIndex];
  const surveyProgress = Math.round((answers.length / surveyQuestions.length) * 100);

  const startSurvey = () => {
    setIsSurveyOpen(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  const chooseAnswer = (type: InvestmentType) => {
    const nextAnswers = [...answers, type];
    setAnswers(nextAnswers);
    if (nextAnswers.length >= surveyQuestions.length) {
      onSelect(calculateRecommendedType(nextAnswers));
      return;
    }
    setCurrentQuestionIndex((index) => index + 1);
  };

  const resetSurvey = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
            AI
          </div>
          <h2 className="mb-2 text-3xl font-bold text-[#1D1E20]">투자 성향 설정</h2>
          <p className="text-sm text-[#909193]">당신의 투자 스타일에 맞는 맞춤형 교육을 제공합니다</p>
        </div>

        <div className="mb-6 rounded-2xl border-2 border-[#C7F3EB] bg-gradient-to-r from-blue-50 to-purple-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#3AB8A8] shadow-sm">
                AI
              </span>
              <div>
                <p className="font-bold text-[#1D1E20]">AI 대화형 성향 검사</p>
                <p className="mt-0.5 text-sm text-[#A5A6A9]">6가지 질문으로 내 투자 성향을 분석합니다.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={startSurvey}
              className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              투자 성향 검사하기
            </button>
          </div>
        </div>

        {isSurveyOpen && (
          <div className="mb-8 rounded-2xl border-2 border-[#C7F3EB] bg-white p-6 shadow-sm">
            {recommendedType ? (
              <div className="text-center">
                <p className="mb-2 text-sm font-bold text-[#3AB8A8]">AI 성향 분석 결과</p>
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${investmentTypes[recommendedType].tone} text-lg font-bold text-white shadow-lg`}>
                  {investmentTypes[recommendedType].badge}
                </div>
                <h3 className="mb-2 text-2xl font-bold text-[#1D1E20]">
                  {investmentTypes[recommendedType].name}이 잘 맞아요
                </h3>
                <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-[#696969]">
                  6가지 답변을 기준으로 보면 {investmentTypes[recommendedType].description}
                  아래의 맞춤형 교육 과정도 이 성향에 맞춰 다시 열립니다.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetSurvey}
                    className="rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#696969] transition-colors hover:bg-gray-50"
                  >
                    다시 검사하기
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-xl bg-gradient-to-r from-[#1F3B70] to-[#42D6BA] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
                  >
                    이 성향으로 교육 시작하기
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#3AB8A8]">
                      질문 {currentQuestionIndex + 1} / {surveyQuestions.length}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-[#1D1E20]">{currentQuestion.question}</h3>
                    <p className="mt-1 text-sm text-[#909193]">{currentQuestion.helper}</p>
                  </div>
                  <div className="hidden min-w-[120px] text-right text-sm font-bold text-[#1F3B70] sm:block">
                    {surveyProgress}%
                  </div>
                </div>
                <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-[#42D6BA] transition-all"
                    style={{ width: `${surveyProgress}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => chooseAnswer(option.type)}
                      className="rounded-2xl border-2 border-gray-200 bg-white p-5 text-left transition-all hover:border-[#42D6BA] hover:bg-[#F3FFFC] hover:shadow-md"
                    >
                      <p className="font-bold text-[#1D1E20]">{option.label}</p>
                      <p className="mt-1 text-sm leading-5 text-[#909193]">{option.description}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mb-4 text-center text-sm text-gray-400">또는 직접 선택</div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {typeEntries.map(([type, info]) => {
            const active = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelect(type)}
                className={`rounded-2xl border-2 p-6 text-left transition-all hover:shadow-lg ${
                  active ? `${info.border} ${info.bg} shadow-lg` : "border-gray-200 bg-white hover:border-[#42D6BA]"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${info.tone} text-sm font-bold text-white`}>
                      {info.badge}
                    </div>
                    <h3 className="text-xl font-bold text-[#1D1E20]">{info.shortName}</h3>
                  </div>
                  {active && <span className="text-sm font-bold text-[#3AB8A8]">선택됨</span>}
                </div>
                <p className="mb-3 text-sm text-[#696969]">{info.description}</p>
                <div className="space-y-1.5 text-xs text-[#909193]">
                  {info.points.map((point) => (
                    <div key={point} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#42D6BA]" />
                      {point}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 rounded-xl border-2 border-gray-200 px-6 py-3 font-medium text-[#696969] transition-colors hover:bg-gray-50"
          >
            나중에 설정
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!selectedType}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#1F3B70] to-[#42D6BA] px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            맞춤형 교육 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

const calculateRecommendedType = (answers: InvestmentType[]): InvestmentType => {
  const scores = answers.reduce<Record<InvestmentType, number>>(
    (acc, type) => {
      acc[type] += 1;
      return acc;
    },
    { stable: 0, balanced: 0, aggressive: 0, daytrader: 0 },
  );
  return (Object.keys(scores) as InvestmentType[]).reduce((best, type) => (
    scores[type] > scores[best] ? type : best
  ), "balanced");
};

export default InvestmentTypeModal;
