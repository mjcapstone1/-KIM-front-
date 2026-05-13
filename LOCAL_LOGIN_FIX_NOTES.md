# 로컬 백엔드 로그인 연동 수정 내역

## 적용한 수정

1. mock API 기본값 변경
   - `VITE_USE_MOCKS=true`일 때만 mock adapter를 사용하도록 수정했습니다.
   - 기본값은 실제 백엔드 연동입니다.

2. API base URL 정리
   - 개발 모드에서는 `/api`를 사용합니다.
   - Vite proxy가 `/api`를 `http://localhost:8080`으로 전달합니다.

3. Vite proxy 수정
   - 기존 `https://finvibe.space` 대상 프록시를 로컬 Docker 백엔드 `http://localhost:8080`으로 변경했습니다.

4. 로컬 환경 파일 추가
   - `.env`
   - `.env.development`
   - `.env.production`

## 로컬 테스트 계정

- email: `student@universion.local`
- password: `finvest1234!`

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 로그인하세요.

로그인 상태가 꼬였으면 개발자도구 Console에서 아래 명령을 한 번 실행한 뒤 새로고침하세요.

```js
localStorage.removeItem("finvest-auth-storage");
```
