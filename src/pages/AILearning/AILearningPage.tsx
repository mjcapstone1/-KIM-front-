import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AITutorPanel from "./components/AITutorPanel";
import InvestmentTypeModal from "./components/InvestmentTypeModal";
import LearningProgressPanel from "./components/LearningProgressPanel";
import LessonViewerModal from "./components/LessonViewerModal";
import { BotIcon } from "./components/TutorIcons";
import {
  clearLegacyLearningStorage,
  getCompletedLessons,
  getLearningStorageScope,
  investmentTypes,
  learningCurriculum,
  readInvestmentType,
  resetCompletedLessonsForType,
  saveCompletedLessons,
  saveInvestmentType,
  type InvestmentType,
  type LessonStep,
} from "./learningData";
import { useAuthStore } from "@/store/useAuthStore";

type AILearningTab = "curriculum" | "profile" | "tutor";

const typeLabels: Record<InvestmentType, string> = {
  stable: "안정형",
  balanced: "균형형",
  aggressive: "공격형",
  daytrader: "단타형",
};

const profileDetails: Record<InvestmentType, { emoji: string; summary: string; features: string[] }> = {
  stable: {
    emoji: "🛡️",
    summary: "원금 보존과 안정적인 현금흐름을 가장 중요하게 생각합니다.",
    features: ["급격한 변동보다 꾸준한 성장 선호", "우량주와 배당주 중심", "분산 투자와 장기 보유가 핵심"],
  },
  balanced: {
    emoji: "⚖️",
    summary: "수익성과 리스크의 균형을 함께 확인합니다.",
    features: ["가치주와 성장주를 함께 검토", "기본적 분석과 기술적 분석 병행", "포트폴리오 비중 조절 중시"],
  },
  aggressive: {
    emoji: "🚀",
    summary: "높은 성장성과 시장 테마를 적극적으로 활용합니다.",
    features: ["성장주와 테마주에 관심", "높은 변동성 감수", "손실 제한 기준이 특히 중요"],
  },
  daytrader: {
    emoji: "⚡",
    summary: "짧은 시간의 가격 흐름과 거래량을 빠르게 판단합니다.",
    features: ["캔들 패턴과 호가 흐름 확인", "당일 매매 중심", "손절과 익절 기준을 빠르게 실행"],
  },
};

const tabItems: Array<{ key: AILearningTab; label: string }> = [
  { key: "curriculum", label: "학습 과정" },
  { key: "profile", label: "나의 투자 성향" },
  { key: "tutor", label: "AI 튜터" },
];

const AILearningPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const learningScope = useMemo(() => getLearningStorageScope(user), [user]);
  const [activeTab, setActiveTab] = useState<AILearningTab>("curriculum");
  const [selectedType, setSelectedType] = useState<InvestmentType | null>(() => readInvestmentType(getLearningStorageScope(useAuthStore.getState().user)));
  const [draftType, setDraftType] = useState<InvestmentType | null>(() => readInvestmentType(getLearningStorageScope(useAuthStore.getState().user)));
  const [showTypeModal, setShowTypeModal] = useState(() => !readInvestmentType(getLearningStorageScope(useAuthStore.getState().user)));
  const [selectedLesson, setSelectedLesson] = useState<LessonStep | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => getCompletedLessons(getLearningStorageScope(useAuthStore.getState().user)));

  useEffect(() => {
    clearLegacyLearningStorage();
    const storedType = readInvestmentType(learningScope);
    setSelectedType(storedType);
    setDraftType(storedType);
    setCompletedLessons(getCompletedLessons(learningScope));
    setShowTypeModal(!storedType);
    setSelectedLesson(null);
  }, [learningScope]);

  const completedCount = useMemo(() => {
    if (!selectedType) return 0;
    return learningCurriculum[selectedType].filter((lesson) => completedLessons.includes(lesson.id)).length;
  }, [completedLessons, selectedType]);
  const progress = selectedType ? Math.round((completedCount / 5) * 100) : 0;

  const confirmType = () => {
    if (!draftType) return;
    saveInvestmentType(draftType, learningScope);
    const nextCompleted = resetCompletedLessonsForType(draftType, learningScope);
    setSelectedType(draftType);
    setCompletedLessons(nextCompleted);
    setSelectedLesson(null);
    setActiveTab("curriculum");
    setShowTypeModal(false);
  };

  const skipType = () => {
    saveInvestmentType(null, learningScope);
    setSelectedType(null);
    setShowTypeModal(false);
  };

  const completeLesson = () => {
    if (!selectedLesson) return;

    setCompletedLessons((prev) => {
      const next = prev.includes(selectedLesson.id) ? prev : [...prev, selectedLesson.id];
      saveCompletedLessons(next, learningScope);
      return next;
    });

    const curriculum = learningCurriculum[selectedLesson.type];
    const nextLesson = curriculum.find((lesson) => lesson.step === selectedLesson.step + 1);
    setSelectedLesson(nextLesson ?? null);
  };

  const openTypeModal = () => {
    setDraftType(selectedType);
    setShowTypeModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <section className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
              <span className="flex h-8 w-8 items-center justify-center text-sm font-bold text-white">EDU</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1D1E20]">Education Dashboard</h1>
              <p className="mt-1 text-sm text-[#A5A6A9]">AI 기반 맞춤형 투자 교육</p>
            </div>
          </div>

          <div className="mt-6 flex gap-2 border-b border-gray-200">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-t-xl border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "border-[#42D6BA] bg-[#C7F3EB]/20 text-[#3AB8A8]"
                    : "border-transparent text-[#A5A6A9] hover:bg-gray-50 hover:text-[#444441]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === "curriculum" && (
          selectedType ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-[#D6F3E1] p-2 text-sm font-bold text-[#00A63E]">완료</div>
                    <h3 className="font-bold text-[#1D1E20]">완료한 단계</h3>
                  </div>
                  <div className="text-3xl font-bold text-emerald-900">{completedCount} / 5</div>
                  <p className="mt-2 text-sm text-[#909193]">단계별 학습 진행 중</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2 text-sm font-bold text-[#3AB8A8]">목표</div>
                    <h3 className="font-bold text-[#1D1E20]">학습 목표</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-900">{typeLabels[selectedType]}</div>
                  <p className="mt-2 text-sm text-[#909193]">맞춤형 투자 교육</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-purple-100 p-2 text-sm font-bold text-purple-600">진행</div>
                    <h3 className="font-bold text-[#1D1E20]">진행률</h3>
                  </div>
                  <div className="text-3xl font-bold text-purple-900">{progress}%</div>
                  <p className="mt-2 text-sm text-[#909193]">전체 학습 완료도</p>
                </div>
              </div>

              <LearningProgressPanel
                investmentType={selectedType}
                completedLessons={completedLessons}
                onLessonSelect={setSelectedLesson}
                onResetType={openTypeModal}
                onGoSimulator={() => navigate("/simulation")}
              />
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-[#C7F3EB] bg-gradient-to-br from-blue-50 to-purple-50 p-16 text-center shadow-lg">
              <div className="mb-8 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#42D6BA] text-2xl font-bold text-white shadow-xl">
                  EDU
                </div>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-[#1D1E20]">맞춤형 투자 학습을 시작하세요!</h2>
              <p className="mb-8 text-xl leading-relaxed text-[#444441]">
                당신의 투자 성향을 선택하고<br />
                체계적인 단계별 학습으로 전문 투자자가 되어보세요
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-5 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                투자 성향 선택하기
              </button>
            </div>
          )
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            {selectedType ? (
              <>
                <div className={`rounded-2xl border-2 p-8 shadow-sm ${investmentTypes[selectedType].bg} ${investmentTypes[selectedType].border}`}>
                  <div className="mb-6 flex items-center gap-6">
                    <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${investmentTypes[selectedType].tone} text-4xl shadow-lg`}>
                      {profileDetails[selectedType].emoji}
                    </div>
                    <div className="flex-1">
                      <p className="mb-1 text-sm font-semibold text-[#3AB8A8]">나의 투자 유형</p>
                      <h2 className="text-2xl font-bold text-[#1D1E20]">{investmentTypes[selectedType].name}</h2>
                      <p className="mt-1 text-sm text-[#696969]">{profileDetails[selectedType].summary}</p>
                    </div>
                    <button
                      type="button"
                      onClick={openTypeModal}
                      className="shrink-0 rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#909193] transition-colors hover:bg-gray-50"
                    >
                      🔄 다시 검사하기
                    </button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-[#3AB8A8]">✨ 나의 투자 스타일</p>
                    {profileDetails[selectedType].features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${investmentTypes[selectedType].tone} text-xs font-bold text-white`}>
                          ✓
                        </span>
                        <p className="text-sm text-[#444441]">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                  <h2 className="mb-6 text-2xl font-bold text-[#1D1E20]">투자 유형 전체 비교</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {(Object.keys(investmentTypes) as InvestmentType[]).map((type) => {
                      const info = investmentTypes[type];
                      const active = type === selectedType;
                      return (
                        <div
                          key={type}
                          className={`relative rounded-2xl border-2 p-6 ${
                            active ? `${info.border} ${info.bg} shadow-lg` : "border-gray-200 bg-gray-50 opacity-60"
                          }`}
                        >
                          {active && (
                            <div className={`absolute -right-3 -top-3 rounded-full bg-gradient-to-r ${info.tone} px-3 py-1 text-xs font-bold text-white shadow-lg`}>
                              ✓ 나의 유형
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold ${active ? `bg-gradient-to-br ${info.tone} text-white shadow` : "bg-gray-200 text-gray-400"}`}>
                              {info.badge}
                            </div>
                            <div>
                              <h3 className={`text-lg font-bold ${active ? "text-[#1D1E20]" : "text-gray-400"}`}>{info.name}</h3>
                              <p className={`text-sm ${active ? "text-[#909193]" : "text-gray-400"}`}>{info.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border-2 border-[#C7F3EB] bg-gradient-to-br from-blue-50 to-purple-50 p-16 text-center shadow-lg">
                <div className="mb-8 flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-2xl font-bold text-white shadow-xl">
                    AI
                  </div>
                </div>
                <h2 className="mb-4 text-4xl font-bold text-[#1D1E20]">나의 투자 성향을 알아보세요!</h2>
                <p className="mb-8 text-xl leading-relaxed text-[#444441]">
                  6가지 대화형 질문으로<br />
                  당신의 투자 성향을 분석합니다
                </p>
                <button
                  type="button"
                  onClick={openTypeModal}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-5 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  성향 검사 시작하기
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "tutor" && (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-2">
                <BotIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#1D1E20]">AI 투자 튜터</h2>
            </div>
            <p className="mb-6 text-sm text-[#A5A6A9]">
              투자에 관한 모든 질문을 AI 튜터에게 물어보세요.
              {selectedType && (
                <span className="ml-1 font-semibold text-[#3AB8A8]">
                  {typeLabels[selectedType]} 투자자 맞춤 조언을 드립니다.
                </span>
              )}
            </p>
            <AITutorPanel key={selectedType ?? "none"} investmentType={selectedType} />
          </div>
        )}
      </main>

      {showTypeModal && (
        <InvestmentTypeModal
          selectedType={draftType}
          onSelect={setDraftType}
          onConfirm={confirmType}
          onSkip={skipType}
        />
      )}

      {selectedLesson && (
        <LessonViewerModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onComplete={completeLesson}
        />
      )}
    </div>
  );
};

export default AILearningPage;
