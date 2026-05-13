interface SimulatorGateModalProps {
  onClose: () => void;
  onGoLearning: () => void;
}

const SimulatorGateModal = ({ onClose, onGoLearning }: SimulatorGateModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
          잠금
        </div>
        <h2 className="mb-2 text-2xl font-bold text-[#1D1E20]">학습을 먼저 완료해주세요</h2>
        <p className="mb-6 text-sm leading-relaxed text-[#696969]">
          투자 시뮬레이터를 사용하려면 선택한 투자 성향의 모든 학습 단계를 완료해야 합니다.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-medium text-[#696969] hover:bg-gray-50"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onGoLearning}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#1F3B70] to-[#42D6BA] px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl"
          >
            학습하러 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulatorGateModal;
