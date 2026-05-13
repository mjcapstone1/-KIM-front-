import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { InvestmentType } from "../learningData";
import { BotIcon, SendIcon, SparklesIcon, UserIcon } from "./TutorIcons";

interface AITutorPanelProps {
  investmentType: InvestmentType | null;
}

type ChatRole = "assistant" | "user";

interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
}

const typeNames: Record<InvestmentType, string> = {
  stable: "안정형",
  balanced: "균형형",
  aggressive: "공격형",
  daytrader: "단타형",
};

const suggestedQuestions = [
  "주식 투자 시 가장 중요한 것은?",
  "PER과 PBR이 뭔가요?",
  "분산 투자가 필요한 이유?",
  "손절매는 언제 해야 하나요?",
];

const createInitialMessage = (investmentType: InvestmentType | null): ChatMessage => ({
  id: 1,
  role: "assistant",
  content: `안녕하세요! 저는 FinVest AI 투자 튜터입니다 🤖\n\n${
    investmentType
      ? `${typeNames[investmentType]} 투자자님께 맞춤형 조언을 드릴게요!`
      : "투자에 대한 궁금한 점을 무엇이든 물어보세요!"
  }\n\n주식, ETF, 포트폴리오, 리스크 관리 등 다양한 질문에 답해드립니다.`,
});

const buildMockAnswer = (question: string, investmentType: InvestmentType | null) => {
  const prefix = investmentType ? `${typeNames[investmentType]} 투자자 기준으로 보면, ` : "";
  const normalized = question.replace(/\s+/g, "");

  if (normalized.includes("PER")) {
    return `${prefix}PER은 주가를 주당순이익으로 나눈 값입니다. 같은 업종 평균과 비교하면 현재 가격이 이익 대비 비싼지, 싼지 판단하는 데 도움이 됩니다.`;
  }

  if (normalized.includes("ETF")) {
    return `${prefix}ETF는 여러 종목을 묶어 거래하는 상품입니다. 개별 주식보다 분산 효과가 있어 초보 투자자가 시장 흐름을 연습하기에 좋습니다.`;
  }

  if (normalized.includes("분산")) {
    return `${prefix}분산 투자는 한 종목의 손실이 전체 자산에 주는 충격을 줄이는 방법입니다. 업종, 자산군, 투자 시점을 나누면 변동성을 낮출 수 있습니다.`;
  }

  if (normalized.includes("손절")) {
    return `${prefix}손절 기준은 매수 전에 정해야 합니다. 예를 들어 -5% 가격, 주요 지지선 이탈, 투자 아이디어 훼손처럼 숫자와 조건을 함께 두는 방식이 좋습니다.`;
  }

  return `${prefix}먼저 투자 목적, 기간, 감당 가능한 손실 범위를 정리해보세요. 그다음 기업의 실적, 가격 수준, 차트 흐름을 순서대로 확인하면 판단이 더 명확해집니다.`;
};

const AITutorPanel = ({ investmentType }: AITutorPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createInitialMessage(investmentType)]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(2);
  const isInitialOnly = messages.length === 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (value = draft) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const userMessageId = messageIdRef.current;
    const assistantMessageId = messageIdRef.current + 1;
    messageIdRef.current += 2;

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: trimmed,
    };
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: buildMockAnswer(trimmed, investmentType),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="finvest-tutor-header flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#1F3B70] to-[#42D6BA] flex-shrink-0">
        <div className="finvest-tutor-header-icon flex h-9 w-9 items-center justify-center rounded-xl bg-[#42D6BA]/30">
          <SparklesIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">AI 투자 튜터</h3>
          <p className="text-sm text-white/70">궁금한 투자 질문을 무엇이든 물어보세요</p>
        </div>
        <div className="finvest-tutor-status ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/80 text-sm">온라인</span>
        </div>
      </div>

      {isInitialOnly && (
        <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => sendMessage(question)}
              className="finvest-tutor-chip text-sm px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => {
          const isAssistant = message.role === "assistant";
          return (
            <div key={message.id} className={`flex items-start gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                  isAssistant ? "bg-gradient-to-br from-blue-500 to-purple-500" : "bg-gray-200"
                }`}
              >
                {isAssistant ? (
                  <BotIcon className="h-5 w-5 text-white" />
                ) : (
                  <UserIcon className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  isAssistant
                    ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                    : "bg-gradient-to-br from-[#1F3B70] to-[#42D6BA] text-white rounded-tr-sm"
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-3 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="투자에 대해 궁금한 점을 물어보세요... (Enter로 전송)"
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50 max-h-24"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1F3B70] to-[#42D6BA] text-white disabled:opacity-40 hover:shadow-md transition-all"
            disabled={!draft.trim()}
            aria-label="메시지 전송"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">Shift+Enter 줄바꿈 · Enter 전송</p>
      </div>
    </div>
  );
};

export default AITutorPanel;
