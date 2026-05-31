# Study Planner Final Project

React, Express, PostgreSQL, Docker, Nginx, GitHub Actions, Render를 사용하는 학습 플래너 프로젝트입니다.

## Features

- 계획 등록, 완료 처리, 삭제
- PostgreSQL DBMS에 계획 데이터 저장
- localStorage에 테마, 필터, 기본 집중 시간 저장
- sessionStorage에 작성 중인 계획 초안 저장
- Docker Compose로 client, server, db, nginx 로컬 실행
- GitHub Actions로 빌드 검증 후 Render Deploy Hook 호출
- Render Blueprint로 웹 서비스와 PostgreSQL을 함께 배포

## Local Run

```bash
docker compose up --build
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:8080
```

## Render Deploy

이 프로젝트는 Render만 사용하도록 구성되어 있습니다.

Render에서 배포하는 항목:

- `study-planner`: React 정적 파일과 Express API를 함께 제공하는 Web Service
- `study-planner-db`: PostgreSQL 데이터베이스

배포 방법:

1. GitHub에 프로젝트를 push합니다.
2. Render에서 `New +`를 클릭합니다.
3. `Blueprint`를 선택합니다.
4. GitHub 저장소를 연결합니다.
5. 루트의 `render.yaml`을 선택해 배포합니다.
6. Render Web Service의 Settings에서 Deploy Hook URL을 복사합니다.
7. GitHub 저장소 Settings > Secrets and variables > Actions에 `RENDER_DEPLOY_HOOK_URL`로 등록합니다.

배포 후 접속 주소 예시:

```text
https://study-planner.onrender.com
```

Render에서 서비스 이름이 이미 사용 중이면 주소가 달라질 수 있습니다. 그 경우 Render 환경 변수 `CLIENT_ORIGIN`을 실제 Render 주소로 바꾸면 됩니다.

## CI/CD

GitHub Actions는 push 또는 pull request마다 아래 작업을 실행합니다.

- client 의존성 설치 및 빌드
- server 의존성 설치 및 문법 검사
- main 브랜치 push일 때 Render Deploy Hook 호출

Render의 기본 자동 배포는 `render.yaml`에서 꺼두었습니다. 배포는 GitHub Actions가 성공한 뒤에만 실행됩니다.
