import { useState } from "react";
import { lessonContent, type LessonStep } from "../learningData";

interface LessonViewerModalProps {
  lesson: LessonStep;
  onClose: () => void;
  onComplete: () => void;
}

const PASS_RATE = 0.66;

const LessonViewerModal = ({ lesson, onClose, onComplete }: LessonViewerModalProps) => {
  const content = lessonContent[lesson.id];
  const [sectionIndex, setSectionIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);

  if (!content) return null;

  const currentQuiz = content.quiz[quizIndex];
  const correctCount = answers.filter(Boolean).length;
  const requiredCount = Math.ceil(content.quiz.length * PASS_RATE);
  const passed = correctCount >= requiredCount;

  const chooseAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuiz) return;
    setSelectedAnswer(answerIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[quizIndex] = answerIndex === currentQuiz.correctAnswer;
      return next;
    });
  };

  const nextQuiz = () => {
    if (quizIndex < content.quiz.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      return;
    }
    setShowResult(true);
  };

  const retryQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
  };

  if (quizMode) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[#1F3B70] to-[#3AB8A8]">
        <div className="flex items-center justify-between bg-black/20 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white">
              퀴즈 {showResult ? content.quiz.length : quizIndex + 1} / {content.quiz.length}
            </span>
            <div className="flex gap-1">
              {content.quiz.map((quiz, index) => (
                <span
                  key={quiz.question}
                  className={`h-2 w-8 rounded-full ${
                    index < answers.length
                      ? answers[index] ? "bg-emerald-300" : "bg-red-300"
                      : index === quizIndex && !showResult ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white/20 px-3 py-2 text-white hover:bg-white/30">
            닫기
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            {showResult ? (
              <div className="space-y-6">
                <div className={`rounded-3xl border p-8 text-center backdrop-blur-sm ${
                  passed ? "border-white/30 bg-white/15" : "border-red-300/30 bg-red-500/20"
                }`}>
                  <h2 className="mb-2 text-3xl font-bold text-white">{passed ? "통과했습니다" : "다시 도전하세요"}</h2>
                  <p className="mb-4 text-lg text-white/80">
                    {correctCount}개 / {content.quiz.length}개 정답, {requiredCount}개 이상 필요
                  </p>
                  <div className="flex justify-center gap-2">
                    {content.quiz.map((quiz, index) => (
                      <span key={quiz.question} className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                        answers[index] ? "bg-emerald-400" : "bg-red-400"
                      }`}>
                        {answers[index] ? "✓" : "×"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-white/30 bg-white/20 py-4 font-bold text-white hover:bg-white/30">
                    나가기
                  </button>
                  <button type="button" onClick={retryQuiz} className="flex-1 rounded-2xl border border-white/30 bg-white/20 py-4 font-bold text-white hover:bg-white/30">
                    다시 도전
                  </button>
                  {passed && (
                    <button type="button" onClick={onComplete} className="flex-1 rounded-2xl bg-white py-4 font-bold text-[#1F3B70] shadow-lg hover:shadow-xl">
                      {lesson.step >= 5 ? "학습 완료" : "다음 단계"}
                    </button>
                  )}
                </div>
              </div>
            ) : currentQuiz ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-white/25 bg-white/15 p-8 backdrop-blur-sm">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">문제 {quizIndex + 1}</p>
                  <h3 className="text-xl font-bold leading-relaxed text-white">{currentQuiz.question}</h3>
                </div>
                <div className="space-y-3">
                  {currentQuiz.options.map((option, index) => {
                    const answered = selectedAnswer !== null;
                    const isCorrect = index === currentQuiz.correctAnswer;
                    const isSelected = index === selectedAnswer;
                    const stateClass = !answered
                      ? "border-white/25 bg-white/15 text-white hover:bg-white/25"
                      : isCorrect
                        ? "border-emerald-300 bg-emerald-400/30 text-white"
                        : isSelected
                          ? "border-red-300 bg-red-400/30 text-white"
                          : "border-white/10 bg-white/5 text-white/40";
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={answered}
                        onClick={() => chooseAnswer(index)}
                        className={`w-full rounded-2xl border-2 px-6 py-4 text-left font-medium backdrop-blur-sm transition-all ${stateClass}`}
                      >
                        <span className="mr-2 font-bold opacity-60">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </button>
                    );
                  })}
                </div>
                {selectedAnswer !== null && (
                  <div className={`rounded-2xl border-2 p-5 ${
                    selectedAnswer === currentQuiz.correctAnswer ? "border-emerald-300/50 bg-emerald-400/20" : "border-red-300/50 bg-red-400/20"
                  }`}>
                    <p className="mb-1 font-bold text-white">{selectedAnswer === currentQuiz.correctAnswer ? "정답" : "오답"}</p>
                    <p className="text-sm leading-relaxed text-white/85">{currentQuiz.explanation}</p>
                  </div>
                )}
                {selectedAnswer !== null && (
                  <button type="button" onClick={nextQuiz} className="w-full rounded-2xl bg-white py-4 font-bold text-[#1F3B70] shadow-lg hover:shadow-xl">
                    {quizIndex < content.quiz.length - 1 ? "다음 문제" : "결과 확인"}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const currentSection = content.sections[sectionIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="shrink-0 border-b border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[#909193] hover:bg-gray-100">
            닫기
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-[#1D1E20]">{lesson.title}</h1>
            <p className="text-xs text-[#909193]">{sectionIndex + 1} / {content.sections.length} 섹션</p>
          </div>
          <div className="w-14" />
        </div>
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-[#1F3B70] to-[#42D6BA] transition-all duration-500"
            style={{ width: `${((sectionIndex + 1) / content.sections.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <span className="mb-4 inline-block rounded-full bg-gradient-to-r from-[#1F3B70] to-[#42D6BA] px-3 py-1 text-xs font-bold text-white">
            섹션 {sectionIndex + 1}
          </span>
          <h2 className="mb-6 text-2xl font-bold leading-tight text-[#1D1E20]">{currentSection.title}</h2>
          <div className="rounded-2xl border border-[#C7F3EB] bg-gradient-to-br from-[#C7F3EB]/30 to-white p-6">
            <p className="whitespace-pre-line text-base leading-relaxed text-[#1D1E20]">{currentSection.content}</p>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl gap-3">
          {sectionIndex > 0 && (
            <button type="button" onClick={() => setSectionIndex((prev) => prev - 1)} className="rounded-2xl border-2 border-gray-200 px-6 py-4 font-bold text-[#696969] hover:bg-gray-50">
              이전
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (sectionIndex < content.sections.length - 1) {
                setSectionIndex((prev) => prev + 1);
              } else {
                setQuizMode(true);
              }
            }}
            className="flex-1 rounded-2xl bg-gradient-to-r from-[#1F3B70] to-[#42D6BA] py-4 font-bold text-white shadow-lg hover:shadow-xl"
          >
            {sectionIndex < content.sections.length - 1 ? "다음" : "퀴즈 시작"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonViewerModal;
