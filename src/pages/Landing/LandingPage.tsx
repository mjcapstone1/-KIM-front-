import { useEffect, useState, type CSSProperties, type SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

type IconProps = SVGProps<SVGSVGElement>;

const colors = {
  border: "rgba(66, 214, 186, 0.25)",
  shadow: "0px 4px 50px 0px rgba(66, 214, 186, 0.10)",
  shadowMd: "0px 8px 40px 0px rgba(66, 214, 186, 0.18)",
  text: "rgba(31, 59, 112, 0.60)",
};

const TrendIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 17 9 11l4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

const ArrowRightIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const CheckIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const FeatureIcon = ({ label, style }: { label: string; style: CSSProperties }) => (
  <div style={style}>
    <span style={{ fontSize: 20 }}>{label}</span>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const tokens = useAuthStore((state) => state.tokens);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const start = () => {
    navigate(tokens ? "/ai-learning" : "/login", tokens ? undefined : { state: { from: "/ai-learning" } });
  };

  const go = (path: string) => {
    const protectedPath = path !== "/";
    if (protectedPath && !tokens) {
      navigate("/login", { state: { from: path } });
      return;
    }
    navigate(path);
  };

  return (
    <div className="finvest-landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        @keyframes landingFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }

        @keyframes landingFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes landingMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .finvest-landing {
          min-height: 100vh;
          background: #ffffff;
          overflow: hidden;
          font-family: 'DM Sans', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1D1E20;
        }

        .landing-fade-1 { animation: landingFadeUp 0.6s 0.05s ease both; }
        .landing-fade-2 { animation: landingFadeUp 0.6s 0.18s ease both; }
        .landing-fade-3 { animation: landingFadeUp 0.6s 0.30s ease both; }
        .landing-fade-4 { animation: landingFadeUp 0.6s 0.42s ease both; }
        .landing-mockup-float { animation: landingFloat 5.5s ease-in-out infinite; }
        .landing-logo-marquee { display: flex; gap: 40px; animation: landingMarquee 20s linear infinite; white-space: nowrap; }
        .landing-feature-card { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .landing-feature-card:hover { transform: translateY(-5px); box-shadow: 0px 16px 48px rgba(59, 130, 246, 0.12); }
        .landing-cta:hover { opacity: 0.88; transform: scale(0.98); }
        .landing-nav-link { color: rgba(59, 130, 246, 0.65); font-size: 14px; font-weight: 500; cursor: pointer; transition: color 0.15s; }
        .landing-nav-link:hover { color: #2563eb; }

        @media (max-width: 900px) {
          .landing-nav-menu { display: none !important; }
          .landing-hero-title { font-size: 44px !important; }
          .landing-mockup { height: 560px !important; }
          .landing-mockup-side { display: none !important; }
          .landing-feature-grid, .landing-step-grid { grid-template-columns: 1fr !important; }
          .landing-step-line { display: none !important; }
        }
      `}</style>

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: scrolled ? "rgba(240,246,253,0.97)" : "rgba(240,246,253,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: scrolled ? `1px solid ${colors.border}` : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button type="button" onClick={() => go("/")} style={{ display: "flex", alignItems: "center", gap: 9, border: 0, background: "transparent", cursor: "pointer", padding: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#42D6BA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendIcon style={{ width: 15, height: 15, color: "#fff" }} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#1D1E20", letterSpacing: "-0.3px" }}>FinVest</span>
          </button>
          <div className="landing-nav-menu" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <button type="button" className="landing-nav-link" onClick={() => go("/")} style={{ border: 0, background: "transparent", padding: 0 }}>시작페이지</button>
            <button type="button" className="landing-nav-link" onClick={() => go("/home")} style={{ border: 0, background: "transparent", padding: 0 }}>홈</button>
            <button type="button" className="landing-nav-link" onClick={() => go("/simulation")} style={{ border: 0, background: "transparent", padding: 0 }}>투자 시뮬레이터</button>
            <button type="button" className="landing-nav-link" onClick={() => go("/ai-learning")} style={{ border: 0, background: "transparent", padding: 0 }}>AI 학습</button>
            {tokens ? (
              <button type="button" onClick={() => go("/home")} style={{ border: 0, background: "#1D1E20", color: "#fff", borderRadius: 999, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>앱으로 이동</button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button type="button" onClick={() => navigate("/login")} style={{ border: `1px solid ${colors.border}`, background: "#fff", color: "#1D1E20", borderRadius: 999, padding: "8px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>로그인</button>
                <button type="button" onClick={() => navigate("/signup")} style={{ border: 0, background: "#1D1E20", color: "#fff", borderRadius: 999, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>회원가입</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <section style={{ width: "100%", maxWidth: 1200, padding: "140px 40px 80px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div className="landing-fade-1" style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "#fff", border: `1px solid ${colors.border}`, borderRadius: 100, padding: "6px 14px", fontSize: 13, fontWeight: 500, color: "#42D6BA", marginBottom: 28, boxShadow: colors.shadow }}>
          <span>✦</span>
          AI 기반 투자 학습 플랫폼
        </div>
        <h1 className="landing-fade-2 landing-hero-title" style={{ fontSize: "clamp(44px, 6.5vw, 78px)", fontWeight: 800, color: "#1D1E20", letterSpacing: "-2.5px", lineHeight: 1.08, marginBottom: 22, maxWidth: 800 }}>
          AI로 배우는
          <br />
          스마트한 투자
        </h1>
        <p className="landing-fade-3" style={{ fontSize: 18, fontWeight: 400, color: colors.text, lineHeight: 1.65, maxWidth: 500, marginBottom: 36 }}>
          투자 성향 분석부터 실전 시뮬레이션까지.
          <br />
          AI 튜터와 함께 안전하게 투자를 배워보세요.
        </p>
        <div className="landing-fade-3" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button
            type="button"
            onClick={start}
            className="landing-cta"
            style={{ backgroundColor: "#1D1E20", color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 30px", borderRadius: 100, border: "none", cursor: "pointer", letterSpacing: "-0.2px", boxShadow: "0 4px 24px rgba(26,18,16,0.18)", transition: "all 0.18s ease", display: "flex", alignItems: "center", gap: 8 }}
          >
            무료로 시작하기
            <ArrowRightIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div className="landing-fade-4" style={{ display: "flex", gap: 24, marginBottom: 64, flexWrap: "wrap", justifyContent: "center" }}>
          {["완전 무료", "5분이면 시작", "AI 맞춤 학습"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckIcon style={{ width: 14, height: 14, color: "#42D6BA" }} />
              <span style={{ fontSize: 13, color: colors.text, fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>

        <div className="landing-mockup-float landing-mockup" style={{ width: "100%", maxWidth: 1072, height: 700, borderRadius: 20, border: `2px solid ${colors.border}`, boxShadow: colors.shadow, overflow: "hidden", backgroundColor: "#fff", position: "relative" }}>
          <div style={{ height: 44, backgroundColor: "#faf9f8", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 8 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((dot) => (
              <div key={dot} style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: dot }} />
            ))}
            <div style={{ flex: 1, marginLeft: 12, backgroundColor: "#f0eeec", borderRadius: 6, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: colors.text, maxWidth: 320, margin: "0 auto" }}>
              finvibe.space - Education Dashboard
            </div>
          </div>
          <div style={{ display: "flex", height: "calc(100% - 44px)" }}>
            <aside className="landing-mockup-side" style={{ width: 200, backgroundColor: "#faf9f8", borderRight: `1px solid ${colors.border}`, padding: "20px 14px", flexShrink: 0, textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <div style={{ width: 24, height: 24, backgroundColor: "#42D6BA", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendIcon style={{ width: 13, height: 13, color: "#fff" }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1D1E20" }}>FinVest</span>
              </div>
              {[
                { icon: "⌂", label: "홈", active: false },
                { icon: "◈", label: "AI 학습", active: true },
                { icon: "▥", label: "시뮬레이터", active: false },
                { icon: "◎", label: "투자 성향", active: false },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 9, marginBottom: 2, backgroundColor: item.active ? "rgba(59,130,246,0.08)" : "transparent" }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: item.active ? 600 : 400, color: item.active ? "#42D6BA" : colors.text }}>{item.label}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: colors.text, letterSpacing: "0.5px", marginBottom: 10, opacity: 0.6 }}>학습 현황</div>
                {[
                  { label: "1단계 완료", color: "#7bba6c" },
                  { label: "2단계 진행중", color: "#42D6BA" },
                  { label: "3단계 잠금", color: "#c4bbb9" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: item.color }} />
                    <span style={{ fontSize: 11, color: item.color }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </aside>

            <main style={{ flex: 1, padding: "22px 28px", overflow: "hidden", textAlign: "left" }}>
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1D1E20", marginBottom: 2 }}>안녕하세요!</h3>
                <p style={{ fontSize: 12, color: colors.text }}>오늘도 함께 투자를 배워볼까요?</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
                {[
                  { label: "완료 강의", value: "12", change: "+3 이번 주" },
                  { label: "학습 시간", value: "4.5h", change: "+1.2h 어제" },
                  { label: "퀴즈 정답률", value: "87%", change: "↑ 5% 향상" },
                ].map((stat) => (
                  <div key={stat.label} style={{ backgroundColor: "#fff", borderRadius: 12, padding: "14px 16px", border: `1px solid ${colors.border}` }}>
                    <div style={{ fontSize: 11, color: colors.text, marginBottom: 5 }}>{stat.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#1D1E20", marginBottom: 3 }}>{stat.value}</div>
                    <div style={{ fontSize: 10, color: "#7bba6c", fontWeight: 600 }}>{stat.change}</div>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: "#fff", borderRadius: 14, padding: "16px 18px", border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1D1E20", marginBottom: 14 }}>학습 진행률</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 72 }}>
                  {[40, 58, 35, 72, 50, 82, 60, 90, 68, 95].map((height, index) => (
                    <div key={index} style={{ flex: 1, height: `${height}%`, backgroundColor: height > 75 ? "#42D6BA" : "rgba(59,130,246,0.18)", borderRadius: "4px 4px 0 0" }} />
                  ))}
                </div>
              </div>
            </main>

            <aside className="landing-mockup-side" style={{ width: 210, backgroundColor: "#faf9f8", borderLeft: `1px solid ${colors.border}`, padding: "16px 14px", flexShrink: 0, textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1D1E20", marginBottom: 14, display: "flex", alignItems: "center", gap: 5 }}>
                AI 튜터
                <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", backgroundColor: "#7bba6c", display: "inline-block" }} />
              </div>
              {[
                { role: "bot", text: "PER이 낮으면 저평가 주식일 수 있어요!" },
                { role: "user", text: "PER이 뭔가요?" },
                { role: "bot", text: "주가를 주당이익으로 나눈 비율이에요" },
              ].map((chat, index) => (
                <div key={index} style={{ marginBottom: 8, display: "flex", justifyContent: chat.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: 11, lineHeight: 1.45, padding: "7px 10px", maxWidth: 150, borderRadius: chat.role === "bot" ? "12px 12px 12px 3px" : "12px 12px 3px 12px", backgroundColor: chat.role === "bot" ? "#fff" : "#42D6BA", color: chat.role === "bot" ? "#1D1E20" : "#fff", boxShadow: colors.shadow, border: chat.role === "bot" ? `1px solid ${colors.border}` : "none" }}>
                    {chat.text}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 12, display: "flex", gap: 5 }}>
                <div style={{ flex: 1, backgroundColor: "#fff", border: `1px solid ${colors.border}`, borderRadius: 9, padding: "6px 9px", fontSize: 10, color: colors.text }}>질문하세요...</div>
                <button type="button" style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: "#42D6BA", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div style={{ width: "100%", backgroundColor: "#fff", borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, padding: "22px 0", overflow: "hidden" }}>
        <p style={{ textAlign: "center", fontSize: 12, color: colors.text, fontWeight: 500, marginBottom: 14, letterSpacing: "0.5px" }}>투자 학습자 7,000명+ 신뢰</p>
        <div style={{ display: "flex", overflow: "hidden" }}>
          <div className="landing-logo-marquee">
            {["안정형 투자자", "균형형 투자자", "공격형 투자자", "단타형 투자자", "초보 투자자", "직장인 투자자", "안정형 투자자", "균형형 투자자", "공격형 투자자", "단타형 투자자", "초보 투자자", "직장인 투자자"].map((item, index) => (
              <span key={`${item}-${index}`} style={{ fontSize: 13, fontWeight: 600, color: "rgba(59,130,246,0.3)", flexShrink: 0 }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <section style={{ width: "100%", maxWidth: 1200, padding: "100px 40px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#42D6BA", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>왜 FinVest인가요</p>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 800, color: "#1D1E20", letterSpacing: "-1.5px", lineHeight: 1.12 }}>
            투자 학습의 모든 것,
            <br />
            한 곳에서
          </h2>
        </div>
        <div className="landing-feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {[
            { icon: "AI", color: "#42D6BA", bg: "rgba(59,130,246,0.06)", title: "AI 맞춤 학습", desc: "투자 성향을 분석해 나에게 딱 맞는 커리큘럼을 제안합니다." },
            { icon: "▥", color: "#5a8f52", bg: "rgba(90,143,82,0.06)", title: "실전 시뮬레이터", desc: "가상 자금으로 실제 시장과 동일한 환경에서 자유롭게 연습하세요." },
            { icon: "24", color: "#7a6fa0", bg: "rgba(122,111,160,0.06)", title: "AI 튜터 24/7", desc: "언제든 궁금한 투자 질문을 AI 튜터에게 물어보세요." },
            { icon: "✓", color: "#b07a4a", bg: "rgba(176,122,74,0.06)", title: "안전한 환경", desc: "실패도 배움이 되는 리스크 제로의 투자 연습장입니다." },
            { icon: "5", color: "#9a5a6a", bg: "rgba(154,90,106,0.06)", title: "체계적 커리큘럼", desc: "기초부터 고급까지 단계별로 설계된 투자 학습 로드맵." },
            { icon: "↑", color: "#c09050", bg: "rgba(192,144,80,0.06)", title: "빠른 성장", desc: "퀴즈와 피드백으로 학습 효율을 극대화하세요." },
          ].map((feature) => (
            <div key={feature.title} className="landing-feature-card" style={{ backgroundColor: "#fff", border: `1px solid ${colors.border}`, borderRadius: 18, padding: 28 }}>
              <FeatureIcon label={feature.icon} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: feature.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: feature.color, fontSize: 14, fontWeight: 800 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1D1E20", marginBottom: 8, letterSpacing: "-0.3px" }}>{feature.title}</h3>
              <p style={{ fontSize: 14, color: colors.text, lineHeight: 1.65 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ width: "100%", backgroundColor: "#fff", padding: "100px 40px", borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#42D6BA", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>시작하는 법</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#1D1E20", letterSpacing: "-1.5px", lineHeight: 1.12 }}>3단계면 충분해요</h2>
          </div>
          <div className="landing-step-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, position: "relative" }}>
            <div className="landing-step-line" style={{ position: "absolute", top: 28, left: "calc(16.6% + 16px)", right: "calc(16.6% + 16px)", height: 1, backgroundColor: colors.border, zIndex: 0 }} />
            {[
              { num: "01", title: "투자 성향 파악", desc: "AI 대화형 설문으로 나의 투자 스타일을 분석합니다." },
              { num: "02", title: "맞춤 학습", desc: "성향에 맞는 5단계 커리큘럼으로 체계적으로 배웁니다." },
              { num: "03", title: "실전 연습", desc: "시뮬레이터에서 배운 내용을 실전처럼 적용해보세요." },
            ].map((step) => (
              <div key={step.num} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#1D1E20", color: "#fff", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "4px solid #fff", boxShadow: colors.shadowMd }}>{step.num}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1D1E20", marginBottom: 8, letterSpacing: "-0.3px" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: colors.text, lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
