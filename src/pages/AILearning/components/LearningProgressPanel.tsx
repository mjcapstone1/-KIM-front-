import {
  investmentTypes,
  learningCurriculum,
  type InvestmentType,
  type LessonStep,
} from "../learningData";

interface LearningProgressPanelProps {
  investmentType: InvestmentType;
  completedLessons: string[];
  onLessonSelect: (lesson: LessonStep) => void;
  onResetType: () => void;
  onGoSimulator: () => void;
}

const LearningProgressPanel = ({
  investmentType,
  completedLessons,
  onLessonSelect,
  onResetType,
  onGoSimulator,
}: LearningProgressPanelProps) => {
  const curriculum = learningCurriculum[investmentType];
  const info = investmentTypes[investmentType];
  const completedCount = curriculum.filter((lesson) => completedLessons.includes(lesson.id)).length;
  const progress = Math.round((completedCount / curriculum.length) * 100);
  const isAllCompleted = completedCount === curriculum.length;

  const startNextLesson = () => {
    const nextLesson = curriculum.find((lesson) => !completedLessons.includes(lesson.id));
    if (nextLesson) onLessonSelect(nextLesson);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${info.tone} text-sm font-bold text-white shadow-lg`}>
            {info.badge}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#42D6BA]">Current Profile</p>
            <h2 className="text-2xl font-bold text-[#1D1E20]">{info.name} 학습 과정</h2>
            <p className="text-sm text-[#909193]">{info.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetType}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[#696969] hover:bg-gray-50"
          >
            성향 다시 진단
          </button>
          <button
            type="button"
            onClick={isAllCompleted ? onGoSimulator : startNextLesson}
            className="rounded-xl bg-[#1F3B70] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#182f59]"
          >
            {isAllCompleted ? "시뮬레이터 시작" : "다음 학습 시작"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#1D1E20]">맞춤형 커리큘럼</h3>
            <p className="text-sm text-[#909193]">index.html 기준: 5단계 학습 완료 후 투자 시뮬레이터 해금</p>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-[#1F3B70] to-[#42D6BA] bg-clip-text text-3xl font-bold text-transparent">
              {progress}%
            </div>
            <div className="text-sm text-[#909193]">{completedCount} / {curriculum.length} 완료</div>
          </div>
        </div>

        <div className="mb-8 h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full bg-gradient-to-r ${info.tone} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {isAllCompleted && (
          <div className="mb-6 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center">
            <h4 className="text-lg font-bold text-emerald-900">모든 학습을 완료했습니다.</h4>
            <p className="mt-1 text-sm text-emerald-700">이제 발표용 플로우와 동일하게 투자 시뮬레이터를 사용할 수 있습니다.</p>
          </div>
        )}

        <div className="space-y-3">
          {curriculum.map((lesson, index) => {
            const completed = completedLessons.includes(lesson.id);
            const available = index === 0 || completedLessons.includes(curriculum[index - 1].id);
            const locked = !available;

            return (
              <button
                key={lesson.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  if (!completed) onLessonSelect(lesson);
                }}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  completed
                    ? "border-emerald-200 bg-emerald-50"
                    : locked
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                      : "border-[#C7F3EB] bg-[#F8FFFD] hover:border-[#42D6BA] hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${
                    completed ? "bg-emerald-500 text-white" : locked ? "bg-gray-300 text-gray-500" : "bg-[#42D6BA] text-white"
                  }`}>
                    {completed ? "✓" : locked ? "잠김" : lesson.step}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-white px-2 py-1 text-xs font-bold text-[#1F3B70]">{lesson.step}단계</span>
                      <span className="text-xs text-[#909193]">{lesson.duration}</span>
                    </div>
                    <h4 className="font-bold text-[#1D1E20]">{lesson.title}</h4>
                    <p className="text-sm text-[#696969]">{lesson.description}</p>
                  </div>
                  <div className="text-sm font-bold text-[#909193]">
                    {completed ? "완료" : locked ? "잠김" : "학습"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningProgressPanel;
