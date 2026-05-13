import { lazy, Suspense, useEffect, useRef, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "@/pages/Login/LoginPage";
import SignupPage from "@/pages/Signup/SignupPage";
import LandingPage from "@/pages/Landing/LandingPage";
import HomePage from "@/pages/Home/HomePage";
import SimulationPage from "@/pages/Simulation/SimulationPage";
import NewsPage from "@/pages/News/NewsPage";
import NewsDetailPage from "@/pages/News/NewsDetailPage";
import DiscussionDetailPage from "@/pages/News/DiscussionDetailPage";
import ChallengePage from "@/pages/Challenge/ChallengePage";
import AILearningPage from "@/pages/AILearning/AILearningPage";
import MyPage from "@/pages/MyPage/MyPage";
import MyPageSettingsPage from "@/pages/MyPage/MyPageSettingsPage";
import LoginDeviceManagementPage from "@/pages/MyPage/LoginDeviceManagementPage";
import MyAssetsPage from "@/pages/MyPage/MyAssetsPage";
import MyPortfolioManagementPage from "@/pages/MyPage/MyPortfolioManagementPage";
import ServiceRankingPage from "@/pages/ServiceRanking/ServiceRankingPage";
import ServiceRankingUserPage from "@/pages/ServiceRanking/ServiceRankingUserPage";
import { useAuthStore } from "@/store/useAuthStore";
import { memberApi } from "@/api/member";
import MainLayout from "@/components/Layout/MainLayout";

// 차트 라이브러리를 사용하는 페이지는 lazy loading
const StockDetailPage = lazy(() => import("@/pages/Simulation/StockDetailPage"));

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const tokens = useAuthStore((state) => state.tokens);
  const location = useLocation();
  return tokens ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

// 앱 라우팅 설정
function App() {
  const { tokens, setUser } = useAuthStore();
  const didSyncMeRef = useRef(false);

  // 백엔드 WebSocket 엔드포인트가 구현되기 전까지 시세는 REST API로 조회합니다.

  // 홈 첫 접근 시점(로그인 세션당 1회)에 내 정보 동기화
  useEffect(() => {
    if (!tokens) {
      didSyncMeRef.current = false;
      return;
    }

    if (didSyncMeRef.current) return;
    didSyncMeRef.current = true;

    let cancelled = false;
    memberApi.getMe().then((data) => {
      if (!cancelled) setUser(data);
    }).catch(() => {
      if (!cancelled) {
        didSyncMeRef.current = false;
      }
    });
    return () => { cancelled = true; };
  }, [tokens, setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/simulation/:stockId" element={<Suspense fallback={<div className="flex justify-center items-center h-full">로딩중...</div>}><StockDetailPage /></Suspense>} />
          <Route path="/ai-learning" element={<AILearningPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:newsId" element={<NewsDetailPage />} />
          <Route path="/discussion/:discussionId" element={<DiscussionDetailPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/settings" element={<MyPageSettingsPage />} />
          <Route path="/mypage/settings/login-devices" element={<LoginDeviceManagementPage />} />
          <Route path="/mypage/assets" element={<MyAssetsPage />} />
          <Route path="/mypage/portfolio" element={<MyPortfolioManagementPage />} />
          <Route path="/mypage/service-ranking" element={<ServiceRankingPage />} />
          <Route path="/mypage/service-ranking/user" element={<ServiceRankingUserPage />} />
          <Route path="/inquiry" element={<Navigate to="/home" replace />} />
          <Route path="/faq" element={<Navigate to="/home" replace />} />
          <Route path="/notice" element={<Navigate to="/home" replace />} />
          <Route path="/notice/:noticeId" element={<Navigate to="/home" replace />} />
          <Route path="/mypage/terms" element={<Navigate to="/mypage/settings" replace />} />
          <Route path="/mypage/privacy" element={<Navigate to="/mypage/settings" replace />} />
        </Route>
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
