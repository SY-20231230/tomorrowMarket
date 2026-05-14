import React from "react";
import "./MarketIndexCard.css";

type MarketIndexCardProps = {
  name: string;
  value: number;
  changeRate: number;
  prediction?: "긍정" | "부정";
  onAction?: (mode: "past" | "ai") => void;
};

function MarketIndexCard({ name, value, changeRate, prediction = "긍정", onAction }: MarketIndexCardProps) {
  const isPositive = changeRate >= 0;
  
  // 코스피/코스닥 여부 확인
  const isIndex = name === "KOSPI" || name === "KOSDAQ";

  return (
    <div className="market-index-card">
      <div className="card-top">
        <p className="market-index-name">{name}</p>
        {isIndex && (
          <div className={`status-pill ${prediction === "긍정" ? "positive" : "negative"}`}>
            {prediction}
          </div>
        )}
      </div>

      <h3 className="market-index-value">
        {value.toLocaleString()}
      </h3>

      <p className={isPositive ? "market-rate positive" : "market-rate negative"}>
        {isPositive ? "+" : ""}
        {changeRate}%
      </p>

      {/* 액션 버튼 그룹 */}
      <div className={`card-actions ${!isIndex ? "single" : ""}`}>
        <button className="mini-btn mini-btn-past" onClick={() => onAction?.("past")}>
          📊 조회
        </button>
        {isIndex && (
          <button className="mini-btn mini-btn-ai" onClick={() => onAction?.("ai")}>
            🤖 AI 예측
          </button>
        )}
      </div>

      <svg className="sparkline" viewBox="0 0 300 70" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${name}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path 
          className="area" 
          d={isPositive 
            ? "M0 52 L42 46 L80 49 L122 31 L160 37 L205 22 L248 30 L300 12 L300 70 L0 70 Z"
            : "M0 24 L44 30 L88 26 L132 38 L176 35 L220 47 L260 44 L300 56 L300 70 L0 70 Z"} 
          fill={`url(#grad-${name})`}
        />
        <path 
          d={isPositive 
            ? "M0 52 L42 46 L80 49 L122 31 L160 37 L205 22 L248 30 L300 12"
            : "M0 24 L44 30 L88 26 L132 38 L176 35 L220 47 L260 44 L300 56"}
          fill="none" 
          stroke={isPositive ? "#10b981" : "#ef4444"} 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );
}

export default MarketIndexCard;