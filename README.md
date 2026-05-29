# VocaSnap v2

사진으로 영어 단어를 추출하고 게임처럼 외우는 모바일 PWA. 다크 모드 + 형광 액센트, 스마트 디폴트 / 점진적 노출 기반의 액션 중심 UI.

## 구성 (monorepo)

```
vocasnap/
├─ web/      # Vite + React + TS + Tailwind PWA (프론트)
└─ server/   # Express — Gemini Vision 프록시 (API 키 보호)
```

핵심 화면: 홈 · 단어 추가(촬영→추출→저장) · 객관식 · 받아쓰기 · 단어장 · 통계 · 내정보.
키 없이도 바로 실행됨 — 서버 미연결 시 단어 추출은 데모 단어로, 인증은 게스트 모드로 동작.

## 빠른 시작

```bash
npm install            # 루트에서 (workspaces 자동 설치)

cp web/.env.example web/.env
cp server/.env.example server/.env   # GEMINI_API_KEY 입력 (선택)

npm run dev            # web(:5173) + server(:8787) 동시 실행
```

브라우저에서 `http://localhost:5173` → 모바일 뷰로 보면 가장 정확함 (DevTools 디바이스 모드).

## 환경 변수

`web/.env`
- `VITE_API_BASE` — 백엔드 주소 (로컬 `http://localhost:8787`, 배포 후 Render URL)
- `VITE_FIREBASE_*` — 비워두면 게스트 모드. 채우면 Auth/Firestore 동기화로 확장 가능.

`server/.env`
- `GEMINI_API_KEY` — Google AI Studio 키. 없으면 프론트가 데모 단어로 폴백.
- `CORS_ORIGIN` — 허용 프론트 도메인.

## Render 배포 (monorepo, 서비스 2개)

같은 repo를 가리키는 두 서비스를 만든다.

1. Web Service (백엔드)
   - Root Directory: `server`
   - Build: `npm install`  ·  Start: `npm start`
   - Env: `GEMINI_API_KEY`, `CORS_ORIGIN`(프론트 URL)

2. Static Site (프론트)
   - Root Directory: `web`
   - Build: `npm install && npm run build`  ·  Publish: `dist`
   - Env: `VITE_API_BASE`(위 백엔드 URL) 등
   - SPA 라우팅: Rewrite `/* → /index.html`

> 프론트는 Firebase Hosting에 올려도 됨. 그 경우 Render는 백엔드 전용.

## 다음 단계 (구현 여지)
- Firestore 연동: `web/src/lib/firebase.ts` + `store/*`를 서버 동기화로 확장
- 음성 받아쓰기(STT) 모드 추가 (iOS 폴백 필수)
- 단어장 공유 코드, 업적/랭킹, 푸시 알림
