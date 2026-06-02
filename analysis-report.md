# finalwebproject 분석 보고서

## 1. 프로젝트 개요

`finalwebproject`는 공부 계획을 등록, 조회, 완료 처리, 삭제할 수 있는 학습 플래너 웹 애플리케이션이다. 프론트엔드는 React와 Vite로 구현되어 있고, 백엔드는 Node.js Express 서버가 REST API를 제공한다. 계획 데이터는 PostgreSQL에 저장되며, 로컬 실행은 Docker Compose, 배포는 Render Blueprint를 기준으로 구성되어 있다.

요청에 언급된 `finalwbeproject` 디렉터리는 존재하지 않았고, 실제 프로젝트 디렉터리는 `finalwebproject`로 확인되었다. `requirement.json`에는 프론트엔드, 백엔드, API, 주요 라이브러리, WebStorage, DBMS, reverse-proxy, Docker 계획을 분석하라는 요구사항이 포함되어 있어 해당 항목을 기준으로 분석했다.

## 2. 요구사항 대응 요약

| 요구사항 | 프로젝트 구현 내용 |
| --- | --- |
| frontend | React와 Vite 기반의 학습 계획 관리 화면 |
| backend | Node.js Express 기반 REST API 서버 |
| api | `/api/tasks`, `/api/health` 중심의 자체 Express API |
| main library | React, Vite, Express, pg, cors, dotenv |
| WebStorage | 익명 사용자 ID, 설정, 초안 저장에 `localStorage`와 `sessionStorage` 사용 |
| DBMS | PostgreSQL에 사용자별 계획 데이터 저장 |
| reverse-proxy | Nginx가 `/api/`와 클라이언트 요청을 분리 전달 |
| Docker plan | Docker Compose로 db, server, client, nginx 실행 |

## 3. 주요 기능 분석

사용자는 공부 계획의 제목, 과목, 날짜, 예상 소요 시간을 입력해 계획을 추가할 수 있다. 등록된 계획은 목록으로 표시되며, 각 항목은 완료 상태 변경과 삭제가 가능하다. 전체 계획 수, 완료 계획 수, 완료된 계획의 누적 공부 시간이 통계로 제공되고, 전체 대비 완료율이 진행률 형태로 표시된다.

클라이언트는 사용자의 개인 설정을 브라우저 저장소에 보관한다. 브라우저별 익명 사용자 ID, 테마, 필터, 기본 집중 시간은 `localStorage`에 저장되고, 작성 중인 계획 초안은 `sessionStorage`에 저장된다. 따라서 새로고침 후에도 사용자 구분값, 일부 설정, 입력 중인 값이 유지되는 장점이 있다.

## 4. 프론트엔드 분석

프론트엔드는 `client/src/App.jsx`에서 대부분의 화면 상태와 API 호출을 관리한다. React의 `useState`, `useEffect`, `useMemo`를 사용해 작업 목록, 통계, 필터링 결과, 진행률을 계산한다. 스타일은 `client/src/styles.css`에 정의되어 있으며 라이트/다크 테마, 반응형 레이아웃, 카드형 입력 폼과 작업 목록 UI를 제공한다.

주요 화면 구성은 다음과 같다.

- 공부 계획 입력 폼
- 라이트/다크 테마 전환 버튼
- 기본 집중 시간 설정 슬라이더
- 전체, 진행 중, 완료 필터 탭
- 전체 계획 수, 완료 수, 누적 공부 시간 통계
- 완료율 진행 바
- 계획 목록, 완료 체크, 삭제 버튼

## 5. 백엔드 및 API 분석

백엔드는 `server/src/index.js`에서 Express 앱을 구성한다. 제공되는 API는 다음과 같다.

- `GET /api/health`: 서버 상태 확인
- `GET /api/tasks`: 계획 목록과 통계 조회
- `POST /api/tasks`: 새 계획 등록
- `PATCH /api/tasks/:id`: 완료 상태 변경
- `DELETE /api/tasks/:id`: 계획 삭제

데이터베이스 연결은 `server/src/db.js`에서 PostgreSQL `Pool`을 사용해 처리한다. 서버 시작 시 `tasks` 테이블이 없으면 자동으로 생성되도록 되어 있어 초기 실행 편의성이 좋다.

이 프로젝트에서 사용한 API는 외부 서비스 API가 아니라 프로젝트 내부에서 직접 만든 Express REST API이다. React 클라이언트는 `fetch`를 사용해 `/api` 경로로 요청을 보내고, `localStorage`에 저장된 익명 사용자 ID를 `X-Planner-User` 헤더에 담아 전달한다. Express 서버는 이 사용자 ID를 기준으로 PostgreSQL 데이터베이스에서 해당 사용자의 계획만 처리한다.

API 처리 흐름은 다음과 같다.

```text
React 화면 -> 사용자 ID 포함 fetch('/api/...') -> Express 서버 -> PostgreSQL 사용자별 데이터 -> JSON 응답 -> React 화면 갱신
```

## 6. 주요 라이브러리 분석

프로젝트의 주요 라이브러리는 다음과 같다.

| 구분 | 라이브러리 | 역할 |
| --- | --- | --- |
| Frontend | React | 화면 컴포넌트와 상태 관리 |
| Frontend | React DOM | React 앱을 브라우저 DOM에 렌더링 |
| Frontend | Vite | 개발 서버와 프로덕션 빌드 도구 |
| Backend | Express | REST API 서버 구현 |
| Backend | pg | PostgreSQL 연결 및 SQL 실행 |
| Backend | cors | 클라이언트와 서버 간 CORS 허용 설정 |
| Backend | dotenv | 환경 변수 파일 로드 |
| Infra | Nginx | 정적 파일 제공 및 reverse proxy |
| Infra | Docker Compose | 여러 컨테이너 실행 구성 |

## 7. WebStorage 분석

브라우저 저장소는 두 가지 목적으로 사용된다.

- `localStorage`: 테마, 필터, 기본 집중 시간 저장
- `localStorage`: 브라우저별 익명 사용자 ID 저장
- `sessionStorage`: 작성 중인 공부 계획 초안 저장

`localStorage`는 브라우저를 닫았다가 다시 열어도 값이 남기 때문에 사용자 구분값과 설정 보관에 적합하다. 반면 `sessionStorage`는 현재 탭의 세션 동안 유지되므로, 작성 중인 임시 입력값을 저장하는 데 사용한 선택이 적절하다.

## 8. DBMS 및 데이터베이스 설계

`tasks` 테이블은 다음 주요 컬럼으로 구성된다.

- `id`: 계획 고유 ID
- `user_key`: 브라우저별 익명 사용자 ID
- `title`: 할 일 제목
- `subject`: 과목
- `due_date`: 계획 날짜
- `minutes`: 예상 공부 시간
- `done`: 완료 여부
- `created_at`: 생성 시각

`minutes` 컬럼에는 `CHECK (minutes > 0)` 제약이 있어 0 이하의 시간이 저장되지 않도록 제한한다. 필수 입력값에는 `NOT NULL`이 적용되어 기본적인 데이터 무결성을 확보하고 있다. `user_key` 컬럼에는 인덱스를 추가하여 사용자별 목록 조회 성능을 고려했다.

## 9. Reverse Proxy 분석

로컬 환경에서는 `nginx/default.conf`가 reverse proxy 역할을 한다. 사용자가 `http://localhost:8080`으로 접속하면 Nginx가 가장 앞에서 요청을 받는다.

- `/api/`로 시작하는 요청: `server:4000`의 Express 서버로 전달
- 그 외 요청: `client:80`의 React 정적 파일 서버로 전달

이 구조의 장점은 사용자가 하나의 주소로 접속하면서도 내부적으로 프론트엔드와 백엔드 요청을 분리할 수 있다는 점이다. 또한 CORS 문제를 줄이고, 실제 운영 환경과 비슷한 요청 흐름을 로컬에서도 경험할 수 있다.

## 10. Docker 계획 분석

로컬 환경은 `docker-compose.yml`로 구성되어 있다. PostgreSQL, Express 서버, React 클라이언트, Nginx가 각각 컨테이너로 실행된다. Nginx는 `/api/` 요청을 Express 서버로 전달하고, 그 외 요청은 React 클라이언트로 전달하는 리버스 프록시 역할을 한다.

Docker Compose 서비스 구성은 다음과 같다.

- `db`: PostgreSQL 16 Alpine 이미지 사용, 데이터 볼륨 유지
- `server`: Express 서버 Dockerfile로 빌드, PostgreSQL 연결
- `client`: React 앱을 빌드한 뒤 Nginx로 정적 파일 제공
- `nginx`: 전체 요청을 받아 client와 server로 프록시

Render 배포는 `render.yaml`에 정의되어 있다. Docker Web Service로 배포하며, 컨테이너 안에서 Nginx가 외부 요청을 먼저 받고 Express 서버는 내부 API 포트에서 동작한다. `/api/` 요청은 Nginx가 Express로 프록시하고, 그 외 요청은 React 빌드 결과 정적 파일로 제공한다. `healthCheckPath`도 `/api/health`로 지정되어 있어 Nginx를 거친 API 상태 확인이 가능하다.

## 11. CI/CD 분석

`.github/workflows/render-ci-cd.yml`은 `main` 브랜치의 push와 pull request에서 실행된다. 워크플로는 Node 22 환경에서 루트, 클라이언트, 서버 의존성을 설치하고, 클라이언트 빌드와 서버 문법 검사를 수행한다.

현재 GitHub Actions는 CI 검증 역할을 담당한다. Render 배포는 GitHub 저장소와 연결된 Render 서비스가 main 브랜치 변경을 감지해 진행하는 구조로 볼 수 있다.

## 12. 장점

- 프론트엔드, 백엔드, 데이터베이스, 프록시, 배포 설정이 모두 포함된 풀스택 구조이다.
- PostgreSQL에 데이터를 저장하므로 새로고침이나 서버 재시작 이후에도 계획 데이터 유지가 가능하다.
- `localStorage`와 `sessionStorage`를 기능 목적에 맞게 구분해 사용했다.
- Docker Compose를 통해 로컬 실행 환경을 일관되게 구성했다.
- Render Blueprint와 GitHub Actions를 포함해 실제 배포 흐름까지 고려했다.
- 서버 시작 시 테이블을 자동 생성해 초기 실행 장벽을 낮췄다.

## 13. 보완점

- `POST /api/tasks`의 입력 검증이 비교적 단순하다. 날짜 형식, 제목과 과목의 최대 길이, `minutes`의 허용 범위를 더 명확히 검증하면 안정성이 높아진다.
- 현재 사용자 구분은 로그인 계정이 아니라 브라우저 localStorage의 익명 ID 기준이다. 브라우저를 바꾸거나 localStorage를 삭제하면 기존 사용자 데이터와 연결되지 않는다.
- 클라이언트의 `createTask`, `toggleTask`, `deleteTask`에는 API 실패 시 사용자에게 알려주는 예외 처리가 부족하다.
- 현재 테스트 코드가 없다. API 단위 테스트와 주요 UI 동작 테스트를 추가하면 유지보수성이 좋아진다.
- GitHub Actions의 cache 설정에는 루트 `package-lock.json`이 포함되어 있지만 루트에는 해당 파일이 없다.
- `sql` 파일이 비어 있다. 스키마 문서나 초기 데이터 파일로 사용할 계획이 없다면 제거하거나 목적을 명확히 하는 것이 좋다.

## 14. 검증 결과

분석 중 서버 문법 검사와 클라이언트 빌드를 실행했다.

- `server` 디렉터리에서 `npm run check` 실행: 통과
- `client` 디렉터리에서 `npm install` 실행: 의존성 설치 완료, 취약점 0건
- `client` 디렉터리에서 `npm run build` 실행: 통과

클라이언트 빌드 결과 `dist/index.html`, CSS 번들, JS 번들이 정상 생성되는 것을 확인했다.

## 15. 종합 평가

이 프로젝트는 단순한 할 일 목록을 넘어 실제 웹 서비스의 기본 구성 요소를 폭넓게 포함하고 있다. React 화면, Express API, PostgreSQL 저장소, Docker Compose 로컬 환경, Nginx 프록시, Render 배포 설정, GitHub Actions 검증 흐름이 연결되어 있어 최종 웹 프로젝트로서 완성도가 있다.

가장 큰 강점은 기능 구현과 운영 환경 구성이 함께 되어 있다는 점이다. 반면 입력 검증, 오류 처리, 테스트, CI/CD 문서 일치성은 개선 여지가 있다. 이 부분을 보완하면 학습용 프로젝트를 넘어 더 안정적인 배포형 웹 애플리케이션으로 발전시킬 수 있다.
