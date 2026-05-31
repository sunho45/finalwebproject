# Study Planner Final Project

React, Express, PostgreSQL, Docker, Nginx, GitHub Actions, Vercel, Render를 사용하는 학습 플래너 프로젝트입니다.

## Features

- 계획 등록, 완료 처리, 삭제
- PostgreSQL DBMS에 계획 데이터 저장
- localStorage에 테마, 필터, 기본 집중 시간 저장
- sessionStorage에 작성 중인 계획 초안 저장
- Docker Compose로 client, server, db, nginx 로컬 실행
- GitHub Actions로 빌드 검증 및 Vercel 배포 준비
- Render Blueprint로 server와 PostgreSQL 배포 준비

## Local Run

```bash
docker compose up --build
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:8080
```

## Vercel

Vercel은 `client` 폴더를 배포합니다.

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
Environment Variable:
VITE_API_BASE_URL=https://YOUR_RENDER_SERVER_URL
```

## Render

Render는 `server`와 PostgreSQL을 배포합니다.

방법 1: Blueprint 사용

1. Render에서 New Blueprint 선택
2. GitHub 저장소 연결
3. 루트의 `render.yaml` 선택
4. `CLIENT_ORIGIN`에 Vercel 주소 입력

방법 2: 직접 Web Service 생성

```text
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Render 환경 변수:

```text
DATABASE_URL=Render PostgreSQL connection string
CLIENT_ORIGIN=https://YOUR_VERCEL_URL
```
