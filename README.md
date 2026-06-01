# FinVibe Frontend

FinVibe Frontend는 투자 학습과 모의투자를 한 화면 흐름으로 제공하는 React 기반 웹 애플리케이션입니다. 회원가입/로그인, 홈 시장 대시보드, 투자 시뮬레이터, AI 학습, 뉴스/토론, 챌린지, 마이페이지, 서비스 랭킹 화면을 제공합니다.

## 주요 기능

- 랜딩, 로그인, 회원가입, 인증 세션 유지
- 홈 화면의 지수, 테마, 종목 랭킹, 시장 데이터 조회
- 투자 시뮬레이터의 종목 목록, 상세 차트, 주문, 포트폴리오, 지갑 흐름
- AI 학습 코스, 레슨 모달, AI 튜터, 학습 현황 패널
- 뉴스 목록, 뉴스 상세, 토론 상세 화면
- 챌린지, 배지, 스쿼드/서비스 랭킹, 사용자별 랭킹 화면
- 마이페이지 설정, 로그인 기기 관리, 자산/포트폴리오 관리
- 실제 백엔드 API와 mock API 전환 지원

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Runtime | Node.js 24.x, npm 11.x |
| Framework | React 19, Vite 7 |
| Language | TypeScript |
| Routing | React Router DOM |
| Server State | TanStack React Query |
| Client State | Zustand |
| HTTP Client | Axios |
| Chart | lightweight-charts |
| Styling | Tailwind CSS, tailwind-merge, clsx |
| Markdown/SVG | react-markdown, vite-plugin-svgr |
| Lint/Build | ESLint, TypeScript, Vite |

## 빠른 시작

### 사전 요구사항

- Node.js 24.x
- npm 11.x
- 백엔드 로컬 서버: `http://localhost:8080`

### 설치 및 실행

```bash
git clone https://github.com/mjcapstone1/-KIM-front-.git finvibe-frontend
cd finvibe-frontend

npm install
npm run dev
```

개발 서버 기본 주소:

```text
http://localhost:5173
```

개발 모드에서 `VITE_API_BASE_URL`을 지정하지 않으면 `/api` 프록시를 사용합니다. Vite 프록시는 `/api` prefix를 제거한 뒤 `http://localhost:8080` 백엔드로 전달합니다.

## 환경 변수

로컬에서 실제 백엔드에 연결할 때는 `.env`를 생략해도 됩니다. 명시적으로 설정하려면 프로젝트 루트에 `.env`를 만들고 아래처럼 작성합니다.

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:8080
```

mock API로 화면만 확인하려면:

```env
VITE_USE_MOCKS=true
```

mock 로그인 계정:

```text
email: student@universion.local
password: finvest1234!
```

| 변수 | 설명 | 기본값/예시 |
| --- | --- | --- |
| `VITE_USE_MOCKS` | Axios mock adapter 사용 여부 | `false` |
| `VITE_API_BASE_URL` | 백엔드 API base URL | 개발: `/api`, 배포: `https://api.finvibe.kr` |
| `VITE_API_BASE` | `VITE_API_BASE_URL`의 호환 alias | 선택 |
| `VITE_WS_MARKET_URL` | 시장 WebSocket URL 수동 지정 | 선택 |

배포용 예시는 [deploy/vercel.env.example](deploy/vercel.env.example)을 참고하세요.

## 주요 화면

| 경로 | 화면 |
| --- | --- |
| `/` | 랜딩 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/home` | 홈/시장 대시보드 |
| `/simulation` | 투자 시뮬레이터 |
| `/simulation/:stockId` | 종목 상세 및 거래 |
| `/ai-learning` | AI 학습 |
| `/news` | 뉴스 목록 |
| `/news/:newsId` | 뉴스 상세 |
| `/discussion/:discussionId` | 토론 상세 |
| `/challenge` | 챌린지 |
| `/mypage` | 마이페이지 |
| `/mypage/settings` | 내 정보/설정 |
| `/mypage/settings/login-devices` | 로그인 기기 관리 |
| `/mypage/assets` | 내 자산 |
| `/mypage/portfolio` | 포트폴리오 관리 |
| `/mypage/service-ranking` | 서비스 랭킹 |
| `/mypage/service-ranking/user` | 사용자 랭킹 상세 |

인증이 필요한 화면은 토큰이 없으면 `/login`으로 이동합니다.

## 저장소 구조

```text
.
├── src
│   ├── api                 # Axios client와 도메인별 API 함수
│   ├── assets              # SVG, 아이콘, 정적 자산
│   ├── components          # 공통 UI 컴포넌트
│   ├── hooks               # React Query, WebSocket, debounce 등 커스텀 훅
│   ├── pages               # 라우트 단위 페이지
│   ├── store               # Zustand auth/market store
│   ├── utils               # 포맷터와 토큰 유틸
│   ├── App.tsx             # 라우팅과 인증 보호
│   ├── main.tsx            # React 진입점
│   └── index.css           # 전역 스타일
├── deploy                  # Vercel/Nginx/Docker 배포 파일
├── docs                    # 배포와 백엔드 API 연동 문서
├── public
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## API 연동 방식

- 공통 Axios 인스턴스는 [src/api/axios.ts](src/api/axios.ts)에 있습니다.
- API base URL은 [src/api/config.ts](src/api/config.ts)에서 결정합니다.
- `VITE_USE_MOCKS=true`이면 [src/api/mockApi.ts](src/api/mockApi.ts)의 mock adapter를 사용합니다.
- 인증 토큰은 [src/store/useAuthStore.ts](src/store/useAuthStore.ts)에 저장하고 요청 시 `Authorization: Bearer {accessToken}` 헤더로 전달합니다.
- 백엔드 API 계약은 [docs/backend-api-handoff.md](docs/backend-api-handoff.md)를 참고하세요.

## 스크립트

```bash
npm run dev       # Vite 개발 서버
npm run build     # TypeScript build + Vite production build
npm run lint      # ESLint 검사
npm run preview   # dist 미리보기
```

## 배포

Vercel 기준:

- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

필수 환경 변수:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://replace-with-your-backend.up.railway.app
```

최종 도메인이 분리되어 있다면 예시는 아래와 같습니다.

```text
Frontend: https://finvibe.kr
Backend:  https://api.finvibe.kr
```

자세한 배포 메모는 [docs/deployment.md](docs/deployment.md)를 참고하세요.

## 개발 규칙

- `src` 하위 import는 상대 경로 대신 `@/` alias를 사용합니다.
- 커밋 메시지는 한글로 작성하고 `feat`, `fix`, `refact`, `chore` action을 사용합니다.
- 세부 협업 규칙은 [RULES.md](RULES.md)를 참고하세요.

## 라이선스

별도 `LICENSE` 파일이 없습니다. 배포, 외부 공개, 재사용 조건은 저장소 관리자에게 확인하세요.
