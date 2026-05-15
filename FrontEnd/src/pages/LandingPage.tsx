import { Link, useNavigate } from "react-router-dom"; // useNavigate 추가
import MarketSummary from "../components/market/MarketSummary";
import PredictionPanel from "../components/ai/PredictionPanel";
import "./HomePage.css"; // Reuse the layout styles

function LandingPage() {
  const navigate = useNavigate(); // 추가

  // 핸들러 추가
  const handleMarketAction = (marketName: string, mode: "past" | "ai") => {
    navigate("/market", { state: { marketName, mode } });
  };
  return (
    <div className="home-page"> {/* Use home-page class for global layout */}
      <section className="hero">
        <div className="hero-card">
          <div className="hero-badge">⚡ LIVE AI MARKET SIGNAL</div>
          <h1>AI 기반 주식 분석 플랫폼,<br />내일장</h1>
          <p>
            시장 지수, 뉴스 감성, AI 예측을 한 화면에서 확인하세요. 내일장은 주식 시장 데이터를 기반으로 종목 흐름과 시장 분위기를 분석하는 플랫폼입니다.
          </p>

          <div className="hero-actions">
            <Link to="/home" className="btn primary" style={{ textDecoration: "none", textAlign: "center" }}>대시보드 보기</Link>
            <Link to="/login" className="btn ghost" style={{ textDecoration: "none", textAlign: "center" }}>로그인</Link>
          </div>

          <svg className="hero-visual" viewBox="0 0 420 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroLine" x1="0" x2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient id="heroArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 110 L45 95 L90 104 L135 70 L175 82 L220 48 L265 61 L315 30 L370 46 L420 18 L420 150 L0 150 Z" fill="url(#heroArea)" />
            <path d="M0 110 L45 95 L90 104 L135 70 L175 82 L220 48 L265 61 L315 30 L370 46 L420 18" fill="none" stroke="url(#heroLine)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        <PredictionPanel
          title="코스피 상승 예측 리포트"
          probability={82}
          opinion="주요 지표와 수급 데이터를 분석한 결과, 내일은 IT 및 반도체 섹션 위주의 강세가 예상됩니다."
          riskLevel="안정"
        />
      </section>

      <section style={{ marginTop: "32px" }}>
        <div className="section-header">
          <h2 style={{ fontSize: "27px", fontWeight: "950", color: "#fff", margin: 0 }}>오늘 시장 요약</h2>
          <Link to="/market" className="section-action">REAL-TIME VIEW →</Link>
        </div>
        <MarketSummary onAction={handleMarketAction} />
      </section>
    </div>
  );
}

export default LandingPage;