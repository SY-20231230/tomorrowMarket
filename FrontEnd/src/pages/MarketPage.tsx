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
import { useLocation } from "react-router-dom"; // 추가
import SectionTitle from "../components/common/SectionTitle";
import MarketSummary from "../components/market/MarketSummary";
import PredictionPanel from "../components/ai/PredictionPanel";
import Card from "../components/common/Card";

import { mockMarket } from "../data/mockMarket";
import "../styles/StockDetailPage.css";

function MarketPage() {
  const location = useLocation(); // 추가
  
  // 1. 상태 관리
  const [selectedMarket, setSelectedMarket] = useState(mockMarket[0]);
  const [viewMode, setViewMode] = useState<"past" | "ai">("past");
  const [pastRange, setPastRange] = useState("1주일");
  const [aiRange, setAiRange] = useState<"short" | "long">("short");

  const resultRef = useRef<HTMLDivElement>(null);

  // 자동 랜딩 로직 추가
  useEffect(() => {
    if (location.state) {
      const { marketName, mode } = location.state as { marketName: string, mode: "past" | "ai" };
      if (marketName && mode) {
        handleMarketAction(marketName, mode);
      }
    }
  }, [location.state]);

  // 차트 데이터 생성 (Mock)
  const chartData = useMemo(() => {
    const dataCount = viewMode === "past" ? 7 : (aiRange === "short" ? 6 : 21);
    let baseValue = selectedMarket.value;
    const result = [];
    
    for (let i = 0; i < dataCount; i++) {
      const date = new Date();
      if (viewMode === "past") {
        date.setDate(date.getDate() - (dataCount - 1 - i));
      } else {
        date.setDate(date.getDate() + i);
      }
      
      const randomChange = (Math.random() - 0.5) * (selectedMarket.value * 0.01);
      baseValue += randomChange;
      
      result.push({
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        value: parseFloat(baseValue.toFixed(2))
      });
    }
    return result;
  }, [selectedMarket, viewMode, aiRange, pastRange]);

  // 2. 핸들러
  const handleMarketAction = (marketName: string, mode: "past" | "ai") => {
    const market = mockMarket.find(m => m.name === marketName);
    if (market) {
      setSelectedMarket(market);
      setViewMode(mode);
      
      // 자동 스크롤
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  return (
    <div className="market-page">
      <SectionTitle
        title="종합지수 조회"
        description="코스피, 코스닥, 환율, 금리 등 시장 전체 흐름과 AI 예측을 확인하세요."
      />

      {/* 시장 요약 카드 그리드 */}
      <MarketSummary onAction={handleMarketAction} />

      {/* --- 상세 결과 및 차트 영역 --- */}
      <div ref={resultRef} className="result-display-area" style={{ marginTop: "40px" }}>
        <div className="chart-header">
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 950, color: "#fff", marginBottom: "8px" }}>
              {selectedMarket.name} <span style={{ color: "var(--text-soft)", fontSize: "16px" }}>시장 상세 분석</span>
            </h2>
            <p style={{ color: viewMode === "past" ? "#22d3ee" : "#10b981", fontWeight: 800 }}>
              {viewMode === "past" ? `● ${selectedMarket.name} 과거 지수 추이` : `● ${selectedMarket.name} AI 지수 예측 시나리오`}
            </p>
          </div>

          {/* 탭 전환 (환율/금리는 과거 모드 고정) */}
          {(viewMode === "past" || (selectedMarket.name !== "KOSPI" && selectedMarket.name !== "KOSDAQ")) ? (
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

        {/* 지수 차트 */}
        <div style={{ width: "100%", height: "350px", marginTop: "20px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValueMarket" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="value" 
                stroke={viewMode === "past" ? "#22d3ee" : "#10b981"} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorValueMarket)" 
                dot={{ r: 4, fill: viewMode === "past" ? "#22d3ee" : "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- AI 심층 분석 섹션 (지수일 때만 노출) --- */}
      {(selectedMarket.name === "KOSPI" || selectedMarket.name === "KOSDAQ") && (
        <section style={{ marginTop: "40px" }}>
          <PredictionPanel
            title={`${selectedMarket.name} AI 감성 분석 리포트`}
            probability={selectedMarket.name === "KOSPI" ? 82 : 45}
            opinion={`현재 ${selectedMarket.name} 시장은 주요 거시 경제 지표와 수급 데이터를 분석한 결과, AI 모델이 예측하는 시장 심리는 '${selectedMarket.name === "KOSPI" ? "긍정" : "부정"}' 상태입니다. 투자에 유의하시기 바랍니다.`}
            sentiment={selectedMarket.name === "KOSPI" ? "긍정" : "부정"}
            riskLevel={selectedMarket.name === "KOSPI" ? "보통" : "높음"}
          />
        </section>
      )}

      {/* --- 수급/매크로 요약 --- */}
      <section style={{ marginTop: "40px", marginBottom: "60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <Card>
            <h3 style={{ fontWeight: 950, marginBottom: "15px" }}>💹 외국인/기관 수급</h3>
            <p style={{ color: "var(--text-soft)", lineHeight: "1.6" }}>
              최근 5거래일간 외국인은 IT/반도체 섹터를 중심으로 순매수세를 유지하고 있으며, 기관은 배당주 중심의 방어적 포지션을 취하고 있습니다.
            </p>
          </Card>
          <Card>
            <h3 style={{ fontWeight: 950, marginBottom: "15px" }}>🌐 글로벌 매크로 동향</h3>
            <p style={{ color: "var(--text-soft)", lineHeight: "1.6" }}>
              미국 고용 지표 발표를 앞두고 금리 인하 기대감이 선반영되고 있으나, 지정학적 리스크에 따른 유가 변동성이 국내 시장에 부담으로 작용할 수 있습니다.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default MarketPage;