# 내일장(TomorrowMarket) 백엔드 개발 가이드라인

## 1. 프로젝트 개요 및 구조
- **주제**: AI 기반 주가예측 및 투자정보 제공 플랫폼
- **기술 스택**: Java 21, Spring Boot 3.3.5, Spring Data JPA, Spring Security, JWT, MySQL, FastAPI 연동
- **아키텍처**:
  - React (프론트엔드) → Spring Boot (REST API)
  - Spring Boot → FastAPI (주가 예측 모델) 
  - 프론트엔드는 FastAPI를 직접 호출하지 않음.

## 2. 개발 및 코딩 원칙
- **JPA 설정**: DB 테이블 구조는 이미 수립/생성되어 있으므로 `ddl-auto: validate`로 설정하여 임의 변경을 막는다.
- **DTO 변환 규칙**: 별도의 Mapper 패키지나 라이브러리를 사용하지 않고, Response DTO 내부에 `from()`, `of()` 정적 메서드를 두어 Entity를 DTO로 변환한다.
- **Entity 응답 금지**: API 응답으로 Entity 객체를 직접 노출하지 않는다. 반드시 DTO로 변환한다.
- **공통 응답 구조**: 모든 API 응답은 `ApiResponse<T>` 또는 `ErrorResponse` 형태로 통일한다.
- **예외 처리**: `@RestControllerAdvice`를 활용해 전역 예외 처리를 구성하고, 에러 코드는 Enum으로 관리한다. 에러 발생 시 내부 스택트레이스 노출은 금지한다.

## 3. 데이터베이스 스키마 설계
- 총 16개의 테이블로 구성 (USERS, SECTORS, STOCKS, ARTICLES, ACCESS_LOG, SEARCH_LOG, STOCKS_HISTORY, INTERESTS, PREDICTION_RUNS, PREDICTIONS, PREDICTION_EVALUATIONS, PREDICTION_REQUESTS, WATCHLISTS, PASSWORD_RESET_TOKENS, REFRESH_TOKENS, PREDICTION_FAILURES)
- **제약 조건**: 
  - 기본키는 `AUTO_INCREMENT` 방식 사용 (`GenerationType.IDENTITY`).
  - 다양한 `CHECK` 제약조건 (예: `EVALUATION_STATUS IN ('WAITING', 'COMPLETED', 'FAILED')`) 및 `UNIQUE` 제약조건이 철저히 설정됨.
  - 연관관계는 기본적으로 단방향, LAZY 로딩을 지향한다.

## 4. 인덱스 최적화 및 쿼리 작성 규칙
- 데이터베이스에 인덱스가 이미 맞춤형으로 생성되어 있으므로 Entity 클래스 내 `@Table(indexes = ...)` 설정은 작성하지 않는다. (스키마 밸리데이션 충돌 방지)
- **Repository 쿼리 작성 시 생성된 복합 인덱스의 컬럼 순서를 엄격하게 따른다.**
  - **최신 정기예측 조회**: `STOCK_ID`, `PREDICTION_SOURCE`, `BASE_DATE DESC`
  - **평가 대기 예측 조회**: `EVALUATION_STATUS`, `TARGET_DATE`
  - **사용자별 재분석 이력**: `USERS_ID`, `REQUEST_STATUS`, `REQUESTED_AT DESC`
  - **종목별 최신 뉴스**: `STOCK_ID`, `REGISTRATION_DATE DESC`

## 5. 보안 및 트랜잭션 정책
- **비밀번호**: BCrypt 단방향 암호화 처리.
- **토큰 관리**: JWT Access Token 및 Refresh Token 활용. DB(`REFRESH_TOKENS`)에는 원문이 아닌 해시값을 저장한다.
- **트랜잭션**: 
  - 비즈니스 로직에는 기본적으로 `@Transactional` 적용. 
  - 단순 조회는 `@Transactional(readOnly = true)` 적용.
  - 외부 API(FastAPI) 호출 시 불필요한 트랜잭션 락 유지를 피하도록 설계 흐름(레코드 생성 -> 외부 API 호출 -> 결과 저장)을 분리 고려.

## 6. 할당된 주요 개발 영역 (F, G, H, I, J)
향후 집중적으로 개발하게 될 기능은 다음과 같다.
- **F. 주가예측 (Predictions)**: 종목별/산업군별 최신 정기 예측 및 이력 조회, 사용자 현재 시점 재분석(On-demand) 요청 처리.
- **G. 예측비교 (Comparison)**: 예측값과 실제 종가 간의 비교 결과(오차율, 방향성 등) 조회 및 성능 통계 집계.
- **H. 관리자 (Admin)**: 대시보드 통계, 사용자 목록 및 상태 관리, 모델 버전 관리 등 관리자 통제 기능.
- **I. 배치관리 (Prediction Runs)**: 주간/월간 예측, 종가 수집, 평가 배치의 실행 이력 추적 및 실패 건 재실행 관리.
- **J. 통계 (Statistics)**: 일별 접속량, 유입 경로, 최다 검색 종목 등 사용자 로그 기반 통계 제공.
