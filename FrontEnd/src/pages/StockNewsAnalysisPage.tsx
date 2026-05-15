import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell 
} from "recharts";
import "./StockNewsAnalysisPage.css";

const StockNewsAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [activeTab, setActiveTab] = useState("전체 뉴스");

  // Mock Stock Info (Normally fetched by code)
  const stockInfo = {
    name: "삼성전자",
    code: code || "005930",
    price: "78,900",
    change: "+1,770 (+2.31%)",
    date: "05.22 15:30 기준",
    newsCount: 62,
    posRatio: 68
  };

  // Mock Sentiment Trend Data
  const trendData = [
    { name: "05/16", pos: 70, neg: 10, neutral: 20 },
    { name: "05/17", pos: 75, neg: 12, neutral: 13 },
    { name: "05/18", pos: 68, neg: 15, neutral: 17 },
    { name: "05/19", pos: 72, neg: 10, neutral: 18 },
    { name: "05/20", pos: 78, neg: 8, neutral: 14 },
    { name: "05/21", pos: 82, neg: 5, neutral: 13 },
    { name: "05/22", pos: 85, neg: 5, neutral: 10 },
  ];

  // Mock News Timeline
  const newsTimeline = [
    {
      time: "09:00",
      elapsed: "5분 전",
      source: "연합뉴스",
      sentiment: "positive",
      score: 85,
      title: "삼성전자, AI 반도체 차세대 HBM4 양산 준비 본격화",
      summary: "삼성전자가 차세대 고대역폭 메모리(HBM4) 양산을 위한 파일럿 생산을 시작했다는 소식이 전해졌습니다.",
      impact: "상승",
      impactLevel: "HIGH",
      tags: ["AI 반도체", "HBM", "메모리"]
    },
    {
      time: "11:20",
      elapsed: "2시간 전",
      source: "머니투데이",
      sentiment: "positive",
      score: 72,
      title: "외국인, 삼성전자 3거래일 연속 순매수... 반도체 업황 개선 기대",
      summary: "외국인 투자자가 삼성전자를 3거래일 연속 순매수하며 반도체 업황 개선에 대한 기대감이 커지고 있습니다.",
      impact: "상승",
      impactLevel: "MEDIUM",
      tags: ["수급", "반도체", "외국인"]
    },
    {
      time: "14:10",
      elapsed: "3시간 전",
      source: "한국경제",
      sentiment: "negative",
      score: 48,
      title: "스마트폰 시장 성장 둔화 전망... 삼성전자 모바일 사업 부담 우려",
      summary: "글로벌 스마트폰 시장 성장률이 둔화될 것이란 전망이 나오면서 삼성전자 모바일 사업의 실적 부담이 커질 수 있다는 분석이 제기되었습니다.",
      impact: "하락",
      impactLevel: "MEDIUM",
      tags: ["스마트폰", "모바일", "시장전망"]
    }
  ];

  const sentimentPieData = [
    { name: "긍정", value: 68, color: "#10b981" },
    { name: "중립", value: 22, color: "#f59e0b" },
    { name: "부정", value: 10, color: "#ef4444" },
  ];

  return (
    <div className="analysis-page">
      {/* Navigation Breadcrumb */}
      <div className="analysis-nav">
        <button className="nav-back-btn" onClick={() => navigate(-1)}>
          ← 특정 주식 조회 &gt; {stockInfo.name} ({stockInfo.code}) &gt; 뉴스
        </button>
      </div>

      <div className="analysis-layout">
        {/* Left Column: Analysis Dashboard */}
        <main className="analysis-main">
          <header className="analysis-header">
            <div className="header-left">
              <div className="title-group">
                <h1 className="stock-title">{stockInfo.name} 뉴스 분석 <span className="stock-code">{stockInfo.code}</span></h1>
                <button className="ai-briefing-btn">✨ AI 요약 브리핑</button>
              </div>
              <div className="price-info">
                <span className="current-price">{stockInfo.price}</span>
                <span className="price-change">{stockInfo.change}</span>
                <span className="price-date">{stockInfo.date}</span>
              </div>
            </div>
            <div className="header-right">
              <p className="summary-desc">
                최근 3일간 {stockInfo.name} 관련 뉴스는 총 {stockInfo.newsCount}건으로, 긍정 뉴스 비율이 {stockInfo.posRatio}%입니다. 
                AI 분석 결과 단기적으로 주가에 긍정적 영향을 미칠 가능성이 높습니다.
              </p>
            </div>
          </header>

          <nav className="analysis-tabs">
            <div className="tabs-left">
              {["전체 뉴스", "AI 요약", "긍정 뉴스", "부정 뉴스"].map(tab => (
                <button 
                  key={tab} 
                  className={`analysis-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="tabs-right">
              <select className="analysis-select"><option>전체 기간</option></select>
              <select className="analysis-select"><option>최신순</option></select>
              <button className="filter-btn">필터</button>
            </div>
          </nav>

          <div className="news-timeline">
            {newsTimeline.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-marker">
                  <span className="time-text">{item.time}</span>
                  <span className="elapsed-text">{item.elapsed}</span>
                  <div className={`marker-dot ${item.sentiment}`}></div>
                </div>
                <div className="news-content-card">
                  <div className="card-top">
                    <span className="source-text">{item.source}</span>
                    <span className={`sentiment-score-tag ${item.sentiment}`}>
                      {item.sentiment === "positive" ? "긍정" : "부정"} {item.score}
                    </span>
                  </div>
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-summary">{item.summary}</p>
                  <div className="card-footer">
                    <div className="tag-group">
                      {item.tags.map(tag => <span key={tag} className="news-tag">#{tag}</span>)}
                    </div>
                    <div className="impact-indicator">
                      <div className="impact-info">
                        <span className="label">시장 영향</span>
                        <span className={`value ${item.sentiment}`}>{item.impact}</span>
                      </div>
                      <div className="impact-level">
                        <span className="label">예상 영향도</span>
                        <span className={`level-bar ${item.impactLevel.toLowerCase()}`}>{item.impactLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="more-news-btn">더 많은 뉴스 보기 ∨</button>
          </div>
        </main>

        {/* Right Column: Sidebar Widgets */}
        <aside className="analysis-sidebar">
          <section className="sidebar-card">
            <h3 className="card-title">현재 감성 지수</h3>
            <div className="gauge-container">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={sentimentPieData}
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={180}
                    endAngle={0}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {sentimentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="gauge-center">
                <span className="gauge-value">{stockInfo.posRatio}</span>
                <span className="gauge-label">/ 100</span>
                <div className="gauge-status positive">긍정</div>
              </div>
              <div className="gauge-legend">
                <div className="legend-item"><span className="dot pos"></span> 긍정 68%</div>
                <div className="legend-item"><span className="dot neutral"></span> 중립 22%</div>
                <div className="legend-item"><span className="dot neg"></span> 부정 10%</div>
              </div>
            </div>
          </section>

          <section className="sidebar-card">
            <h3 className="card-title">감성 추이 <span className="info-tip">?</span></h3>
            <div className="trend-chart-container">
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={trendData}>
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px" }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  <Line type="monotone" dataKey="pos" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="neg" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="sidebar-card">
            <h3 className="card-title">AI 종합 의견 <span className="info-tip">?</span></h3>
            <div className="ai-opinion-content">
              <div className="opinion-header">
                <div className="ai-bot-icon">AI</div>
                <p className="opinion-desc">
                  최근 삼성전자 관련 뉴스는 전반적으로 긍정적 흐름이 우세합니다.
                  AI 분석 결과 단기 5일 내 주가 상승 확률은 64%로 예측됩니다.
                </p>
              </div>
              <div className="opinion-metrics">
                <div className="metric-box">
                  <span className="m-label">상승 확률</span>
                  <span className="m-value pos">64%</span>
                </div>
                <div className="metric-box">
                  <span className="m-label">하락 확률</span>
                  <span className="m-value neg">36%</span>
                </div>
                <div className="metric-box">
                  <span className="m-label">예상 방향</span>
                  <span className="m-value pos">↑ 상승</span>
                </div>
              </div>
              <div className="opinion-reasons">
                <span className="reason-title">주요 근거</span>
                <ul className="reason-list">
                  <li>AI 반도체 및 HBM 관련 호재 지속</li>
                  <li>외국인 순매수 지속으로 수급 개선</li>
                  <li>메모리 가격 반등 기대감 유효</li>
                </ul>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default StockNewsAnalysisPage;
