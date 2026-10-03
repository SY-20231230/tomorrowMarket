# 1단계: 빌드 환경 (Builder Stage)
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# 소스 코드 전체 복사
COPY . .

# 윈도우 환경 실행 권한 부여 및 빌드 (테스트 생략)
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2단계: 실행 환경 (Runtime Stage)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 빌드된 JAR 파일만 실행 환경으로 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 스프링 부트 포트 노출
EXPOSE 8080

# 컨테이너 시작 시 JAR 파일 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
