import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import SectionTitle from "../components/common/SectionTitle";
import StockCard from "../components/stock/StockCard";
import NewsCard from "../components/news/NewsCard";
import PredictionPanel from "../components/ai/PredictionPanel";

import { mockStocks } from "../data/mockStocks";
import { mockNews } from "../data/mockNews";
import "../styles/StockDetailPage.css";

function StockDetailPage() {
  // 1. 상태 관리
  const [displayedStock, setDisplayedStock] = useState(
    mockStocks.find(s => s.code === "005930") || mockStocks[0]
  );
  const [tempMarket, setTempMarket] = useState<"KOSPI" | "KOSDAQ">(displayedStock.market);
  const [tempSelectedCode, setTempSelectedCode] = useState(displayedStock.code);
  
  // 뷰 모드 및 기간 설정
  const [viewMode, setViewMode] = useState<"past" | "ai">("past");
  const [pastRange, setPastRange] = useState("1주일");
  const [aiRange, setAiRange] = useState<"short" | "long">("short");

  const resultRef = useRef<HTMLDivElement>(null);

  // 2. 데이터 처리
  const filteredStocks = useMemo(() => {
    return mockStocks
      .filter(s => s.market === tempMarket)
      .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  }, [tempMarket]);

  // 차트 데이터 생성 (Mock)
  const chartData = useMemo(() => {
    const dataCount = viewMode === "past" ? 7 : (aiRange === "short" ? 6 : 21);
    let basePrice = displayedStock.price;
    const result = [];
    
    for (let i = 0; i < dataCount; i++) {
      const date = new Date();
      if (viewMode === "past") {
        date.setDate(date.getDate() - (dataCount - 1 - i));
      } else {
        date.setDate(date.getDate() + i);
      }
      
      const randomChange = (Math.random() - 0.5) * 2000;
      basePrice += randomChange;
      
      result.push({
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        price: Math.round(basePrice)
      });
    }
    return result;
  }, [displayedStock, viewMode, aiRange, pastRange]);

  // 3. 핸들러
  const handleAction = (mode: "past" | "ai") => {
    const selected = mockStocks.find(s => s.code === tempSelectedCode);
    if (selected) {
      setDisplayedStock(selected);
      setViewMode(mode);
      
      // 자동 스크롤
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  return (
    <div className="stock-detail-page">
      <SectionTitle
        title="특정 주식 조회"
        description="시장과 종목을 선택하여 과거 추세와 AI 예측 시나리오를 확인하세요."
      />

      {/* --- 검색 및 선택 시스템 --- */}
      <div className="stock-search-container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
          <div>
            <span className="search-label">1단계: 시장 선택</span>
            <div className="market-tabs">
              <button 
                className={`market-tab ${tempMarket === "KOSPI" ? "active" : ""}`}
                onClick={() => setTempMarket("KOSPI")}
              >
                KOSPI
              </button>
              <button 
                className={`market-tab ${tempMarket === "KOSDAQ" ? "active" : ""}`}
                onClick={() => setTempMarket("KOSDAQ")}
              >
                KOSDAQ
              </button>
            </div>
          </div>

          <div className="stock-selection-wrapper">
            <span className="search-label">2단계: 기업 선택 ({filteredStocks.length}개)</span>
            <div className="stock-scroll-list">
              {filteredStocks.map((stock) => (
                <div 
                  key={stock.code}
                  className={`stock-item ${tempSelectedCode === stock.code ? "selected" : ""}`}
                  onClick={() => setTempSelectedCode(stock.code)}
                >
                  <span className="stock-item-name">{stock.name}</span>
                  <span className="stock-item-code">{stock.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 이원화된 조회 버튼 */}
        <div className="action-button-group">
          <button className="btn-base btn-past" onClick={() => handleAction("past")}>
             📊 과거 주가 조회
          </button>
          <button className="btn-base btn-ai" onClick={() => handleAction("ai")}>
             🤖 AI 예측 조회
          </button>
        </div>
      </div>

      {/* --- 결과 표시 영역 (차트 통합) --- */}
      <div ref={resultRef} className="result-display-area">
        <div className="chart-header">
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 950, color: "#fff", marginBottom: "8px" }}>
              {displayedStock.name} <span style={{ color: "var(--text-soft)", fontSize: "16px" }}>{displayedStock.code}</span>
            </h2>
            <p style={{ color: viewMode === "past" ? "#22d3ee" : "#10b981", fontWeight: 800 }}>
              {viewMode === "past" ? "● 최근 과거 주가 흐름 분석" : "● AI 기반 향후 주가 예측 시나리오"}
            </p>
          </div>

          {/* 탭 전환 (모드에 따라 다름) */}
          {viewMode === "past" ? (
            <div className="time-range-tabs">
              {["1주일", "3개월", "1년", "3년", "10년"].map(range => (
                <button 
                  key={range}
                  className={`range-tab ${pastRange === range ? "active" : ""}`}
                  onClick={() => setPastRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          ) : (
            <div className="ai-toggle-tabs">
              <button 
                className={`ai-tab ${aiRange === "short" ? "active" : ""}`}
                onClick={() => setAiRange("short")}
              >
                단기 (5일)
              </button>
              <button 
                className={`ai-tab ${aiRange === "long" ? "active" : ""}`}
                onClick={() => setAiRange("long")}
              >
                장기 (20일)
              </button>
            </div>
          )}
        </div>

        {/* 통합 차트 */}
        <div style={{ width: "100%", height: "400px", marginTop: "20px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={viewMode === "past" ? "#22d3ee" : "#10b981"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={viewMode === "past" ? "#22d3ee" : "#10b981"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-soft)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#fff" }}
                itemStyle={{ color: viewMode === "past" ? "#22d3ee" : "#10b981", fontWeight: 900 }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={viewMode === "past" ? "#22d3ee" : "#10b981"} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                dot={{ r: 4, fill: viewMode === "past" ? "#22d3ee" : "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 주가 요약 카드 (차트 하단 배치) */}
        <div style={{ marginTop: "30px" }}>
           <StockCard
            name={displayedStock.name}
            price={displayedStock.price}
            changeRate={displayedStock.changeRate}
            prediction={displayedStock.prediction}
          />
        </div>
      </div>

      {/* --- 분석 리포트 섹션 --- */}
      <section style={{ marginTop: "40px" }}>
        <PredictionPanel
          title={`${displayedStock.name} ${viewMode === "past" ? "최근 동향 리포트" : "AI 전망 분석"}`}
          probability={displayedStock.changeRate >= 0 ? 85 : 42}
          opinion={`${displayedStock.name} 종목은 ${viewMode === "past" ? "지난 기간 동안의 수급 분석 결과" : "향후 시장 지표 예측 결과"}, ${displayedStock.prediction} 양상을 보이고 있습니다.`}
          sentiment={displayedStock.prediction}
          riskLevel={Math.abs(displayedStock.changeRate) > 2 ? "높음" : "보통"}
        />
      </section>

      {/* --- 관련 뉴스 섹션 --- */}
      <section style={{ marginTop: "40px", marginBottom: "60px" }}>
        <SectionTitle title="종목 관련 뉴스" />
        <div style={{ display: "grid", gap: "20px" }}>
          {mockNews.slice(0, 3).map((news) => (
            <NewsCard
              key={news.id}
              title={news.title.replace("삼성전자", displayedStock.name)}
              source={news.source}
              sentiment={news.sentiment}
              relatedStock={displayedStock.name}
              summary={news.summary}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default StockDetailPage;