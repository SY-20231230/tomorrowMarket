import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import graphImg2 from "../assets/img/graph_2.png"; // 새로운 전체 배경 이미지

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-page-container" style={{
      backgroundImage: `url(${graphImg2})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>

      {/* 1. 좌측 쇼케이스 섹션 (투명 배경으로 변경하여 전체 배경 노출) */}
      <section className="login-visual-section" style={{
        background: "transparent",
        padding: "80px 60px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        {/* 상단 텍스트 영역 */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 className="visual-headline">
            <span>AI</span>가 시장을 읽고,<br />
            내일의 기회를 발견합니다
          </h1>
          <p className="visual-description" style={{ marginTop: "20px" }}>
            내일장 AI 분석 플랫폼에 오신 것을 환영합니다.<br />
            데이터 기반의 정확한 예측과 인사이트를 경험하세요.
          </p>
        </div>

        {/* 중앙 데이터 카드 영역 */}
        <div style={{ position: "relative", flexGrow: 1, minHeight: "200px" }}>
          <div className="data-card" style={{ top: "15%", left: "5%" }}>
            <div style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "4px" }}>KOSPI</div>
            <div style={{ fontWeight: 950, fontSize: "18px" }}>2,874.32</div>
            <div style={{ color: "#10b981", fontSize: "11px" }}>▲ 1.23%</div>
          </div>

          <div className="data-card" style={{ bottom: "30%", right: "15%", borderColor: "var(--cyan)", background: "rgba(15, 23, 42, 0.9)" }}>
            <div style={{ color: "var(--cyan)", fontSize: "10px", fontWeight: 900 }}>AI PREDICTION</div>
            <div style={{ fontWeight: 950, fontSize: "22px" }}>UP 82%</div>
          </div>
        </div>

        {/* 하단 스태츠 바 */}
        <div className="stat-bottom-bar" style={{ position: "relative", zIndex: 2 }}>
          <div className="stat-item">
            <div className="stat-icon">🎯</div>
            <div>
              <div className="stat-value">78.2%</div>
              <div className="stat-label">AI 예측 정확도</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📈</div>
            <div>
              <div className="stat-value">72.8%</div>
              <div className="stat-label">시장 적중률</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📄</div>
            <div>
              <div className="stat-value">9,842건</div>
              <div className="stat-label">뉴스 분석 건수</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 우측 로그인 폼 섹션 */}
      <section className="login-form-section">
        <div className="login-card">
          <h2 style={{ fontSize: "28px", fontWeight: 950, marginBottom: "8px" }}>로그인</h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "40px", fontWeight: 700 }}>
            내일장 계정으로 로그인하여 서비스를 이용하세요.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); navigate("/home"); }}>
            <div className="form-group">
              <label className="form-label">이메일</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input type="email" className="login-input" placeholder="이메일 주소를 입력하세요" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">비밀번호</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type="password" className="login-input" placeholder="비밀번호를 입력하세요" required />
                <span style={{ position: "absolute", right: "16px", color: "#475569", cursor: "pointer" }}>👁</span>
              </div>
            </div>

            <div className="form-footer">
              <div className="checkbox-group">
                <input type="checkbox" id="keep" style={{ width: "16px", height: "16px" }} />
                <label htmlFor="keep">로그인 상태 유지</label>
              </div>
              <div className="footer-links">
                <span className="footer-link">비밀번호 찾기</span>
                <span style={{ color: "#334155" }}>|</span>
                <span className="footer-link" onClick={() => navigate("/signup")}>회원가입</span>
              </div>
            </div>

            <button type="submit" className="login-submit-btn">로그인</button>

            <div className="social-divider">또는</div>

            <button type="button" className="google-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.707a5.41 5.41 0 010-3.414V4.961H.957a8.992 8.992 0 000 8.078l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Google 계정으로 로그인
            </button>

            <div className="security-info">
              <span style={{ fontSize: "18px" }}>🛡</span>
              <div className="security-text">
                내일장은 고객님의 정보를 안전하게 보호합니다.<br />
                256-bit SSL 암호화 적용
              </div>
            </div>
          </form>
        </div>
      </section>

    </div>
  );
}

export default LoginPage;