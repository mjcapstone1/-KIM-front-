import { investmentTypes, type InvestmentType } from "../learningData";

interface InvestmentTypeModalProps {
  selectedType: InvestmentType | null;
  onSelect: (type: InvestmentType) => void;
  onConfirm: () => void;
  onSkip: () => void;
}

const typeEntries = Object.entries(investmentTypes) as Array<[InvestmentType, typeof investmentTypes[InvestmentType]]>;

const InvestmentTypeModal = ({
  selectedType,
  onSelect,
  onConfirm,
  onSkip,
}: InvestmentTypeModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-8 shadow-2xl">
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
              onClick={onConfirm}
              disabled={!selectedType}
              className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              선택한 성향으로 시작
            </button>
          </div>
        </div>

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

export default InvestmentTypeModal;
