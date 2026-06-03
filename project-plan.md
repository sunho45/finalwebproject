# finalwebproject 프로젝트 계획서

## 1. 프로젝트 주제

본 프로젝트는 사용자가 공부계획을 기록하고 관리할 수 있는 웹 기반 학습 플래너를 구현하는 것을 목표로 한다. 사용자는 할 일, 과목, 날짜, 예상 소요 분을 입력할 수 있으며, 등록된 계획의 완료 여부를 체크하거나 삭제할 수 있다.

단순히 화면에서만 동작하는 할 일 목록이 아니라, Express 서버와 PostgreSQL 데이터베이스를 연결하여 실제 데이터가 저장되는 웹 서비스를 구현한다.

## 2. 프로젝트 목표

- React를 사용한 사용자 화면 구현
- Express를 사용한 백엔드 API 서버 구현
- PostgreSQL DBMS를 사용한 공부계획 데이터 저장
- Web Storage를 사용한 사용자 설정 및 입력값 저장
- Nginx reverse proxy를 사용한 프론트엔드와 백엔드 요청 분리
- Docker Compose를 사용한 로컬 통합 실행 환경 구성
- Render Docker Web Service를 사용한 배포
- GitHub Actions를 사용한 CI 빌드 검증

## 3. 개발 범위

| 구분 | 구현 내용 |
| --- | --- |
| 계획 등록 | 제목, 과목, 날짜, 예상 소요 분 입력 후 저장 |
| 계획 조회 | 저장된 공부계획 목록 표시 |
| 완료 처리 | 각 계획의 완료 여부 변경 |
| 계획 삭제 | 필요 없는 계획 삭제 |
| 통계 표시 | 전체 계획 수, 완료 계획 수, 누적 공부 분 표시 |
| 필터 기능 | 전체, 진행 중, 완료 항목 구분 |
| 테마 설정 | 라이트/다크 테마 전환 |
| 입력값 보존 | 작성 중인 계획 초안을 sessionStorage에 임시 저장 |
| 사용자별 데이터 | 브라우저별 사용자 키를 기준으로 계획 분리 |

## 4. 프론트엔드 계획

프론트엔드는 React와 Vite를 사용하여 구현한다. React 컴포넌트에서 입력 폼, 계획 목록, 통계 영역, 필터 버튼, 테마 전환 기능을 구성한다.

주요 상태 관리는 `useState`, `useEffect`, `useMemo`를 사용한다. API 요청은 `/api/tasks` 경로로 보내며, 배포 환경에서는 Nginx가 이 요청을 Express 서버로 전달한다.

주요 구현 항목은 다음과 같다.

- 공부계획 입력 폼
- 계획 목록 렌더링
- 완료 상태 표시
- 삭제 버튼
- 오늘 진행률 표시
- 전체, 진행 중, 완료 필터
- 라이트/다크 테마 전환
- 반응형 스타일 적용

## 5. 백엔드 계획

백엔드는 Node.js와 Express를 사용하여 REST API 서버로 구현한다. 서버는 공부계획 목록 조회, 계획 등록, 완료 상태 변경, 삭제 기능을 API로 제공한다.

데이터베이스는 PostgreSQL을 사용한다. 서버 시작 시 `tasks` 테이블이 없으면 자동으로 생성되도록 구성한다. 또한 `/api/health` API는 서버 상태뿐 아니라 DB 초기화 상태까지 확인하여 배포 환경에서 문제를 쉽게 확인할 수 있도록 한다.

## 6. API 설계

클라이언트는 브라우저에 저장된 사용자 키를 `X-Planner-User` 헤더로 전달한다. 서버는 이 값을 기준으로 사용자별 계획을 구분한다. 헤더가 없는 경우에는 기본 사용자 값으로 처리하여 API가 실패하지 않도록 한다.

| Method | Endpoint | 기능 |
| --- | --- | --- |
| GET | `/api/health` | 서버 및 DB 상태 확인 |
| GET | `/api/tasks` | 계획 목록과 통계 조회 |
| POST | `/api/tasks` | 새 계획 등록 |
| PATCH | `/api/tasks/:id` | 완료 상태 변경 |
| DELETE | `/api/tasks/:id` | 계획 삭제 |

API 동작 흐름은 다음과 같다.

```text
React 화면
  -> /api 요청
  -> Nginx reverse proxy
  -> Express 서버
  -> PostgreSQL
  -> JSON 응답
  -> React 화면 갱신
```

## 7. 주요 라이브러리 및 기술

| 영역 | 기술 | 목적 |
| --- | --- | --- |
| Frontend | React | 화면 구성 및 상태 관리 |
| Frontend | Vite | 개발 서버 및 빌드 |
| Backend | Express | REST API 서버 |
| Backend | pg | PostgreSQL 연결 |
| Backend | cors | CORS 설정 |
| Backend | dotenv | 환경 변수 관리 |
| DBMS | PostgreSQL | 계획 데이터 저장 |
| Infra | Nginx | reverse proxy |
| Infra | Docker | 컨테이너 기반 실행 |
| Infra | Docker Compose | 로컬 통합 실행 |
| Deploy | Render | 배포 |
| CI | GitHub Actions | 빌드 및 문법 검사 |

## 8. Web Storage 활용 계획

Web Storage는 사용자 편의성과 데이터 구분을 위해 사용한다.

- `localStorage`: 브라우저별 사용자 키 저장
- `localStorage`: 테마, 필터, 기본 집중 분 저장
- `sessionStorage`: 작성 중인 계획 초안 임시 저장

`localStorage`에 저장된 사용자 키는 로그인 기능을 대체하는 간단한 구분 값으로 사용한다. 같은 브라우저에서는 자신의 계획을 계속 조회할 수 있고, 다른 브라우저에서는 다른 사용자 데이터로 분리된다.

## 9. DBMS 설계

DBMS는 PostgreSQL을 사용한다. 공부계획 데이터는 `tasks` 테이블에 저장한다.

| 컬럼 | 설명 |
| --- | --- |
| `id` | 계획 고유 ID |
| `user_key` | 브라우저별 사용자 키 |
| `title` | 공부계획 제목 |
| `subject` | 과목 |
| `due_date` | 계획 날짜 |
| `minutes` | 예상 소요 분 |
| `done` | 완료 여부 |
| `created_at` | 생성 시각 |

데이터 무결성을 위해 제목, 과목, 날짜, 예상 소요 분은 필수값으로 설정한다. 예상 소요 분은 0보다 큰 값만 저장되도록 제한한다.

## 10. Reverse Proxy 계획

Nginx는 reverse proxy로 사용한다. 사용자는 하나의 주소로 접속하지만, Nginx가 요청 경로에 따라 내부 서비스를 나누어 처리한다.

- `/api/` 요청: Express 서버로 전달
- 그 외 요청: React 빌드 결과 정적 파일 제공

이 구조를 사용하면 프론트엔드와 백엔드를 분리해서 개발하면서도 사용자에게는 하나의 웹사이트처럼 제공할 수 있다. 또한 API 서버 주소를 직접 노출하지 않고, 요청 흐름을 Nginx 설정에서 관리할 수 있다.

## 11. Docker 실행 계획

Docker는 로컬 실행 환경과 배포 환경을 일관되게 관리하기 위해 사용한다. 로컬에서는 Docker Compose로 여러 서비스를 동시에 실행하고, 배포에서는 Render Docker Web Service가 루트의 `Dockerfile`을 기준으로 이미지를 빌드한다.

로컬 실행은 Docker Compose를 사용한다. 로컬 환경에서는 프론트엔드, 백엔드, 데이터베이스, Nginx를 각각 컨테이너로 분리하여 실행한다.

| 서비스 | 역할 |
| --- | --- |
| `db` | PostgreSQL 데이터베이스 |
| `server` | Express API 서버 |
| `client` | React 정적 파일 제공 |
| `nginx` | reverse proxy |

로컬 실행 명령은 다음과 같다.

```bash
docker compose up --build
```

로컬 Docker Compose 실행 시 동작 순서는 다음과 같다.

1. `db` 컨테이너가 PostgreSQL을 실행한다.
2. `server` 컨테이너가 Express API 서버를 실행하고 PostgreSQL에 연결한다.
3. `client` 컨테이너가 React 프로젝트를 빌드하고 정적 파일을 제공한다.
4. `nginx` 컨테이너가 가장 앞단에서 요청을 받아 `/` 요청은 client로, `/api` 요청은 server로 전달한다.

로컬 실행 구조:

```text
Browser
  -> Nginx :8080
    -> /: React client
    -> /api: Express server
  -> PostgreSQL
```

배포 환경에서는 Docker Compose를 그대로 사용하지 않는다. Render는 하나의 Docker Web Service를 실행하므로, 루트의 `Dockerfile`에서 React 빌드, Express 서버 설치, Nginx 설정을 하나의 이미지 안에 포함한다.

Render Docker 이미지 빌드 흐름은 다음과 같다.

1. 첫 번째 빌드 단계에서 `client`의 React 앱을 빌드한다.
2. 최종 이미지에 Node.js, Nginx, Express 서버 코드, React 빌드 결과를 포함한다.
3. `scripts/render-start.sh`가 Express 서버를 백그라운드로 실행한다.
4. 같은 컨테이너 안에서 Nginx를 실행하여 외부 요청을 받는다.
5. Nginx는 `/api` 요청을 내부 Express 서버로 프록시하고, 그 외 요청은 React 정적 파일로 처리한다.

배포용 Docker 실행 구조:

```text
Render Docker Container
  -> Nginx
    -> /: React dist
    -> /api: Express server
  -> Express
  -> Render PostgreSQL
```

## 12. 배포 계획

배포는 Render를 기준으로 한다. Render Web Service는 Docker 런타임으로 실행되며, 컨테이너 내부에서 Nginx와 Express 서버를 함께 실행한다.

배포 구조:

```text
Browser
  -> Render Docker Web Service
  -> Nginx
    -> /: React dist 정적 파일
    -> /api: Express server
  -> Render PostgreSQL
```

Render는 `render.yaml`을 통해 Docker Web Service 설정을 관리한다. 데이터베이스는 이미 생성된 Render PostgreSQL의 `DATABASE_URL`을 환경 변수로 연결한다. 새 DB를 Blueprint에서 자동 생성하지 않도록 구성한다.

## 13. CI/CD 계획

GitHub Actions는 push 또는 pull request마다 다음 작업을 수행한다.

- client 의존성 설치
- React 빌드 검사
- server 의존성 설치
- Express 서버 문법 검사

Render는 GitHub 저장소의 main 브랜치 변경을 감지하여 자동 배포를 수행한다. 따라서 GitHub Actions는 코드 검증 역할을 하고, Render는 실제 Docker 이미지 빌드와 배포를 담당한다.

## 14. 기대 효과

이 프로젝트를 통해 프론트엔드, 백엔드, 데이터베이스, Web Storage, Docker, Nginx, CI, 배포까지 연결된 전체 웹 서비스 구조를 경험할 수 있다.

최종적으로는 단순한 화면 구현을 넘어 실제 저장소와 배포 환경을 고려한 학습 플래너 서비스를 완성하는 것을 목표로 한다.
