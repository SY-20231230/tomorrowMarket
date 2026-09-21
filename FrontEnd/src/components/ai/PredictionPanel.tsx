import React, { useState } from "react";
import "./PredictionPanel.css";

type PredictionData = {
  horizon: string;
  predictedReturnRate: number;
  predictedDirection: string;
  opinion: string;
};

type PredictionPanelProps = {
  predictions?: PredictionData[];
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
};

const defaultPredictions: PredictionData[] = [
  { horizon: "단기 (7일)", predictedReturnRate: 3.5, predictedDirection: "UP", opinion: "최근 추세에 따른 단기적 상승이 예측됩니다." },
  { horizon: "중장기 (20일)", predictedReturnRate: -1.2, predictedDirection: "DOWN", opinion: "저항선에 부딪히며 조정될 확률이 있습니다." }
];

function PredictionPanel({
  predictions = defaultPredictions,
  onReanalyze,
  isReanalyzing = false,
}: PredictionPanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  const data = predictions[activeTab] || defaultPredictions[0];

  return (
    <div className="prediction-panel" style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "24px", padding: "30px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#10b981", fontSize: "18px" }}>🤖 내일장 AI 예측</h3>
          <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
            {predictions.map((p, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveTab(idx)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === idx ? "2px solid var(--cyan)" : "2px solid transparent",
                  color: activeTab === idx ? "var(--cyan)" : "var(--text-soft)",
                  padding: "4px 8px",
                  fontSize: "14px",
                  fontWeight: activeTab === idx ? "bold" : "normal",
                  cursor: "pointer",
                  transition: "0.2s"
                }}
              >
                {p.horizon}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <span style={{ fontSize: "28px", fontWeight: "950", color: data.predictedDirection === "UP" ? "#22c55e" : "#ef4444" }}>
            {data.predictedDirection === "UP" ? "상승 예측" : "하락 예측"}
          </span>
          <span style={{ fontSize: "24px", fontWeight: "900", color: data.predictedDirection === "UP" ? "#22c55e" : "#ef4444" }}>
            {data.predictedReturnRate > 0 ? "+" : ""}{data.predictedReturnRate.toFixed(1)}%
          </span>
        </div>
        
        <div style={{ marginTop: "30px", padding: "20px", background: "rgba(0,0,0,0.2)", borderRadius: "16px" }}>
          <p style={{ margin: "0 0 10px 0", color: "var(--text-soft)", fontSize: "14px" }}>AI 종합 의견</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px" }}>{data.opinion}</span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginTop: "12px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, Math.abs(data.predictedReturnRate) * 10)}%`, height: "100%", background: data.predictedDirection === "UP" ? "var(--cyan)" : "#ef4444", transition: "width 0.5s ease" }}></div>
          </div>
        </div>
      </div>

      <button 
        onClick={onReanalyze}
        disabled={isReanalyzing}
        style={{
          width: "100%", padding: "16px", borderRadius: "12px", border: "none",
          background: isReanalyzing ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #059669, #10b981)",
          color: isReanalyzing ? "var(--text-soft)" : "white",
          fontSize: "16px", fontWeight: "bold", cursor: isReanalyzing ? "not-allowed" : "pointer",
          marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"
        }}
      >
        {isReanalyzing ? "⏳ 시장 데이터 분석 중..." : "🔄 전체 기간(단기/장기) 종합 AI 재분석 요청"}
      </button>
    </div>
  );
}

export default PredictionPanel;