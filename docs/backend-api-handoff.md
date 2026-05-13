# 백엔드 API 연동 기준

## 목적

이 문서는 FinVest 프론트엔드와 백엔드 API를 연결하기 위한 최소 계약을 정리한다. 실제 API가 준비되기 전까지는 mock API로 화면을 확인하고, API 구현이 완료된 항목부터 순차적으로 mock을 대체한다.

## 실행 및 전환

프론트엔드 실행:

```bash
npm install
npm run dev
```

실제 API 연동 시 프로젝트 루트에 `.env`를 추가한다.

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false
```

인증이 필요한 요청은 아래 헤더를 사용한다.

```http
Authorization: Bearer {accessToken}
```

## 구현 우선순위

1. 인증/회원: 로그인, 회원가입, 내 정보 조회
2. 투자 시뮬레이터: 지갑 잔액, 종목 현재가, 차트 캔들, 주문 생성
3. AI 학습: 내 코스, 레슨 상세, 완료 처리, 학습 지표
4. 챌린지/랭킹: XP, 스쿼드 랭킹, 내 배지
5. 마이페이지 자산: 포트폴리오, 자산 배분, 수익률 랭킹

뉴스/토론, 고객지원, 푸터, 약관/개인정보 상세 화면은 현재 범위에서 제외한다.

## 공통 규칙

- 성공 응답은 문서의 JSON 구조와 필드명을 유지한다.
- 날짜/시간은 ISO 문자열을 사용한다. 예: `2026-05-01T10:30:00+09:00`
- 금액, 수량, 수익률은 number로 반환한다.
- 실패 응답은 아래 형식을 권장한다.

```json
{
  "code": "INVALID_REQUEST",
  "message": "요청 값을 확인해주세요."
}
```

토큰 갱신 실패는 401과 `code: "INVALID_REFRESH_TOKEN"`을 사용한다.

## 인증 API

### POST `/auth/login`

요청:

```json
{
  "email": "student@universion.local",
  "password": "finvest1234!"
}
```

응답:

```json
{
  "accessToken": "access-token",
  "accessExpiresAt": "2026-05-01T12:00:00+09:00",
  "refreshToken": "refresh-token",
  "refreshExpiresAt": "2026-05-08T12:00:00+09:00"
}
```

### POST `/auth/signup`

요청:

```json
{
  "email": "student@universion.local",
  "password": "finvest1234!",
  "name": "테스트 사용자",
  "nickname": "테스터",
  "birthDate": "2001-01-01",
  "phoneNumber": "010-0000-0000"
}
```

응답:

```json
{
  "user": {
    "userId": "mock-user-1",
    "email": "student@universion.local",
    "nickname": "테스터",
    "name": "테스트 사용자",
    "birthDate": "2001-01-01",
    "phoneNumber": "010-0000-0000"
  },
  "tokens": {
    "accessToken": "access-token",
    "accessExpiresAt": "2026-05-01T12:00:00+09:00",
    "refreshToken": "refresh-token",
    "refreshExpiresAt": "2026-05-08T12:00:00+09:00"
  }
}
```

### POST `/auth/refresh`

요청:

```json
{ "refreshToken": "refresh-token" }
```

응답은 로그인과 같은 토큰 객체다.

### GET `/members/me`

응답:

```json
{
  "userId": "mock-user-1",
  "email": "student@universion.local",
  "nickname": "테스터",
  "name": "테스트 사용자",
  "birthDate": "2001-01-01",
  "phoneNumber": "010-0000-0000"
}
```

## 투자 시뮬레이터 API

### GET `/wallets/balance`

응답:

```json
{
  "walletId": 1,
  "userId": "mock-user-1",
  "balance": 50000000
}
```

### GET `/market/stocks/closing-prices?stockIds=1,2,3`

응답:

```json
[
  {
    "stockId": 1,
    "stockName": "삼성전자",
    "at": "2026-05-01T10:30:00+09:00",
    "close": 74200,
    "prevDayChangePct": 2.34,
    "volume": 12500000,
    "value": 927500000000
  }
]
```

### GET `/market/stocks/{stockId}/candles`

쿼리:

- `timeframe`: `MINUTE`, `DAY`, `WEEK`, `MONTH`, `YEAR`
- `startTime`: `YYYY-MM-DDTHH:mm:ss`
- `endTime`: `YYYY-MM-DDTHH:mm:ss`

응답은 시간 오름차순이어야 한다. 같은 `at` 값이 중복되면 차트 라이브러리에서 오류가 발생할 수 있다.

```json
[
  {
    "stockId": 1,
    "timeframe": "DAY",
    "at": "2026-04-30T00:00:00+09:00",
    "open": 73500,
    "high": 74800,
    "low": 73100,
    "close": 74200,
    "volume": 12500000,
    "value": 927500000000,
    "prevDayChangePct": 2.34
  }
]
```

### POST `/trades`

요청:

```json
{
  "stockId": 1,
  "amount": 1,
  "price": 74200,
  "portfolioId": 1,
  "tradeType": "NORMAL",
  "transactionType": "BUY"
}
```

응답:

```json
{
  "tradeId": 1,
  "stockId": 1,
  "amount": 1,
  "price": 74200,
  "portfolioId": 1,
  "userId": "mock-user-1",
  "tradeType": "NORMAL",
  "transactionType": "BUY"
}
```

서버 처리:

- 잔액 부족 검증
- 매수/매도 가능 수량 검증
- 주문 내역 저장
- 지갑 잔액 및 보유 수량 갱신

클라이언트 처리:

- 입력값 UI 검증
- 주문 요청 전 총액 표시
- 성공/실패 메시지 표시

## AI 학습 API

### GET `/study/courses/me`

응답:

```json
[
  {
    "id": 1,
    "title": "AI 투자 입문 코스",
    "description": "시장 흐름과 기본 투자 원칙을 학습합니다.",
    "difficulty": "BEGINNER",
    "totalLessonCount": 3,
    "lessons": [
      {
        "id": 101,
        "title": "투자와 리스크",
        "description": "수익과 위험의 관계",
        "completed": true
      }
    ]
  }
]
```

### GET `/study/lessons/{lessonId}`

응답:

```json
{
  "id": 101,
  "title": "투자와 리스크",
  "description": "수익과 위험의 관계",
  "content": "## 핵심 개념\n\n투자는 수익 가능성과 손실 가능성을 함께 관리하는 과정입니다.",
  "completed": false
}
```

`content`는 Markdown 문자열로 반환한다.

### POST `/study/lessons/{lessonId}/complete`

응답 바디는 없어도 된다.

### GET `/study/metrics/me`

응답:

```json
{
  "xpEarned": 1200,
  "timeSpentMinutes": 85,
  "lastPingAt": "2026-05-01T10:30:00+09:00"
}
```

## 챌린지/랭킹 API

### GET `/xp/me`

```json
{
  "userId": "mock-user-1",
  "nickname": "테스터",
  "totalXp": 1840,
  "level": 4
}
```

### GET `/xp/squads/ranking`

```json
[
  {
    "squadId": 1,
    "squadName": "Universion",
    "currentRanking": 1,
    "totalXp": 18420,
    "weeklyXp": 3250,
    "weeklyXpChangeRate": 12.4,
    "rankingChange": 1
  }
]
```

### GET `/badges/me`

```json
[
  {
    "badge": "KNOWLEDGE_SEEKER",
    "displayName": "지식 탐구자",
    "acquiredAt": "2026-04-30T10:30:00+09:00"
  }
]
```

## 마이페이지 자산 API

### GET `/portfolios`

```json
[
  {
    "id": 1,
    "name": "기본 포트폴리오",
    "iconCode": "DEFAULT",
    "totalPurchaseAmount": 6200000,
    "totalCurrentValue": 6640000,
    "totalReturnRate": 7.1
  }
]
```

### GET `/assets/allocation`

```json
{
  "cashAmount": 50000000,
  "stockAmount": 9930000,
  "totalAmount": 59930000,
  "changeAmount": 440000,
  "changeRate": 4.63
}
```

## 연동 테스트 순서

1. `.env`에서 `VITE_USE_MOCKS=false`로 전환한다.
2. 로그인 성공 후 `/home` 진입을 확인한다.
3. `/simulation/1`에서 지갑 잔액과 현재가가 보이는지 확인한다.
4. 차트 기간 버튼을 눌러 캔들 API 요청이 바뀌는지 확인한다.
5. 매수 주문을 눌러 `/trades` 요청과 응답을 확인한다.
6. `/ai-learning`에서 코스와 레슨 상세가 열리는지 확인한다.
7. `/challenge`에서 XP/랭킹 데이터가 보이는지 확인한다.

초기 연동은 1~5번을 먼저 맞추는 것을 권장한다.
