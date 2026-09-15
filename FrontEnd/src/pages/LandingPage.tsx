import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PredictionPanel from "../components/ai/PredictionPanel";
import NewsCard from "../components/news/NewsCard";
import { mockNews } from "../data/mockNews"; 
import "./HomePage.css";

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem("isAuthenticated") || !!sessionStorage.getItem("isAuthenticated");
    if (isLoggedIn) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="home-page" style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}> 
      
      {/* 1. 타이틀 영역 (가로 1줄 전체 차지) */}
      <section style={{ marginBottom: "40px" }}>
        <div className="hero-card" style={{ width: "100%", minHeight: "auto", padding: "50px 40px" }}>
          <h1 style={{ fontSize: "42px", lineHeight: "1.3", marginBottom: "24px" }}>
            AI 기반 주식 분석 플랫폼,<br />내일장
          </h1>
          <p style={{ fontSize: "18px", lineHeight: "1.6", color: "var(--text-sub)", maxWidth: "800px", marginBottom: "36px" }}>
            종목 흐름, 뉴스 감성, AI 예측을 한 화면에서 확인하세요. 내일장은 주식 시장 데이터를 기반으로 종목 흐름과 시장 분위기를 분석하는 플랫폼입니다.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="btn primary" style={{ textDecoration: "none", textAlign: "center", width: "240px", fontSize: "18px", padding: "16px" }}>
              로그인 후 이용하기
            </Link>
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
      </section>

      {/* 2. AI 예측 리포트 영역 (가로 1줄 전체 차지) */}
      <section style={{ marginBottom: "70px" }}>
        <div style={{ marginBottom: "30px", borderLeft: "4px solid var(--cyan)", paddingLeft: "16px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "950", color: "#fff", margin: "0 0 12px 0" }}>
            단 한 번의 터치로 확인하는 <span style={{ color: "var(--cyan)" }}>AI 주가 예측 리포트</span>
          </h2>
          <p style={{ fontSize: "16px", color: "var(--text-sub)", lineHeight: "1.7", margin: 0, maxWidth: "800px" }}>
            과거의 차트만 보고 투자하시나요? 내일장의 AI 모델은 지난 10년간의 수급 데이터, 거시 경제 지표, 그리고 당일의 시장 심리를 종합적으로 분석하여 단기 주가 방향성을 예측합니다. 직관적인 신뢰도 점수와 투자 위험도를 통해 복잡한 시장 상황을 한눈에 파악하세요.
          </p>
        </div>
        <PredictionPanel
          title="[예시] 삼성전자 AI 예측 리포트"
          probability={82}
          opinion="최근 주요 지표와 수급 데이터를 분석한 결과, 외국인 매수세 유입으로 단기 상승 추세가 예상됩니다. (이 결과는 임의의 예시입니다)"
          riskLevel="안정"
        />
      </section>

      {/* 3. 최신 뉴스 영역 (가로 1줄씩 전체 차지) */}
      <section style={{ paddingBottom: "80px" }}>
        <div style={{ marginBottom: "40px", borderLeft: "4px solid #10b981", paddingLeft: "16px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "950", color: "#fff", margin: "0 0 12px 0" }}>
            노이즈는 줄이고 핵심만 짚어내는 <span style={{ color: "#10b981" }}>시장 뉴스 분석</span>
          </h2>
          <p style={{ fontSize: "16px", color: "var(--text-sub)", lineHeight: "1.7", margin: 0, maxWidth: "800px" }}>
            매일 쏟아지는 수만 건의 경제 기사 속에서 진짜 의미 있는 정보를 찾기란 쉽지 않습니다. 내일장은 시장에 큰 파급력을 미칠 핵심 뉴스만 선별하고, 해당 뉴스가 주가에 미치는 긍정적/부정적 영향을 즉시 수치화하여 보여줍니다.
          </p>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {mockNews.slice(0, 4).map((news) => (
            <div key={news.id} style={{ width: "100%" }}>
              <NewsCard
                title={news.title}
                source={news.source}
                sentiment={news.sentiment}
                relatedStock={news.relatedStock}
                summary={news.summary}
              />
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: "50px", textAlign: "center" }}>
          <p style={{ color: "var(--text-sub)", marginBottom: "24px", fontSize: "18px" }}>
            더 많은 실시간 뉴스와 심층 분석을 확인하시려면?
          </p>
          <Link to="/login" className="btn ghost" style={{ textDecoration: "none", display: "inline-block", fontSize: "18px", padding: "16px 32px" }}>
            로그인 후 이용하기
          </Link>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;