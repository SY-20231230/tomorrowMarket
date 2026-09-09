USE tomorrowmarket;


-- =========================================================
-- 1. 사용자
-- =========================================================
CREATE TABLE `USERS` (
    `USERS_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `EMAIL` VARCHAR(100) NOT NULL COMMENT '이메일이 로그인 아이디',
    `NAME` VARCHAR(50) NULL,
    `PASSWORD` VARCHAR(500) NOT NULL,
    `BIRTHDATE` DATE NULL,
    `ROLE` VARCHAR(20) NOT NULL DEFAULT 'USER',
    `STATUS` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT `PK_USERS`
        PRIMARY KEY (`USERS_ID`),

    CONSTRAINT `UQ_USERS_EMAIL`
        UNIQUE (`EMAIL`),

    CONSTRAINT `CK_USERS_ROLE`
        CHECK (`ROLE` IN ('USER', 'ADMIN')),

    CONSTRAINT `CK_USERS_STATUS`
        CHECK (`STATUS` IN ('ACTIVE', 'SUSPENDED', 'WITHDRAWN'))
);


-- =========================================================
-- 2. 산업군
-- =========================================================
CREATE TABLE `SECTORS` (
    `SECTORS_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `NAME` VARCHAR(20) NULL,

    CONSTRAINT `PK_SECTORS`
        PRIMARY KEY (`SECTORS_ID`),

    CONSTRAINT `UQ_SECTORS_NAME`
        UNIQUE (`NAME`)
);


-- =========================================================
-- 3. 주식
-- =========================================================
CREATE TABLE `STOCKS` (
    `STOCK_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `SECTORS_ID` BIGINT NOT NULL,
    `NAME` VARCHAR(50) NULL,
    `STOCK_CODE` VARCHAR(20) NOT NULL,
    `MARKET_TYPE` VARCHAR(20) NOT NULL,
    `IS_ACTIVE` BOOLEAN NOT NULL DEFAULT TRUE,
    `CREATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `PK_STOCKS`
        PRIMARY KEY (`STOCK_ID`),

    CONSTRAINT `UQ_STOCKS_STOCK_CODE`
        UNIQUE (`STOCK_CODE`),

    CONSTRAINT `CK_STOCKS_MARKET_TYPE`
        CHECK (`MARKET_TYPE` IN ('KOSPI', 'KOSDAQ')),

    CONSTRAINT `FK_SECTORS_TO_STOCKS`
        FOREIGN KEY (`SECTORS_ID`)
        REFERENCES `SECTORS` (`SECTORS_ID`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- 4. 기사
-- =========================================================
CREATE TABLE `ARTICLES` (
    `ARTICLE_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `SECTORS_ID` BIGINT NOT NULL,
    `STOCK_ID` BIGINT NULL,
    `TITLE` VARCHAR(255) NULL,
    `SUMMARY` TEXT NULL,
    `CONFIDENCE_SCORE` DECIMAL(6,5) NULL,
    `SENTIMENT_SCORE` DECIMAL(6,5) NULL,
    `SENTIMENT_LABEL` VARCHAR(10) NULL COMMENT '긍정·부정·중립',
    `REGISTRATION_DATE` TIMESTAMP NULL,

    CONSTRAINT `PK_ARTICLES`
        PRIMARY KEY (`ARTICLE_ID`),

    CONSTRAINT `CK_ARTICLES_CONFIDENCE_SCORE`
        CHECK (
            `CONFIDENCE_SCORE` IS NULL
            OR `CONFIDENCE_SCORE` BETWEEN 0 AND 1
        ),

    CONSTRAINT `CK_ARTICLES_SENTIMENT_SCORE`
        CHECK (
            `SENTIMENT_SCORE` IS NULL
            OR `SENTIMENT_SCORE` BETWEEN -1 AND 1
        ),

    CONSTRAINT `CK_ARTICLES_SENTIMENT_LABEL`
        CHECK (
            `SENTIMENT_LABEL` IS NULL
            OR `SENTIMENT_LABEL` IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')
        ),

    CONSTRAINT `FK_SECTORS_TO_ARTICLES`
        FOREIGN KEY (`SECTORS_ID`)
        REFERENCES `SECTORS` (`SECTORS_ID`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT `FK_STOCKS_TO_ARTICLES`
        FOREIGN KEY (`STOCK_ID`)
        REFERENCES `STOCKS` (`STOCK_ID`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


-- =========================================================
-- 5. 접속 로그
-- =========================================================
CREATE TABLE `ACCESS_LOG` (
    `ACCESS_LOG_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `USERS_ID` BIGINT NULL,
    `SESSION_ID` VARCHAR(100) NOT NULL,
    `REFERER` VARCHAR(500) NULL,
    `ENTRY_PAGE` VARCHAR(500) NULL,
    `SOURCE_TYPE` VARCHAR(30) NOT NULL,
    `ACCESS_TIME` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `PK_ACCESS_LOG`
        PRIMARY KEY (`ACCESS_LOG_ID`),

    CONSTRAINT `FK_USERS_TO_ACCESS_LOG`
        FOREIGN KEY (`USERS_ID`)
        REFERENCES `USERS` (`USERS_ID`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);


-- =========================================================
-- 6. 검색 로그
-- =========================================================
CREATE TABLE `SEARCH_LOG` (
    `SEARCH_LOG_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `USERS_ID` BIGINT NOT NULL,
    `STOCK_ID` BIGINT NOT NULL,
    `SEARCH_TIME` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `PK_SEARCH_LOG`
        PRIMARY KEY (`SEARCH_LOG_ID`),

    CONSTRAINT `FK_USERS_TO_SEARCH_LOG`
        FOREIGN KEY (`USERS_ID`)
        REFERENCES `USERS` (`USERS_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT `FK_STOCKS_TO_SEARCH_LOG`
        FOREIGN KEY (`STOCK_ID`)
        REFERENCES `STOCKS` (`STOCK_ID`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- 7. 주식 기록
-- =========================================================
CREATE TABLE `STOCKS_HISTORY` (
    `STOCKS_HISTORY_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `STOCK_ID` BIGINT NOT NULL,
    `CLOSING_PRICE` DECIMAL(15,2) NULL,
    `PERFORMANCE` DECIMAL(10,4) NULL,
    `HISTORY_DATE` DATE NULL COMMENT '거래일',

    CONSTRAINT `PK_STOCKS_HISTORY`
        PRIMARY KEY (`STOCKS_HISTORY_ID`),

    CONSTRAINT `UQ_STOCKS_HISTORY_STOCK_DATE`
        UNIQUE (`STOCK_ID`, `HISTORY_DATE`),

    CONSTRAINT `FK_STOCKS_TO_STOCKS_HISTORY`
        FOREIGN KEY (`STOCK_ID`)
        REFERENCES `STOCKS` (`STOCK_ID`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- 8. 관심 분야
-- =========================================================
CREATE TABLE `INTERESTS` (
    `INTEREST_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `USERS_ID` BIGINT NOT NULL,
    `SECTORS_ID` BIGINT NOT NULL,
    `LEVEL` TINYINT NOT NULL,
    `CREATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `PK_INTERESTS`
        PRIMARY KEY (`INTEREST_ID`),

    CONSTRAINT `UQ_INTERESTS_USER_SECTOR`
        UNIQUE (`USERS_ID`, `SECTORS_ID`),

    CONSTRAINT `CK_INTERESTS_LEVEL`
        CHECK (`LEVEL` BETWEEN 1 AND 5),

    CONSTRAINT `FK_USERS_TO_INTERESTS`
        FOREIGN KEY (`USERS_ID`)
        REFERENCES `USERS` (`USERS_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT `FK_SECTORS_TO_INTERESTS`
        FOREIGN KEY (`SECTORS_ID`)
        REFERENCES `SECTORS` (`SECTORS_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 9. 예측 실행
-- =========================================================
CREATE TABLE `PREDICTION_RUNS` (
    `PREDICTION_RUN_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `RUN_TYPE` VARCHAR(30) NOT NULL
        COMMENT '주간·월간·사용자 요청·평가 구분',
    `SCHEDULED_BASE_DATE` DATE NOT NULL
        COMMENT '해당 실행의 공식 기준일',
    `DATA_CUTOFF_DATETIME` DATETIME NULL
        COMMENT '모델 입력 데이터의 마지막 시점',
    `MODEL_NAME` VARCHAR(100) NULL
        COMMENT 'LightGBM 등 모델 이름',
    `MODEL_VERSION` VARCHAR(50) NULL
        COMMENT '실행한 모델 버전',
    `RUN_STATUS` VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        COMMENT '실행 상태',
    `TOTAL_STOCK_COUNT` INT NOT NULL DEFAULT 0
        COMMENT '처리 대상 종목 수',
    `EXPECTED_RESULT_COUNT` INT NOT NULL DEFAULT 0
        COMMENT '생성되어야 할 예측 결과 수',
    `SUCCESS_COUNT` INT NOT NULL DEFAULT 0
        COMMENT '정상 처리된 건수',
    `FAILURE_COUNT` INT NOT NULL DEFAULT 0
        COMMENT '실패하거나 누락된 건수',
    `STARTED_AT` DATETIME NULL
        COMMENT '실제 작업 시작 시각',
    `FINISHED_AT` DATETIME NULL
        COMMENT '실제 작업 종료 시각',
    `ERROR_MESSAGE` TEXT NULL
        COMMENT '전체 실행 오류 요약',
    `CREATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '실행 레코드 생성 시각',

    CONSTRAINT `PK_PREDICTION_RUNS`
        PRIMARY KEY (`PREDICTION_RUN_ID`),

    CONSTRAINT `CK_PREDICTION_RUNS_RUN_TYPE`
        CHECK (
            `RUN_TYPE` IN (
                'WEEKLY_SHORT',
                'MONTHLY_LONG',
                'ON_DEMAND',
                'DAILY_EVALUATION'
            )
        ),

    CONSTRAINT `CK_PREDICTION_RUNS_RUN_STATUS`
        CHECK (
            `RUN_STATUS` IN (
                'PENDING',
                'RUNNING',
                'SUCCESS',
                'PARTIAL_SUCCESS',
                'FAILED'
            )
        ),

    CONSTRAINT `CK_PREDICTION_RUNS_COUNTS`
        CHECK (
            `TOTAL_STOCK_COUNT` >= 0
            AND `EXPECTED_RESULT_COUNT` >= 0
            AND `SUCCESS_COUNT` >= 0
            AND `FAILURE_COUNT` >= 0
        )
);


-- =========================================================
-- 10. 주가 예측
-- =========================================================
CREATE TABLE `PREDICTIONS` (
    `PREDICTION_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `STOCK_ID` BIGINT NULL,
    `PREDICTION_RUN_ID` BIGINT NOT NULL
        COMMENT '실행 기록 식별자',
    `PREDICTION_PRICE` DECIMAL(15,2) NULL,
    `TARGET_DATE` DATE NOT NULL,
    `CREATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '예측 저장일시',
    `PREDICTION_SOURCE` VARCHAR(30) NOT NULL
        COMMENT '정기 주간·정기 월간·사용자 요청',
    `PREDICTION_PERIOD` INT NOT NULL
        COMMENT '몇 영업일 뒤 예측인지',
    `BASE_DATE` DATE NOT NULL
        COMMENT '예측 기준 거래일',
    `BASE_DATETIME` DATETIME NULL
        COMMENT '사용자 요청 등 정확한 기준 시각',
    `BASE_PRICE` DECIMAL(15,2) NOT NULL
        COMMENT '예측 기준 시점의 종가 또는 현재가',
    `PREDICTED_RETURN_RATE` DECIMAL(10,4) NULL
        COMMENT '기준가 대비 예상 수익률',
    `PREDICTED_DIRECTION` VARCHAR(10) NULL
        COMMENT '상승·하락·보합',
    `MODEL_NAME` VARCHAR(100) NULL
        COMMENT '실제 결과 생성 모델',
    `MODEL_VERSION` VARCHAR(50) NULL
        COMMENT '모델 변경 추적',
    `EVALUATION_STATUS` VARCHAR(20) NOT NULL DEFAULT 'WAITING'
        COMMENT '실제 가격 평가 상태',

    CONSTRAINT `PK_PREDICTIONS`
        PRIMARY KEY (`PREDICTION_ID`),

    CONSTRAINT `UQ_PREDICTIONS_RUN_STOCK_PERIOD`
        UNIQUE (
            `PREDICTION_RUN_ID`,
            `STOCK_ID`,
            `PREDICTION_PERIOD`
        ),

    CONSTRAINT `CK_PREDICTIONS_SOURCE`
        CHECK (
            `PREDICTION_SOURCE` IN (
                'SCHEDULED_WEEKLY',
                'SCHEDULED_MONTHLY',
                'ON_DEMAND'
            )
        ),

    CONSTRAINT `CK_PREDICTIONS_PERIOD`
        CHECK (
            `PREDICTION_PERIOD` IN (
                1, 2, 3, 4, 5, 10, 15, 20
            )
        ),

    CONSTRAINT `CK_PREDICTIONS_DIRECTION`
        CHECK (
            `PREDICTED_DIRECTION` IS NULL
            OR `PREDICTED_DIRECTION` IN ('UP', 'DOWN', 'FLAT')
        ),

    CONSTRAINT `CK_PREDICTIONS_EVALUATION_STATUS`
        CHECK (
            `EVALUATION_STATUS` IN (
                'WAITING',
                'COMPLETED',
                'FAILED'
            )
        ),

    CONSTRAINT `FK_STOCKS_TO_PREDICTIONS`
        FOREIGN KEY (`STOCK_ID`)
        REFERENCES `STOCKS` (`STOCK_ID`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT `FK_PREDICTION_RUNS_TO_PREDICTIONS`
        FOREIGN KEY (`PREDICTION_RUN_ID`)
        REFERENCES `PREDICTION_RUNS` (`PREDICTION_RUN_ID`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- =========================================================
-- 11. 예측 평가
-- =========================================================
CREATE TABLE `PREDICTION_EVALUATIONS` (
    `PREDICTION_EVALUATION_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `PREDICTION_ID` BIGINT NOT NULL,
    `ACTUAL_PRICE` DECIMAL(15,2) NOT NULL,
    `PRICE_DIFFERENCE` DECIMAL(15,2) NOT NULL,
    `ABSOLUTE_ERROR` DECIMAL(15,2) NOT NULL,
    `ERROR_RATE` DECIMAL(10,4) NOT NULL,
    `ACTUAL_RETURN_RATE` DECIMAL(10,4) NULL,
    `ACTUAL_DIRECTION` VARCHAR(100) NULL,
    `DIRECTION_CORRECT` BOOLEAN NULL,
    `EVALUATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT `PK_PREDICTION_EVALUATIONS`
        PRIMARY KEY (`PREDICTION_EVALUATION_ID`),

    CONSTRAINT `UQ_PREDICTION_EVALUATIONS_PREDICTION`
        UNIQUE (`PREDICTION_ID`),

    CONSTRAINT `CK_PREDICTION_EVALUATIONS_DIRECTION`
        CHECK (
            `ACTUAL_DIRECTION` IS NULL
            OR `ACTUAL_DIRECTION` IN ('UP', 'DOWN', 'FLAT')
        ),

    CONSTRAINT `CK_PREDICTION_EVALUATIONS_ERROR`
        CHECK (
            `ABSOLUTE_ERROR` >= 0
            AND `ERROR_RATE` >= 0
        ),

    CONSTRAINT `FK_PREDICTIONS_TO_PREDICTION_EVALUATIONS`
        FOREIGN KEY (`PREDICTION_ID`)
        REFERENCES `PREDICTIONS` (`PREDICTION_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 12. 사용자 예측 요청
-- =========================================================
CREATE TABLE `PREDICTION_REQUESTS` (
    `PREDICTION_REQUEST_ID` BIGINT NOT NULL AUTO_INCREMENT,
    `PREDICTION_RUN_ID` BIGINT NULL,
    `STOCK_ID` BIGINT NOT NULL,
    `USERS_ID` BIGINT NOT NULL,
    `REQUEST_STATUS` VARCHAR(200) NOT NULL DEFAULT 'REQUESTED',
    `RESULT_SOURCE` VARCHAR(200) NULL,
    `REQUESTED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `COMPLETED_AT` DATETIME NULL,
    `FAILURE_REASON` TEXT NULL,

    CONSTRAINT `PK_PREDICTION_REQUESTS`
        PRIMARY KEY (`PREDICTION_REQUEST_ID`),

    CONSTRAINT `CK_PREDICTION_REQUESTS_STATUS`
        CHECK (
            `REQUEST_STATUS` IN (
                'REQUESTED',
                'RUNNING',
                'COMPLETED',
                'FAILED'
            )
        ),

    CONSTRAINT `CK_PREDICTION_REQUESTS_RESULT_SOURCE`
        CHECK (
            `RESULT_SOURCE` IS NULL
            OR `RESULT_SOURCE` IN (
                'NEW_MODEL_RUN',
                'CACHED_RESULT'
            )
        ),

    CONSTRAINT `FK_PREDICTION_RUNS_TO_PREDICTION_REQUESTS`
        FOREIGN KEY (`PREDICTION_RUN_ID`)
        REFERENCES `PREDICTION_RUNS` (`PREDICTION_RUN_ID`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT `FK_STOCKS_TO_PREDICTION_REQUESTS`
        FOREIGN KEY (`STOCK_ID`)
        REFERENCES `STOCKS` (`STOCK_ID`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT `FK_USERS_TO_PREDICTION_REQUESTS`
        FOREIGN KEY (`USERS_ID`)
        REFERENCES `USERS` (`USERS_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

USE tomorrowmarket;



-- =========================================================
-- 1. 관심 종목
-- 사용자별 관심 종목 등록 및 중복 등록 방지
-- =========================================================
CREATE TABLE `WATCHLISTS` (
    `WATCHLIST_ID` BIGINT NOT NULL AUTO_INCREMENT
        COMMENT '관심 종목 식별자',

    `USERS_ID` BIGINT NOT NULL
        COMMENT '사용자 식별자',

    `STOCK_ID` BIGINT NOT NULL
        COMMENT '종목 식별자',

    `CREATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '관심 종목 등록 일시',

    CONSTRAINT `PK_WATCHLISTS`
        PRIMARY KEY (`WATCHLIST_ID`),

    CONSTRAINT `UQ_WATCHLISTS_USER_STOCK`
        UNIQUE (`USERS_ID`, `STOCK_ID`),

    CONSTRAINT `FK_USERS_TO_WATCHLISTS`
        FOREIGN KEY (`USERS_ID`)
        REFERENCES `USERS` (`USERS_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT `FK_STOCKS_TO_WATCHLISTS`
        FOREIGN KEY (`STOCK_ID`)
        REFERENCES `STOCKS` (`STOCK_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 2. 비밀번호 재설정 토큰
-- 이메일로 발급한 비밀번호 재설정 링크 관리
-- =========================================================
CREATE TABLE `PASSWORD_RESET_TOKENS` (
    `PASSWORD_RESET_TOKEN_ID` BIGINT NOT NULL AUTO_INCREMENT
        COMMENT '비밀번호 재설정 토큰 식별자',

    `USERS_ID` BIGINT NOT NULL
        COMMENT '비밀번호 재설정을 요청한 사용자',

    `TOKEN_HASH` VARCHAR(255) NOT NULL
        COMMENT '비밀번호 재설정 토큰 해시값',

    `EXPIRES_AT` DATETIME NOT NULL
        COMMENT '토큰 만료 일시',

    `USED_AT` DATETIME NULL
        COMMENT '토큰 사용 완료 일시',

    `CREATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '토큰 발급 일시',

    CONSTRAINT `PK_PASSWORD_RESET_TOKENS`
        PRIMARY KEY (`PASSWORD_RESET_TOKEN_ID`),

    CONSTRAINT `UQ_PASSWORD_RESET_TOKENS_HASH`
        UNIQUE (`TOKEN_HASH`),

    CONSTRAINT `CK_PASSWORD_RESET_TOKEN_EXPIRATION`
        CHECK (`EXPIRES_AT` > `CREATED_AT`),

    CONSTRAINT `CK_PASSWORD_RESET_TOKEN_USED_AT`
        CHECK (
            `USED_AT` IS NULL
            OR `USED_AT` >= `CREATED_AT`
        ),

    CONSTRAINT `FK_USERS_TO_PASSWORD_RESET_TOKENS`
        FOREIGN KEY (`USERS_ID`)
        REFERENCES `USERS` (`USERS_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 3. Refresh Token
-- Access Token 재발급 및 로그아웃 처리
-- =========================================================
CREATE TABLE `REFRESH_TOKENS` (
    `REFRESH_TOKEN_ID` BIGINT NOT NULL AUTO_INCREMENT
        COMMENT 'Refresh Token 식별자',

    `USERS_ID` BIGINT NOT NULL
        COMMENT '토큰 소유 사용자',

    `TOKEN_HASH` VARCHAR(255) NOT NULL
        COMMENT 'Refresh Token 해시값',

    `EXPIRES_AT` DATETIME NOT NULL
        COMMENT '토큰 만료 일시',

    `REVOKED_AT` DATETIME NULL
        COMMENT '로그아웃 또는 강제 만료 처리 일시',

    `CREATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '토큰 발급 일시',

    CONSTRAINT `PK_REFRESH_TOKENS`
        PRIMARY KEY (`REFRESH_TOKEN_ID`),

    CONSTRAINT `UQ_REFRESH_TOKENS_HASH`
        UNIQUE (`TOKEN_HASH`),

    CONSTRAINT `CK_REFRESH_TOKEN_EXPIRATION`
        CHECK (`EXPIRES_AT` > `CREATED_AT`),

    CONSTRAINT `CK_REFRESH_TOKEN_REVOKED_AT`
        CHECK (
            `REVOKED_AT` IS NULL
            OR `REVOKED_AT` >= `CREATED_AT`
        ),

    CONSTRAINT `FK_USERS_TO_REFRESH_TOKENS`
        FOREIGN KEY (`USERS_ID`)
        REFERENCES `USERS` (`USERS_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- =========================================================
-- 4. 예측 실패 상세
-- 실행 중 종목별·예측 기간별 실패 원인 기록
-- =========================================================
CREATE TABLE `PREDICTION_FAILURES` (
    `PREDICTION_FAILURE_ID` BIGINT NOT NULL AUTO_INCREMENT
        COMMENT '예측 실패 기록 식별자',

    `PREDICTION_RUN_ID` BIGINT NOT NULL
        COMMENT '실패가 발생한 예측 실행',

    `STOCK_ID` BIGINT NULL
        COMMENT '실패가 발생한 종목',

    `PREDICTION_PERIOD` INT NULL
        COMMENT '실패한 예측 영업일 기간',

    `FAILURE_STAGE` VARCHAR(50) NULL
        COMMENT '실패 발생 단계',

    `ERROR_CODE` VARCHAR(50) NULL
        COMMENT '애플리케이션 오류 코드',

    `ERROR_MESSAGE` TEXT NOT NULL
        COMMENT '상세 오류 내용',

    `RETRY_STATUS` VARCHAR(20) NOT NULL DEFAULT 'NOT_RETRIED'
        COMMENT '재시도 처리 상태',

    `RETRY_COUNT` INT NOT NULL DEFAULT 0
        COMMENT '재시도 횟수',

    `RESOLVED_AT` DATETIME NULL
        COMMENT '문제 해결 일시',

    `CREATED_AT` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT '실패 기록 생성 일시',

    CONSTRAINT `PK_PREDICTION_FAILURES`
        PRIMARY KEY (`PREDICTION_FAILURE_ID`),

    CONSTRAINT `CK_PREDICTION_FAILURES_PERIOD`
        CHECK (
            `PREDICTION_PERIOD` IS NULL
            OR `PREDICTION_PERIOD` IN (
                1, 2, 3, 4, 5, 10, 15, 20
            )
        ),

    CONSTRAINT `CK_PREDICTION_FAILURES_RETRY_STATUS`
        CHECK (
            `RETRY_STATUS` IN (
                'NOT_RETRIED',
                'RETRYING',
                'RESOLVED',
                'RETRY_FAILED'
            )
        ),

    CONSTRAINT `CK_PREDICTION_FAILURES_RETRY_COUNT`
        CHECK (`RETRY_COUNT` >= 0),

    CONSTRAINT `CK_PREDICTION_FAILURES_RESOLVED_AT`
        CHECK (
            `RESOLVED_AT` IS NULL
            OR `RESOLVED_AT` >= `CREATED_AT`
        ),

    CONSTRAINT `FK_RUNS_TO_PREDICTION_FAILURES`
        FOREIGN KEY (`PREDICTION_RUN_ID`)
        REFERENCES `PREDICTION_RUNS` (`PREDICTION_RUN_ID`)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT `FK_STOCKS_TO_PREDICTION_FAILURES`
        FOREIGN KEY (`STOCK_ID`)
        REFERENCES `STOCKS` (`STOCK_ID`)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

