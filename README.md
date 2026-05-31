# Study Planner Final Project

React, Express, PostgreSQL, Docker, Nginx, GitHub Actions를 사용하는 학습 플래너 프로젝트입니다.

## 주요 기능

- 계획 등록, 완료 처리, 삭제
- PostgreSQL DBMS에 계획 데이터 저장
- localStorage에 테마, 필터, 기본 집중 시간 저장
- sessionStorage에 작성 중인 계획 초안 저장
- Docker Compose로 client, server, db, nginx 실행
- GitHub Actions로 CI 및 Vercel 배포 준비

## 실행

```bash
docker compose up --build
```

브라우저에서 `http://localhost:8080`으로 접속합니다.

## Vercel 배포

GitHub 저장소와 Vercel 프로젝트를 만든 뒤 GitHub Secrets에 아래 값을 직접 등록하면 됩니다.

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

API 서버 주소는 Vercel 환경 변수 `VITE_API_BASE_URL`에 직접 입력하세요.
